# KomunicApp

Aplicativo Windows baseado em Microsoft Edge WebView2 para abrir o Komunic como uma janela dedicada, preservar a sessão e facilitar o suporte.

## Funcionamento atual

- Abre diretamente o chat em `https://app.komunic.net/newchat`.
- Mantém cookies, sessão e dados do perfil no computador do usuário.
- Permite salvar senhas no perfil protegido do WebView2; o preenchimento automático geral permanece desativado.
- Permite notificações do site, recarregamento sem cache e acesso à tela de login quando necessário.
- Não executa mais a validação periódica de login a cada 10 minutos.
- Não depende de API própria, banco de dados ou serviço de monitoramento.

## WebView2

O aplicativo depende do Microsoft Edge WebView2 Runtime. O instalador verifica o runtime por usuário e por máquina. Se estiver ausente, executa o bootstrapper oficial da Microsoft com `/silent /install`.

Bootstrapper oficial: `https://go.microsoft.com/fwlink/?linkid=2124703`

O bootstrapper pode precisar de internet para baixar os componentes. O WebView2 Runtime é compartilhado por outros aplicativos WebView2 e atualizado pela Microsoft.

## Configuração

Arquivo: `Versão/KomunicApp/config.json`

- `LoginUrl`: `https://app.komunic.net/login`.
- `StartUrl`: `https://app.komunic.net/newchat`.
- `AuthenticatedUrlPrefixes`: URLs que representam uma sessão autenticada.
- `GitHubRepo`: `acmaiscont/KomunicWeb`.
- `CurrentVersion`: versão embutida no aplicativo, atualmente `v1.0.2`.

## Atualização automática

Ao iniciar, o aplicativo consulta `https://api.github.com/repos/acmaiscont/KomunicWeb/releases/latest`.

Quando a tag da Release é diferente da versão instalada, o aplicativo localiza o asset `KomunicAppSetup-*.exe`, baixa pelo campo `browser_download_url`, valida o campo `digest` no formato `sha256:HASH`, compara o SHA-256 e executa o instalador validado com `/VERYSILENT /NORESTART`.

Releases: `https://github.com/acmaiscont/KomunicWeb/releases`

Release atual: [v1.0.2](https://github.com/acmaiscont/KomunicWeb/releases/tag/v1.0.2)

O instalador precisa ser publicado como asset de uma GitHub Release. Arquivos apenas no código-fonte não são considerados pelo atualizador.

## Instalação

O instalador atual é `KomunicAppSetup-1.0.2.exe`. Ele instala em `C:\Program Files\KomunicApp`, cria atalhos no Menu Iniciar, na área de trabalho e na inicialização do Windows, e preserva a sessão durante atualizações.

Para instalação silenciosa: `/VERYSILENT /NORESTART`

## Suporte e diagnóstico

O botão de diagnóstico copia informações técnicas para a área de transferência, incluindo versão, URL atual, estado da sessão e caminho do log.

Log local: `%LOCALAPPDATA%\KomunicApp\app_log.txt`

Para limpar uma sessão corrompida, encerre o aplicativo e remova somente `%LOCALAPPDATA%\KomunicApp\WebView2`. Isso fará o site solicitar o login novamente.

## Build e distribuição

Código local: `D:\OneDrive - JCM CONTABILIDADE\Suporte - Desenvolvimento\KomunicApp`

Repositório: `https://github.com/acmaiscont/KomunicWeb`

O script `Versão/KomunicApp/build.ps1` publica o executável self-contained e gera o instalador com Inno Setup. O bootstrapper do WebView2 é empacotado no instalador.

Artefatos de build (`bin`, `obj`, `publish` e instaladores antigos) não devem ser versionados no Git. O instalador oficial deve ser distribuído pela GitHub Release.

## Retorno operacional

O projeto anterior permanece arquivado em `D:\OneDrive - JCM CONTABILIDADE\Suporte - Desenvolvimento\Arquivo\MessengerApp-Onvio-2026-11-18`.
