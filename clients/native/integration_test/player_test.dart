import 'dart:io';
import 'dart:typed_data';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:media_kit/media_kit.dart';
import 'package:music_flow/main.dart';
import 'package:music_flow/music_controller.dart';

Future<void> wave(File file, int frequency) async {
  const rate = 16000, samples = rate * 12;
  final bytes = ByteData(44 + samples * 2);
  void text(int offset, String s) { for (var i=0; i<s.length; i++) { bytes.setUint8(offset+i,s.codeUnitAt(i)); } }
  text(0,'RIFF'); bytes.setUint32(4,bytes.lengthInBytes-8,Endian.little); text(8,'WAVEfmt ');
  bytes.setUint32(16,16,Endian.little); bytes.setUint16(20,1,Endian.little); bytes.setUint16(22,1,Endian.little);
  bytes.setUint32(24,rate,Endian.little); bytes.setUint32(28,rate*2,Endian.little); bytes.setUint16(32,2,Endian.little); bytes.setUint16(34,16,Endian.little);
  text(36,'data'); bytes.setUint32(40,samples*2,Endian.little);
  for(var i=0;i<samples;i++) { bytes.setInt16(44+i*2,(math.sin(2*math.pi*frequency*i/rate)*1500).round(),Endian.little); }
  await file.writeAsBytes(bytes.buffer.asUint8List());
}
Future<void> waitFor(WidgetTester tester, bool Function() condition, String message) async {
  final until = DateTime.now().add(const Duration(seconds: 20));
  while(!condition() && DateTime.now().isBefore(until)) { await tester.pump(const Duration(milliseconds: 100)); await Future<void>.delayed(const Duration(milliseconds: 100)); }
  expect(condition(), isTrue, reason: message);
}
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  MediaKit.ensureInitialized();
  testWidgets('native decoder playback, seek, queue, persisted library and UI', (tester) async {
    final dir = await Directory.systemTemp.createTemp('musicflow-test-');
    final first=File('${dir.path}/Smoke Alpha.wav'), second=File('${dir.path}/Smoke Beta.wav');
    await wave(first,440); await wave(second,660);
    final c=await MusicController.create(directory:dir, useSystemSession:Platform.isAndroid || Platform.isIOS);
    try {
      // The hosted Windows runner has no usable audio endpoint. This is a
      // test-only output driver, never selected by the shipping application.
      const headless = bool.fromEnvironment('MUSIC_FLOW_HEADLESS_AUDIO');
      if (headless) {
        expect(Platform.isWindows, isTrue);
        final native = c.player.platform as NativePlayer;
        await native.setProperty('ao', 'null');
        debugPrint('HEADLESS: native decoding and timing, not physical speaker output');
      }
      await c.importFiles([first.path,second.path]);
      expect(c.library.length,2);
      await tester.pumpWidget(MusicFlow(controller:c));
      await tester.pump();
      final songTile = find.byKey(const ValueKey('song-Smoke Alpha'));
      await tester.ensureVisible(songTile);
      expect(songTile.hitTestable(), findsOneWidget);
      final errors = <String>[];
      final errorSubscription = c.player.stream.error.listen(errors.add);
      try {
        await tester.tap(songTile);
        await waitFor(tester,()=>c.current?.title=='Smoke Alpha' && c.playing && c.position.inMilliseconds>200 && c.duration.inSeconds>=11,'real native position advances');
      } catch (_) {
        debugPrint('Playback diagnostics: playing=${c.playing}, position=${c.position}, duration=${c.duration}, current=${c.current?.title}, busy=${c.busy}, error=${c.error}, nativeErrors=$errors');
        rethrow;
      } finally {
        await errorSubscription.cancel();
      }
      expect(c.error, isNull);
      if (headless) {
        final native = c.player.platform as NativePlayer;
        expect(await native.getProperty('current-ao'), 'null');
      }
      if (c.handler != null) { await c.handler!.pause(); } else { await c.pause(); }
      await waitFor(tester,()=>!c.playing,'pause');
      await c.seek(const Duration(seconds:6));
      await waitFor(tester,()=> (c.position.inMilliseconds-6000).abs()<1000,'seek');
      await c.setVolume(45);
      if (c.handler != null) { await c.handler!.play(); } else { await c.play(); }
      await waitFor(tester,()=>c.playing,'resume');
      await c.next();
      await waitFor(tester,()=>c.current?.title=='Smoke Beta' && c.playing,'next song');
      await c.toggleFavorite(c.library.first);
      await c.pause();
      await tester.pump();
      expect(find.text('Music Flow'),findsOneWidget);
      final restored=await MusicController.create(directory:dir,useSystemSession:false);
      try { expect(restored.library.length,2); expect(restored.favorites.contains(restored.library.first.id),isTrue); }
      finally { await restored.close(); }
      debugPrint('PASS: native audio decode, play, pause, resume, seek, queue, persistence and UI');
    } finally { await tester.pumpWidget(const SizedBox()); await c.close(); await dir.delete(recursive:true); }
  });
}
