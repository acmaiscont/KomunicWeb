# KomunicApp

Aplicativo Windows baseado em WebView2 para abrir o Komunic como aplicativo, preservar a sessão e registrar atividade para suporte e indicadores.

## O que o aplicativo faz

- Abre diretamente o chat do Komunic em `https://app.komunic.net/newchat`.
- Mantém cookies e sessão localmente para evitar novos logins desnecessários.
- Permite salvar senhas no perfil protegido do WebView2; o autopreenchimento geral permanece desativado.
- Permite recarregar a página sem cache.
- Reconhece a tela de login e redireciona o usuário quando a sessão expira.
- Permite autorizar notificações do site.
- Exibe um diagnóstico técnico pelo botão `ⓘ` da barra superior.
- Não depende de API própria, banco de dados ou serviço de monitoramento.

## Requisito WebView2

O app depende do Microsoft Edge WebView2 Runtime. O instalador verifica as instalações por usuário e por máquina. Se o runtime não estiver presente, o instalador executa o Evergreen Bootstrapper oficial da Microsoft com `/silent /install` antes de concluir a instalação do Komunic.

O bootstrapper é online: o computador precisa conseguir acessar os servidores da Microsoft durante a instalação. O WebView2 Runtime é compartilhado por outros aplicativos WebView2 e recebe atualizações automáticas da Microsoft.

Se a instalação falhar, confirme acesso à internet, permissões de administrador e políticas corporativas que possam bloquear o Microsoft Edge Update.

## Configuração inicial

Edite `Versão/KomunicApp/config.json` antes de compilar:

- `LoginUrl`: tela de login do Komunic (`https://app.komunic.net/login`).
- `StartUrl`: endereço normal do Komunic (`https://app.komunic.net/`); o próprio site conduz o usuário ao chat ou ao login.
- `AuthenticatedUrlPrefixes`: prefixos de URL que representam uma sessão autenticada.
- `ApiEndpoint`: endpoint de registro de atividade.
- `GitHubRepo`: repositório de releases; vazio desativa atualização automática.

O repositório de releases configurado é `acmaiscont/KomunicWeb`. O instalador publicado em cada release deve ser anexado como um arquivo `.exe`, e a tag do release deve ser diferente da versão instalada, por exemplo `v1.0.1`.

## Instalação e atualização

1. Execute `KomunicAppSetup-1.0.0.exe` como administrador.
2. O instalador verifica e instala o WebView2 Runtime, se necessário.
3. O app é instalado em `C:\Program Files\KomunicApp`.
4. São criados atalhos no Menu Iniciar, na área de trabalho e na inicialização do Windows.
5. Para atualizar, execute o novo instalador sobre a versão existente. A sessão local do usuário é preservada.

## Suporte e diagnóstico

O botão `ⓘ` copia para a área de transferência as informações de aplicativo, versão, URL atual, URL de login, estado da sessão, API e caminho do log. O log local fica em `%LOCALAPPDATA%\KomunicApp\app_log.txt`.

Para limpar uma sessão corrompida, encerre o app e remova somente a pasta `%LOCALAPPDATA%\KomunicApp\WebView2`; isso fará o Komunic solicitar login novamente.

## Operação piloto

1. Preencher a URL real do Komunic.
2. Testar login, notificações, recarregamento e persistência da sessão.
3. Validar o botão `ⓘ` para diagnóstico e suporte.
4. Confirmar o registro de atividade e o reenvio após indisponibilidade da API.
5. Distribuir primeiro para usuários-chave e manter `Arquivo/MessengerApp-Onvio-2026-11-18` como plano de retorno.

## API

A API exige `DATABASE_URL` ou `ConnectionStrings__DefaultConnection`. Para relatórios, configure `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` e `EMAIL_TO` como variáveis de ambiente/segredos. Nenhuma credencial SMTP deve ser gravada no código.

## Build

O build depende dos runtimes de referência do target framework e dos pacotes NuGet. No ambiente de desenvolvimento, instale os SDKs compatíveis com os targets do projeto antes de executar `dotnet restore` e `dotnet publish`.

O script `Versão/KomunicApp/build.ps1` publica o executável self-contained e gera o instalador pelo Inno Setup. O arquivo `MicrosoftEdgeWebview2Setup.exe` é o bootstrapper oficial empacotado no instalador.
