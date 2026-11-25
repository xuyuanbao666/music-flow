"""Generate Flutter platform runners using the pinned SDK, then apply tracked settings.
Run from clients/native after flutter create --no-pub --project-name music_flow --org com.musicflow --platforms=android,ios,windows,macos,linux .
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import plistlib
root=Path(__file__).resolve().parent.parent
# Template tests reference a generated MyApp; our real tests are in integration_test.
(root/'test/widget_test.dart').unlink(missing_ok=True)
(root/'analysis_options.yaml').write_text('analyzer:\n  exclude: [build/**]\n',encoding='utf-8')
android=root/'android/app/src/main/AndroidManifest.xml'
if android.exists():
    ns='http://schemas.android.com/apk/res/android'
    ET.register_namespace('android',ns)
    tools='http://schemas.android.com/tools'
    ET.register_namespace('tools',tools)
    key=lambda k:f'{{{ns}}}{k}'
    tree=ET.parse(android); doc=tree.getroot(); app=doc.find('application')
    for permission in ['android.permission.WAKE_LOCK','android.permission.FOREGROUND_SERVICE','android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK','android.permission.POST_NOTIFICATIONS']:
        if not any(x.get(key('name'))==permission for x in doc.findall('uses-permission')):
            doc.insert(0,ET.Element('uses-permission',{key('name'):permission}))
    app.set(key('label'),'Music Flow')
    if not any(x.get(key('name'))=='com.ryanheise.audioservice.AudioService' for x in app.findall('service')):
        service=ET.SubElement(app,'service',{key('name'):'com.ryanheise.audioservice.AudioService',key('foregroundServiceType'):'mediaPlayback',key('exported'):'true',f'{{{tools}}}ignore':'Instantiatable'})
        filt=ET.SubElement(service,'intent-filter'); ET.SubElement(filt,'action',{key('name'):'android.media.browse.MediaBrowserService'})
        receiver=ET.SubElement(app,'receiver',{key('name'):'com.ryanheise.audioservice.MediaButtonReceiver',key('exported'):'true'})
        filt=ET.SubElement(receiver,'intent-filter'); ET.SubElement(filt,'action',{key('name'):'android.intent.action.MEDIA_BUTTON'})
    tree.write(android,encoding='utf-8',xml_declaration=True)
    for file in (root/'android/app/src/main/kotlin').rglob('MainActivity.kt'):
        source=file.read_text(); source=source.replace('import io.flutter.embedding.android.FlutterActivity','import com.ryanheise.audioservice.AudioServiceActivity').replace(': FlutterActivity()',': AudioServiceActivity()'); file.write_text(source)
    # No private release key is supplied. Default Flutter release key is a debug key;
    # CI labels APKs as test builds, never as production-signed updates.
for file in [root/'ios/Runner/Info.plist',root/'macos/Runner/Info.plist']:
    if file.exists():
        with file.open('rb') as stream: data=plistlib.load(stream)
        data['CFBundleDisplayName']='Music Flow'
        if 'ios' in file.parts: data['UIBackgroundModes']=['audio']
        with file.open('wb') as stream: plistlib.dump(data,stream)
for file in (root/'macos/Runner').glob('*.entitlements'):
    with file.open('rb') as stream: data=plistlib.load(stream)
    data['com.apple.security.files.user-selected.read-only']=True
    with file.open('wb') as stream: plistlib.dump(data,stream)
