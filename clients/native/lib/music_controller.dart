import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:audio_service/audio_service.dart';
import 'package:audio_session/audio_session.dart';
import 'package:flutter/foundation.dart';
import 'package:media_kit/media_kit.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

class Song {
  const Song(this.id, this.title, this.filename);
  final String id, title, filename;
  Map<String, String> toJson() => {'id': id, 'title': title, 'filename': filename};
  factory Song.fromJson(Map<String, dynamic> json) => Song(json['id'] as String, json['title'] as String, json['filename'] as String);
}

class MusicController extends ChangeNotifier {
  MusicController(this.player, this.root) {
    _subs.add(player.stream.playing.listen((_) => _changed()));
    _subs.add(player.stream.position.listen((_) => _changed()));
    _subs.add(player.stream.duration.listen((_) => _changed()));
    _subs.add(player.stream.volume.listen((_) => _changed()));
    _subs.add(player.stream.playlist.listen((_) => _changed()));
    _subs.add(player.stream.completed.listen((_) => _changed()));
    _subs.add(player.stream.error.listen((message) { error = message; _changed(); }));
  }
  final Player player;
  final Directory root;
  final List<StreamSubscription<dynamic>> _subs = [];
  final List<Song> library = [];
  final Set<String> favorites = {};
  List<Song> queue = [];
  String? error;
  bool busy = false, shuffle = false, _closed = false;
  PlaylistMode repeat = PlaylistMode.none;
  AudioSession? session;
  SystemAudioHandler? handler;
  Future<void> _persistTail = Future.value();

  static Future<MusicController> create({Directory? directory, bool useSystemSession = true}) async {
    final root = directory ?? await getApplicationDocumentsDirectory();
    await root.create(recursive: true);
    final controller = MusicController(Player(), root);
    await controller.restore();
    if (useSystemSession && (Platform.isAndroid || Platform.isIOS)) {
      final session = await AudioSession.instance;
      await session.configure(const AudioSessionConfiguration.music());
      controller.session = session;
      controller._subs.add(session.interruptionEventStream.listen((event) {
        if (event.begin) unawaited(controller.pause());
      }));
      controller._subs.add(session.becomingNoisyEventStream.listen((_) => unawaited(controller.pause())));
      final handler = SystemAudioHandler(controller);
      await AudioService.init(builder: () => handler, config: const AudioServiceConfig(
        androidNotificationChannelId: 'com.musicflow.player.playback',
        androidNotificationChannelName: 'Music Flow playback',
        androidNotificationOngoing: true,
      ));
      controller.handler = handler;
    }
    return controller;
  }

  File get _index => File(p.join(root.path, 'music-flow-library.json'));
  Directory get _files => Directory(p.join(root.path, 'music-flow-audio'));
  Song? get current {
    if (queue.isEmpty) return null;
    final i = player.state.playlist.index;
    final medias = player.state.playlist.medias;
    if (i < 0 || i >= medias.length) return null;
    final id = medias[i].extras?['songId'];
    for (final song in queue) { if (song.id == id) return song; }
    return null;
  }
  Duration get position => player.state.position;
  Duration get duration => player.state.duration;
  bool get playing => player.state.playing;

  void _changed() {
    if (_closed) return;
    handler?.publish();
    notifyListeners();
  }

  Future<void> restore() async {
    try {
      if (!await _index.exists()) return;
      final data = jsonDecode(await _index.readAsString()) as Map<String, dynamic>;
      for (final raw in data['songs'] as List<dynamic>) {
        final song = Song.fromJson(raw as Map<String, dynamic>);
        if (p.basename(song.filename) != song.filename) continue;
        if (await File(p.join(_files.path, song.filename)).exists()) library.add(song);
      }
      favorites.addAll((data['favorites'] as List<dynamic>? ?? []).whereType<String>());
    } catch (_) { error = '无法读取本地音乐库'; }
    _changed();
  }

  Future<void> _save() {
    final data = jsonEncode({'songs': library.map((s) => s.toJson()).toList(), 'favorites': favorites.toList()});
    final previous = _persistTail;
    _persistTail = () async {
      try { await previous; } catch (_) {}
      final temporary = File('${_index.path}.tmp');
      await temporary.writeAsString(data, flush: true);
      await temporary.rename(_index.path);
    }();
    return _persistTail;
  }

  Future<void> importFiles(List<String> paths) async {
    if (busy) return;
    busy = true; error = null; _changed();
    var failed = 0;
    try {
      await _files.create(recursive: true);
      for (final path in paths) {
        final ext = p.extension(path).toLowerCase();
        if (!['.wav','.mp3','.flac','.ogg','.opus','.aac','.m4a','.aiff','.alac'].contains(ext)) { failed++; continue; }
        final id = '${DateTime.now().microsecondsSinceEpoch}-${library.length}';
        final name = '$id$ext';
        try {
          await File(path).copy(p.join(_files.path, name));
          library.add(Song(id, p.basenameWithoutExtension(path), name));
        } catch (_) { failed++; }
      }
      await _save();
      if (failed > 0) error = '$failed 首歌曲导入失败';
    } catch (e) { error = '导入失败：$e'; }
    finally { busy = false; _changed(); }
  }

  Future<void> playSongs(List<Song> songs, int index) async {
    if (busy || index < 0 || index >= songs.length) return;
    busy = true; error = null; _changed();
    try {
      if (session != null && !await session!.setActive(true)) throw StateError('音频设备不可用');
      queue = List.of(songs);
      await player.open(Playlist(queue.map((s) => Media(File(p.join(_files.path, s.filename)).uri.toString(), extras: {'songId': s.id})).toList(), index: index));
      await player.setPlaylistMode(repeat);
      await player.setShuffle(shuffle);
    } catch (e) { error = '播放失败：$e'; }
    finally { busy = false; _changed(); }
  }

  Future<void> play() async { if (current == null) return; if (session == null || await session!.setActive(true)) await player.play(); }
  Future<void> pause() => player.pause();
  Future<void> toggle() => playing ? pause() : play();
  Future<void> next() => player.next();
  Future<void> previous() async {
    if (position > const Duration(seconds: 3)) { await seek(Duration.zero); } else { await player.previous(); }
  }
  Future<void> seek(Duration value) => player.seek(value < Duration.zero ? Duration.zero : value > duration ? duration : value);
  Future<void> setVolume(double value) => player.setVolume(value.clamp(0, 100).toDouble());
  Future<void> setShuffle() async { shuffle = !shuffle; await player.setShuffle(shuffle); _changed(); }
  Future<void> cycleRepeat() async {
    repeat = switch (repeat) { PlaylistMode.none => PlaylistMode.loop, PlaylistMode.loop => PlaylistMode.single, PlaylistMode.single => PlaylistMode.none };
    await player.setPlaylistMode(repeat); _changed();
  }
  Future<void> toggleFavorite(Song song) async {
    if (!favorites.add(song.id)) favorites.remove(song.id);
    _changed();
    try { await _save(); } catch (e) { error = '收藏保存失败：$e'; _changed(); }
  }
  Future<void> stop() async { await player.stop(); queue = []; await session?.setActive(false); _changed(); }
  Future<void> close() async {
    _closed = true;
    for (final sub in _subs) { await sub.cancel(); }
    await player.dispose();
    super.dispose();
  }
}

class SystemAudioHandler extends BaseAudioHandler {
  SystemAudioHandler(this.controller);
  final MusicController controller;
  void publish() {
    final song = controller.current;
    if (song != null) {
      mediaItem.add(MediaItem(id: song.id, title: song.title, duration: controller.duration));
    }
    playbackState.add(PlaybackState(
      controls: [MediaControl.skipToPrevious, controller.playing ? MediaControl.pause : MediaControl.play, MediaControl.skipToNext, MediaControl.stop],
      systemActions: const {MediaAction.seek},
      androidCompactActionIndices: const [0, 1, 2],
      processingState: song == null ? AudioProcessingState.idle : controller.player.state.completed ? AudioProcessingState.completed : AudioProcessingState.ready,
      playing: controller.playing,
      updatePosition: controller.position,
      bufferedPosition: controller.duration,
      speed: 1.0,
      queueIndex: song == null ? null : controller.player.state.playlist.index,
    ));
  }
  @override Future<void> play() => controller.play();
  @override Future<void> pause() => controller.pause();
  @override Future<void> seek(Duration position) => controller.seek(position);
  @override Future<void> skipToNext() => controller.next();
  @override Future<void> skipToPrevious() => controller.previous();
  @override Future<void> stop() async { await controller.stop(); await super.stop(); }
}
