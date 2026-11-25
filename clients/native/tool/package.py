"""Package completed builds and verify SHA-256 without publishing unsigned artifacts."""
import hashlib
import os
from pathlib import Path
import shutil
import subprocess
import sys
root=Path(__file__).resolve().parent.parent
out=root/'release-files'
out.mkdir(exist_ok=True)
target=sys.argv[1]
def run(*args):
    subprocess.run([str(a) for a in args],check=True)
def zipdir(source,name):
    shutil.make_archive(str(out/name),'zip',str(source))
if target=='windows':
    bundle=root/'build/windows/x64/runner/Release'
    assert (bundle/'music_flow.exe').is_file(), 'missing Windows executable'
    zipdir(bundle,'musicflow-v0.3.0-windows-x64-portable')
    iscc=Path(os.environ['ProgramFiles(x86)'])/'Inno Setup 6'/'ISCC.exe'
    if not iscc.exists():
        iscc=Path(os.environ['ProgramFiles'])/'Inno Setup 6'/'ISCC.exe'
    run(iscc, f'/DSourceDir={bundle}', f'/DOutputDir={out}', root/'tool/windows.iss')
elif target=='linux':
    bundle=root/'build/linux/x64/release/bundle'
    assert (bundle/'music_flow').is_file(), 'missing Linux executable'
    shutil.make_archive(str(out/'musicflow-v0.3.0-linux-x64'),'gztar',str(bundle))
    deb=root/'build/deb-package'
    if deb.exists(): shutil.rmtree(deb)
    shutil.copytree(bundle,deb/'opt/musicflow',symlinks=True)
    (deb/'DEBIAN').mkdir()
    (deb/'DEBIAN/control').write_text('Package: musicflow\nVersion: 0.3.0\nArchitecture: amd64\nMaintainer: Music Flow contributors\nDepends: libgtk-3-0t64 | libgtk-3-0, libmpv2, libstdc++6\nDescription: Music Flow native music player\n')
    (deb/'usr/bin').mkdir(parents=True)
    (deb/'usr/bin/musicflow').symlink_to('/opt/musicflow/music_flow')
    (deb/'usr/share/applications').mkdir(parents=True)
    (deb/'usr/share/applications/musicflow.desktop').write_text('[Desktop Entry]\nName=Music Flow\nExec=musicflow\nType=Application\nCategories=Audio;Music;\nTerminal=false\n')
    run('dpkg-deb','--root-owner-group','--build',deb,out/'musicflow-v0.3.0-linux-amd64.deb')
elif target=='macos':
    apps=list((root/'build/macos/Build/Products/Release').glob('*.app'))
    assert len(apps)==1,'missing macOS app'
    app=apps[0]
    staging=root/'build/dmg-stage'
    if staging.exists(): shutil.rmtree(staging)
    staging.mkdir()
    run('ditto',app,staging/'Music Flow.app')
    (staging/'Applications').symlink_to('/Applications')
    run('hdiutil','create','-ov','-volname','Music Flow','-srcfolder',staging,'-format','UDZO',out/'musicflow-v0.3.0-macos-unsigned.dmg')
elif target=='android':
    source=root/'build/app/outputs/flutter-apk/app-release.apk'
    assert source.is_file(),'missing Android APK'
    shutil.copy2(source,out/'musicflow-v0.3.0-android-test-signed.apk')
elif target=='ios':
    source=root/'build/ios/iphonesimulator/Runner.app'
    assert source.is_dir(),'missing simulator app'
    run('ditto','-c','-k','--sequesterRsrc','--keepParent',source,out/'musicflow-v0.3.0-ios-simulator.zip')
else:
    raise ValueError(target)
def digest(file):
    h=hashlib.sha256()
    with file.open('rb') as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()
files=[x for x in sorted(out.iterdir()) if x.is_file() and x.name!='SHA256SUMS.txt']
assert files
checksums=out/'SHA256SUMS.txt'
checksums.write_text(''.join(f'{digest(x)}  {x.name}\n' for x in files))
for line in checksums.read_text().splitlines():
    expected,name=line.split('  ',1)
    assert digest(out/name)==expected
    print(f'{name}: SHA-256 OK')
