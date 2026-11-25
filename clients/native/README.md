# Music Flow native client (v0.3.0 development)

独立 Flutter 客户端使用 media_kit / libmpv 的原生音频解码，不嵌入 Web 播放器。和既有 Web 端使用一致的紫色设计。当前实现本地文件选择、应用内持久化库、搜索、队列、播放/暂停、上一首/下一首、进度、音量、循环、随机、收藏、主题，以及移动系统媒体会话入口。音频标签/封面解析、原生歌词、跨设备同步及系统锁屏控制的实机验证仍未完成。

## Build
Pinned Flutter 3.35.7. From this directory:
```sh
flutter create --no-pub --project-name music_flow --org com.musicflow --platforms=android,ios,windows,macos,linux .
python tool/bootstrap.py
flutter pub get
flutter analyze
```
The platform runners are generated deterministically from the SDK rather than committed as thousands of template lines. Review the generated settings before signing. Run the platform build command on its corresponding OS. Linux requires libmpv2 (development: libmpv-dev), GTK 3 and an audio server.

## Verification
Native CI tests invoke the actual media_kit player with generated PCM WAV audio and check position advancement, playback/pause/seek, queue transitions and persistence. Desktop integration tests and Android emulator are not physical hardware tests. iOS simulator compilation is not a signed IPA. Android test APK uses the default debug signing key; production signing requires a durable private key. No unsigned/test package is an official release.

## Licenses
Native engine and bundled libraries are third-party dependencies; review their licenses, include notices and provide required corresponding source or offers before distributing release binaries (especially libmpv/FFmpeg). Dependency lockfile is generated during initial CI; commit a verified lockfile before release.
