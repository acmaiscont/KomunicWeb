[Setup]
AppName=KomunicApp
AppVersion=1.0.0
DefaultDirName={autopf}\KomunicApp
DefaultGroupName=KomunicApp
OutputDir=Output
OutputBaseFilename=KomunicAppSetup-1.0.0
SetupIconFile=komunic-icon.ico
DisableDirPage=no
PrivilegesRequired=admin


[Files]
Source: "publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs
Source: "komunic-icon.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "MicrosoftEdgeWebview2Setup.exe"; Flags: dontcopy

[Code]
const
  WebView2ClientId = '{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}';

function IsValidRuntimeVersion(const Version: string): Boolean;
begin
  Result := (Version <> '') and (Version <> '0.0.0.0');
end;

function IsWebView2RuntimeInstalled(): Boolean;
var
  Version: string;
begin
  Result := False;

  if RegQueryStringValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\' + WebView2ClientId, 'pv', Version) then
    Result := IsValidRuntimeVersion(Version);

  if (not Result) and RegQueryStringValue(HKCU, 'Software\Microsoft\EdgeUpdate\Clients\' + WebView2ClientId, 'pv', Version) then
    Result := IsValidRuntimeVersion(Version);
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  BootstrapperPath: String;
  ResultCode: Integer;
begin
  Result := '';
  NeedsRestart := False;

  if IsWebView2RuntimeInstalled() then
    exit;

  try
    ExtractTemporaryFile('MicrosoftEdgeWebview2Setup.exe');
    BootstrapperPath := ExpandConstant('{tmp}\MicrosoftEdgeWebview2Setup.exe');
    if not Exec(BootstrapperPath, '/silent /install', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
      Result := 'Não foi possível iniciar a instalação do Microsoft Edge WebView2 Runtime.'
    else if (ResultCode <> 0) and (not IsWebView2RuntimeInstalled()) then
      Result := 'O Microsoft Edge WebView2 Runtime não foi instalado. Verifique a conexão com a internet ou as permissões do Windows.';
  except
    Result := 'O instalador encontrou um erro ao preparar o Microsoft Edge WebView2 Runtime.';
  end;
end;

[Icons]
Name: "{autoprograms}\KomunicApp"; Filename: "{app}\KomunicApp.exe"; IconFilename: "{app}\komunic-icon.ico"
Name: "{userdesktop}\KomunicApp"; Filename: "{app}\KomunicApp.exe"; IconFilename: "{app}\komunic-icon.ico"
Name: "{userstartup}\KomunicApp"; Filename: "{app}\KomunicApp.exe"; IconFilename: "{app}\komunic-icon.ico"

[Run]
Filename: "{app}\KomunicApp.exe"; Description: "Iniciar KomunicApp"; Flags: nowait postinstall skipifsilent
