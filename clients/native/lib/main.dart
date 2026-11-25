import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:media_kit/media_kit.dart';
import 'music_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  MediaKit.ensureInitialized();
  try {
    final controller = await MusicController.create();
    runApp(MusicFlow(controller: controller));
  } catch (error) {
    runApp(MaterialApp(home: Scaffold(body: Center(child: Text('播放器初始化失败：$error')))));
  }
}

class MusicFlow extends StatefulWidget {
  const MusicFlow({super.key, required this.controller});
  final MusicController controller;
  @override State<MusicFlow> createState() => _MusicFlowState();
}
class _MusicFlowState extends State<MusicFlow> {
  ThemeMode theme = ThemeMode.dark;
  @override Widget build(BuildContext context) => MaterialApp(
    title: 'Music Flow', debugShowCheckedModeBanner: false,
    theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff635bdb)), useMaterial3: true),
    darkTheme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xffaaa0ff), brightness: Brightness.dark), useMaterial3: true, scaffoldBackgroundColor: const Color(0xff111119)),
    themeMode: theme,
    home: PlayerScreen(controller: widget.controller, toggleTheme: () => setState(() => theme = theme == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark)),
  );
}

class PlayerScreen extends StatefulWidget {
  const PlayerScreen({super.key, required this.controller, required this.toggleTheme});
  final MusicController controller;
  final VoidCallback toggleTheme;
  @override State<PlayerScreen> createState() => _PlayerScreenState();
}
class _PlayerScreenState extends State<PlayerScreen> {
  int tab = 0;
  String query = '';
  final search = TextEditingController();
  MusicController get c => widget.controller;
  @override void dispose() { search.dispose(); super.dispose(); }
  Future<void> pick() async {
    try {
      final files = await FilePicker.platform.pickFiles(allowMultiple: true, type: FileType.custom, allowedExtensions: ['mp3','wav','flac','ogg','opus','aac','m4a','aiff','alac']);
      if (files != null) await c.importFiles(files.paths.whereType<String>().toList());
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('无法导入：$error')));
    }
  }
  String clock(Duration d) => '${d.inMinutes}:${(d.inSeconds % 60).toString().padLeft(2, '0')}';
  @override Widget build(BuildContext context) => ListenableBuilder(listenable: c, builder: (context, _) => LayoutBuilder(builder: (context, size) {
    final wide = size.maxWidth >= 850;
    final colors = Theme.of(context).colorScheme;
    final songs = (tab == 1 ? c.library.where((s) => c.favorites.contains(s.id)) : c.library).where((s) => s.title.toLowerCase().contains(query.toLowerCase())).toList();
    return Scaffold(
      appBar: AppBar(
        title: const Row(children: [Icon(Icons.graphic_eq_rounded), SizedBox(width: 10), Text('Music Flow', style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5))]),
        actions: [IconButton(onPressed: widget.toggleTheme, tooltip: '切换主题', icon: const Icon(Icons.contrast)), const SizedBox(width: 8)],
      ),
      body: SafeArea(child: Row(children: [
        if (wide) NavigationRail(
          selectedIndex: tab, onDestinationSelected: (i) => setState(() => tab = i),
          labelType: NavigationRailLabelType.all,
          destinations: const [NavigationRailDestination(icon: Icon(Icons.library_music_outlined), selectedIcon: Icon(Icons.library_music), label: Text('音乐库')), NavigationRailDestination(icon: Icon(Icons.favorite_border), selectedIcon: Icon(Icons.favorite), label: Text('收藏'))],
        ),
        Expanded(child: Column(children: [
          Expanded(child: CustomScrollView(slivers: [
            SliverPadding(padding: const EdgeInsets.fromLTRB(20, 12, 20, 8), sliver: SliverToBoxAdapter(child: Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(28), gradient: const LinearGradient(colors: [Color(0xff5348bd), Color(0xff282052)], begin: Alignment.topLeft, end: Alignment.bottomRight)),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('YOUR SOUND, YOUR SPACE', style: TextStyle(color: Color(0xffdcd7ff), fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.5)),
                  const SizedBox(height: 9),
                  Text(tab == 1 ? '我的收藏' : '聆听你的世界', style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 5), Text('${c.library.length} 首本地音乐 · 原生音频', style: const TextStyle(color: Color(0xffe3dfff))),
                  const SizedBox(height: 16),
                  FilledButton.icon(onPressed: c.busy ? null : pick, icon: const Icon(Icons.add), label: const Text('导入音乐')),
                ])),
                if (size.maxWidth > 470) const Icon(Icons.album_rounded, size: 112, color: Color(0xffb6acff)),
              ]),
            ))),
            SliverPadding(padding: const EdgeInsets.fromLTRB(20, 8, 20, 12), sliver: SliverToBoxAdapter(child: Column(children: [
              TextField(controller: search, onChanged: (text) => setState(() => query = text), decoration: InputDecoration(prefixIcon: const Icon(Icons.search), hintText: '搜索本地音乐', filled: true, border: OutlineInputBorder(borderRadius: BorderRadius.circular(18), borderSide: BorderSide.none))),
              if (c.error != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(c.error!, style: TextStyle(color: colors.error))),
              Row(children: [Expanded(child: Text(tab == 1 ? '收藏歌曲' : '全部歌曲', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))), TextButton.icon(onPressed: songs.isEmpty || c.busy ? null : () => c.playSongs(songs, 0), icon: const Icon(Icons.play_arrow), label: const Text('播放全部'))]),
            ]))),
            if (songs.isEmpty) const SliverToBoxAdapter(child: Padding(padding: EdgeInsets.all(36), child: Center(child: Text('暂无歌曲，导入你喜欢的音乐')))),
            SliverPadding(padding: const EdgeInsets.fromLTRB(12, 0, 12, 12), sliver: SliverList.builder(itemCount: songs.length, itemBuilder: (context, i) {
              final song = songs[i], selected = c.current?.id == songs[i].id;
              return Card(elevation: 0, color: selected ? colors.secondaryContainer : Colors.transparent, margin: const EdgeInsets.symmetric(vertical: 2), child: ListTile(
                key: ValueKey('song-${song.title}'), selected: selected, onTap: c.busy ? null : () => c.playSongs(songs, i),
                leading: Container(width: 46, height: 46, decoration: BoxDecoration(color: colors.primaryContainer, borderRadius: BorderRadius.circular(13)), child: Icon(selected && c.playing ? Icons.equalizer : Icons.music_note, color: colors.onPrimaryContainer)),
                title: Text(song.title, maxLines: 1, overflow: TextOverflow.ellipsis), subtitle: Text('本地音乐 · ${song.filename.split('.').last.toUpperCase()}'),
                trailing: IconButton(onPressed: () => c.toggleFavorite(song), tooltip: '收藏', icon: Icon(c.favorites.contains(song.id) ? Icons.favorite : Icons.favorite_border, color: c.favorites.contains(song.id) ? colors.primary : null)),
              ));
            })),
          ])),
          if (c.current != null) _player(context),
        ])),
      ])),
      bottomNavigationBar: wide ? null : NavigationBar(selectedIndex: tab, onDestinationSelected: (i) => setState(() => tab = i), destinations: const [NavigationDestination(icon: Icon(Icons.library_music_outlined), label: '音乐库'), NavigationDestination(icon: Icon(Icons.favorite_border), label: '收藏')]),
    );
  }));
  Widget _player(BuildContext context) {
    final colors = Theme.of(context).colorScheme;
    final max = c.duration.inMilliseconds > 0 ? c.duration.inMilliseconds.toDouble() : 1.0;
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 4, 12, 10), padding: const EdgeInsets.fromLTRB(14, 10, 14, 8),
      decoration: BoxDecoration(color: colors.surfaceContainerHigh, borderRadius: BorderRadius.circular(24), border: Border.all(color: colors.outlineVariant)),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Row(children: [
          Container(width: 42, height: 42, decoration: BoxDecoration(color: colors.primaryContainer, borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.album)),
          const SizedBox(width: 10),
          Expanded(child: Text(c.current!.title, style: const TextStyle(fontWeight: FontWeight.bold), maxLines: 1, overflow: TextOverflow.ellipsis)),
          IconButton(onPressed: c.previous, tooltip: '上一首', icon: const Icon(Icons.skip_previous)),
          IconButton.filled(onPressed: c.busy ? null : c.toggle, tooltip: '播放/暂停', icon: Icon(c.playing ? Icons.pause : Icons.play_arrow)),
          IconButton(onPressed: c.next, tooltip: '下一首', icon: const Icon(Icons.skip_next)),
        ]),
        Row(children: [
          Text(clock(c.position)), Expanded(child: Slider(key: const ValueKey('progress'), value: c.position.inMilliseconds.toDouble().clamp(0, max).toDouble(), max: max, onChanged: c.duration == Duration.zero ? null : (v) => c.seek(Duration(milliseconds: v.round())))), Text(clock(c.duration)),
        ]),
        Row(children: [
          IconButton(onPressed: c.setShuffle, tooltip: '随机播放', color: c.shuffle ? colors.primary : null, icon: const Icon(Icons.shuffle)),
          IconButton(onPressed: c.cycleRepeat, tooltip: '循环播放', color: c.repeat != PlaylistMode.none ? colors.primary : null, icon: Icon(c.repeat == PlaylistMode.single ? Icons.repeat_one : Icons.repeat)),
          const Spacer(), const Icon(Icons.volume_up, size: 18),
          SizedBox(width: 100, child: Slider(value: c.player.state.volume.clamp(0,100).toDouble(), max: 100, onChanged: c.setVolume)),
        ]),
      ]),
    );
  }
}
