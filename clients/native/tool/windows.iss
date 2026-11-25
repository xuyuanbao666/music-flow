#ifndef SourceDir
  #error "SourceDir required"
#endif
#ifndef OutputDir
  #error "OutputDir required"
#endif
[Setup]
AppId={{9F02202F-C6F4-4F56-A3A7-6DA1D7953F99}
AppName=Music Flow
AppVersion=0.3.0
DefaultDirName={localappdata}\Programs\Music Flow
DefaultGroupName=Music Flow
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
OutputDir={#OutputDir}
OutputBaseFilename=musicflow-v0.3.0-windows-x64-setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\music_flow.exe
[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
[Icons]
Name: "{autoprograms}\Music Flow"; Filename: "{app}\music_flow.exe"
[Run]
Filename: "{app}\music_flow.exe"; Description: "Launch Music Flow"; Flags: nowait postinstall skipifsilent
