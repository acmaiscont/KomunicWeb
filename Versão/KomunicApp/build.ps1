$ErrorActionPreference = "Stop"

Write-Host "Limpando diretório publish antigo..." -ForegroundColor Cyan
if (Test-Path "publish") {
    Remove-Item -Recurse -Force "publish"
}
if (Test-Path "Output") {
    Remove-Item -Recurse -Force "Output"
}

Write-Host "Publicando o projeto .NET..." -ForegroundColor Cyan
$project = Join-Path $PSScriptRoot "KomunicApp.csproj"
$publishArgs = @("publish", $project, "-c", "Release", "-r", "win-x64", "--self-contained", "true", "/p:PublishSingleFile=true", "/p:IncludeAllContentForSelfExtract=true", "-o", (Join-Path $PSScriptRoot "publish"))

# Usa o target original quando o SDK correspondente estiver instalado. Em máquinas
# que só possuem SDK novo, permite uma validação/publicação temporária com esse SDK.
$hasNet8ReferencePack = Test-Path "C:\Program Files\dotnet\packs\Microsoft.WindowsDesktop.App.Ref\8.*"
if (-not $hasNet8ReferencePack) {
    Write-Host "SDK .NET 8 não encontrado; usando o target disponível para publicação local." -ForegroundColor Yellow
    $publishArgs += @("-p:TargetFrameworks=net10.0-windows", "-p:TargetFramework=net10.0-windows")
}

& dotnet @publishArgs
if ($LASTEXITCODE -ne 0) { throw "Falha ao publicar o KomunicApp." }

Write-Host "Gerando instalador com InnoSetup..." -ForegroundColor Cyan
# Verifica se o Inno Setup está instalado
$isccCandidates = @(
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe",
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
)
$iscc = $isccCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (Test-Path $iscc) {
    & $iscc "ScriptEXE.iss"
    Write-Host "Concluído! Instalador gerado na pasta Output." -ForegroundColor Green
} else {
    Write-Host "AVISO: InnoSetup (ISCC.exe) não encontrado em $iscc." -ForegroundColor Yellow
    Write-Host "A publicação foi feita na pasta 'publish', mas o instalador não foi gerado." -ForegroundColor Yellow
    Write-Host "Abra o arquivo ScriptEXE.iss manualmente no InnoSetup e compile." -ForegroundColor Yellow
}
