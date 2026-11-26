using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Security.Cryptography;
using System.Windows.Forms;
using Microsoft.Extensions.Configuration;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace MessengerApp
{
    public partial class Form1 : Form
    {
        
        private WebView2 webView;
        private bool isLoggedIn = false;

        private readonly string baseDir =
            Path.GetDirectoryName(System.Diagnostics.Process.GetCurrentProcess().MainModule!.FileName)!;

        private readonly string dataDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), 
            "KomunicApp"
        );

        private readonly string logFile;

        private static readonly HttpClient httpClient = new HttpClient();

        // Configuração do Updater Automático
        private string appName = "Komunic";
        private string loginUrl = "https://app.komunic.net/login";
        private string startUrl = "";
        private List<string> authenticatedUrlPrefixes = new();
        private string githubRepo = "";
        private string currentVersion = "v1.0.0";

        public Form1()
        {
            InitializeComponent();

            if (!Directory.Exists(dataDir))
            {
                Directory.CreateDirectory(dataDir);
            }

            logFile = Path.Combine(dataDir, "app_log.txt");

            LoadConfig();

            Text = appName;
            FormBorderStyle = FormBorderStyle.None;
            WindowState = FormWindowState.Maximized;
            ShowIcon = true;

            string iconPath = Path.Combine(baseDir, "komunic-icon.ico");
            if (File.Exists(iconPath))
                Icon = new Icon(iconPath);

            BackColor = Color.White;

            Panel titleBar = new Panel
            {
                Height = 35,
                Dock = DockStyle.Top,
                BackColor = ColorTranslator.FromHtml("#404040")
            };
            Controls.Add(titleBar);

            if (Icon != null)
            {
                PictureBox appIcon = new PictureBox
                {
                    Image = Icon.ToBitmap(),
                    SizeMode = PictureBoxSizeMode.StretchImage,
                    Width = 24,
                    Height = 24,
                    Left = 5,
                    Top = (titleBar.Height - 24) / 2
                };
                titleBar.Controls.Add(appIcon);
            }

            Label btnMinimize = new Label
            {
                Text = "-",
                Font = new Font("Segoe UI", 16, FontStyle.Bold),
                ForeColor = Color.Orange,
                AutoSize = true,
                Cursor = Cursors.Hand
            };
            btnMinimize.Click += (s, e) => WindowState = FormWindowState.Minimized;
            titleBar.Controls.Add(btnMinimize);

            Label btnReload = new Label
            {
                Text = "⟳",
                Font = new Font("Segoe UI", 14, FontStyle.Bold),
                ForeColor = Color.White,
                AutoSize = true,
                Cursor = Cursors.Hand
            };
            btnReload.Click += async (s, e) => await ForceReload();
            titleBar.Controls.Add(btnReload);

            Label btnSupport = new Label
            {
                Text = "ⓘ",
                Font = new Font("Segoe UI", 13, FontStyle.Bold),
                ForeColor = Color.White,
                AutoSize = true,
                Cursor = Cursors.Hand
            };
            btnSupport.Click += (s, e) => ShowSupportDiagnostics();
            titleBar.Controls.Add(btnSupport);

            titleBar.Resize += (s, e) =>
            {
                btnMinimize.Left = titleBar.Width - btnMinimize.Width - 10;
                btnMinimize.Top = (titleBar.Height - btnMinimize.Height) / 2;

                btnReload.Left = btnMinimize.Left - btnReload.Width - 15;
                btnReload.Top = (titleBar.Height - btnReload.Height) / 2;
                btnSupport.Left = btnReload.Left - btnSupport.Width - 15;
                btnSupport.Top = (titleBar.Height - btnSupport.Height) / 2;
            };

            titleBar.MouseDown += (s, e) =>
            {
                if (e.Button == MouseButtons.Left)
                {
                    Capture = false;
                    Message msg = Message.Create(Handle, 0xA1, new IntPtr(2), IntPtr.Zero);
                    WndProc(ref msg);
                }
            };

            webView = new WebView2 { Dock = DockStyle.Fill };
            Controls.Add(webView);
            webView.BringToFront();

            Load += async (s, e) =>
            {
                _ = CheckForUpdates();

                if (!File.Exists(logFile)) File.WriteAllText(logFile, "");

                var env = await CoreWebView2Environment.CreateAsync(
                    userDataFolder: Path.Combine(dataDir, "WebView2")
                );

                await webView.EnsureCoreWebView2Async(env);

                try
                {
                    webView.CoreWebView2.Profile.IsPasswordAutosaveEnabled = true;
                    webView.CoreWebView2.Profile.IsGeneralAutofillEnabled = false;
                }
                catch { }

                try
                {
                    webView.CoreWebView2.Settings.IsPasswordAutosaveEnabled = true;
                    webView.CoreWebView2.Settings.IsGeneralAutofillEnabled = false;
                }
                catch { }

                webView.CoreWebView2.PermissionRequested += CoreWebView2_PermissionRequested;
                webView.CoreWebView2.NavigationCompleted += WebView_NavigationCompleted;

                if (string.IsNullOrWhiteSpace(startUrl))
                {
                    MessageBox.Show("Configure a URL do Komunic no arquivo config.json.", "Configuração pendente", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                }
                else
                {
                    webView.CoreWebView2.Navigate(startUrl);
                }

            };
        }

        private async System.Threading.Tasks.Task CheckForUpdates()
        {
            if (string.IsNullOrEmpty(githubRepo) || githubRepo.Contains("SEU_USUARIO")) return;

            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.UserAgent.ParseAdd("KomunicAppUpdater");
                var response = await client.GetAsync($"https://api.github.com/repos/{githubRepo}/releases/latest");
                
                if (!response.IsSuccessStatusCode) return;

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;
                
                if (!root.TryGetProperty("tag_name", out var tagElement)) return;
                var latestVersion = tagElement.GetString();

                if (latestVersion != null && latestVersion != currentVersion)
                {
                    var result = MessageBox.Show(
                        $"Uma nova versão ({latestVersion}) está disponível.\nDeseja baixar e instalar agora?", 
                        "Atualização Disponível", 
                        MessageBoxButtons.YesNo, MessageBoxIcon.Information, MessageBoxDefaultButton.Button1, MessageBoxOptions.DefaultDesktopOnly);

                    if (result == DialogResult.Yes)
                    {
                        var assets = root.GetProperty("assets");
                        string? downloadUrl = null;
                        string? expectedDigest = null;
                        string? assetName = null;
                        foreach (var asset in assets.EnumerateArray())
                        {
                            var name = asset.GetProperty("name").GetString();
                            if (name != null && name.StartsWith("KomunicAppSetup-", StringComparison.OrdinalIgnoreCase) && name.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
                            {
                                assetName = name;
                                downloadUrl = asset.GetProperty("browser_download_url").GetString();
                                expectedDigest = asset.TryGetProperty("digest", out var digestElement)
                                    ? digestElement.GetString()
                                    : null;
                                break;
                            }
                        }

                        if (!string.IsNullOrEmpty(downloadUrl) && !string.IsNullOrEmpty(expectedDigest) && expectedDigest.StartsWith("sha256:", StringComparison.OrdinalIgnoreCase))
                        {
                            string tempFile = Path.Combine(Path.GetTempPath(), $"KomunicAppSetup_Update_{Guid.NewGuid():N}.exe");
                            var exeBytes = await client.GetByteArrayAsync(downloadUrl);
                            File.WriteAllBytes(tempFile, exeBytes);

                            using var sha256 = SHA256.Create();
                            var actualDigest = Convert.ToHexString(sha256.ComputeHash(exeBytes));
                            var expectedHash = expectedDigest.Substring("sha256:".Length).Trim().ToUpperInvariant();
                            if (!string.Equals(actualDigest, expectedHash, StringComparison.OrdinalIgnoreCase))
                            {
                                Log($"Atualização rejeitada: digest inválido para {assetName}.");
                                try { File.Delete(tempFile); } catch { }
                                return;
                            }

                            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                            {
                                FileName = tempFile,
                                Arguments = "/SILENT",
                                UseShellExecute = true
                            });

                            Application.Exit();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Log($"Erro ao buscar atualizações: {ex.Message}");
            }
        }

        private async System.Threading.Tasks.Task TroubleshootReload()
        {
            if (webView.CoreWebView2 == null) return;

            webView.CoreWebView2.Navigate(
                startUrl);
            await System.Threading.Tasks.Task.Delay(1500);

            webView.CoreWebView2.Reload();
            await System.Threading.Tasks.Task.Delay(1500);

            webView.CoreWebView2.Navigate(startUrl);
        }

            private async Task ForceReload()
            {
                if (webView.CoreWebView2 == null)
                    return;

                await webView.CoreWebView2.CallDevToolsProtocolMethodAsync(
                    "Page.reload",
                    "{\"ignoreCache\":true}"
                );
            }

        private void WebView_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
        {
            string url = webView.Source?.AbsoluteUri ?? "";
            bool isLoginPage = !string.IsNullOrWhiteSpace(loginUrl) && url.StartsWith(loginUrl, StringComparison.OrdinalIgnoreCase);
            isLoggedIn = !isLoginPage && authenticatedUrlPrefixes.Any(prefix => url.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }

        private void LoadConfig()
        {
            string configPath = Path.Combine(baseDir, "config.json");
            if (!File.Exists(configPath)) return;

            var config = new ConfigurationBuilder()
                .SetBasePath(baseDir)
                .AddJsonFile("config.json", false)
                .Build();

            appName = config["AppName"] ?? appName;
            loginUrl = config["LoginUrl"] ?? loginUrl;
            startUrl = config["StartUrl"] ?? startUrl;
            githubRepo = config["GitHubRepo"] ?? githubRepo;
            currentVersion = config["CurrentVersion"] ?? currentVersion;
            authenticatedUrlPrefixes = config.GetSection("AuthenticatedUrlPrefixes")
                .GetChildren()
                .Select(section => section.Value)
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Cast<string>()
                .ToList();
        }

        private void CoreWebView2_PermissionRequested(object? sender, CoreWebView2PermissionRequestedEventArgs e)
        {
            if (e.PermissionKind != CoreWebView2PermissionKind.Notifications)
            {
                e.State = CoreWebView2PermissionState.Default;
                return;
            }

            e.State = Uri.TryCreate(e.Uri, UriKind.Absolute, out var uri) &&
                string.Equals(uri.Host, "app.komunic.net", StringComparison.OrdinalIgnoreCase)
                    ? CoreWebView2PermissionState.Allow
                    : CoreWebView2PermissionState.Deny;
        }

        private void Log(string msg)
        {
            File.AppendAllText(logFile, $"{DateTime.Now:dd/MM/yyyy HH:mm:ss} - {msg}\n");
        }

        private void ShowSupportDiagnostics()
        {
            var url = webView?.Source?.AbsoluteUri ?? "(não carregada)";
            var diagnostics = $"Aplicativo: {appName}\nVersão: {currentVersion}\nURL atual: {url}\nSessão reconhecida: {isLoggedIn}\nLog: {logFile}";
            Clipboard.SetText(diagnostics);
            MessageBox.Show(diagnostics + "\n\nAs informações foram copiadas para a área de transferência.", "Diagnóstico do Komunic", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

    }
}
