# 🎵 You2Moises

> **Do YouTube direto para a sua biblioteca do Moises.ai — 100% automatizado e em segundo plano.**  
> **From YouTube straight to your Moises.ai library — 100% automated in the background.**  
> Desenvolvido por / Developed by **[Guilherme Cardoso (@devguilhermecardoso)](https://github.com/devguilhermecardoso)**

![License](https://img.shields.io/badge/license-MIT-00e5a3)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-38bdf8)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Author](https://img.shields.io/badge/author-Guilherme%20Cardoso-00e5a3)

🌐 **[Português (BR)](#-sobre-o-projeto-pt-br)** | **[English (EN)](#-about-the-project-en)**

---

## 🇧🇷 Sobre o Projeto (PT-BR)

O **You2Moises** é uma ferramenta criada para músicos que estudam repertório no **Moises.ai**. Em vez de baixar cada vídeo do YouTube manualmente, converter para `.mp3`, abrir o site do Moises e subir arquivo por arquivo, o **You2Moises** faz todo o processo sozinho e em segundo plano: basta colar um ou vários links do YouTube e clicar em **Enviar**.

### ✨ Funcionalidades

- **Fila de Músicas (Lote):** Adicione quantos links do YouTube quiser clicando em `+ Adicionar mais uma música` (ou colando vários links de uma vez).
- **Conversão Automática para MP3 (Alta Qualidade):** Baixa automaticamente o utilitário `yt-dlp` e converte o áudio usando `FFmpeg` integrado sem precisar configurar nada no sistema.
- **Importação 100% em Segundo Plano no Moises (`Play`):** Usa sua sessão autenticada do Moises para enviar os arquivos `.mp3` diretamente para a ferramenta **Play (Separar faixas)** com a separação padrão, de forma totalmente invisível (`--headless=new`), sem abrir janelas na sua frente.
- **Progresso em Tempo Real:** Acompanhe na interface o status de download, conversão e envio de cada música.
- **Histórico Local de MP3:** Todos os arquivos `.mp3` gerados ficam salvos na pasta `downloads/` e podem ser reenviados para o Moises com 1 clique.

### 📋 Pré-requisitos

1. **[Node.js](https://nodejs.org/)** (versão 18 ou superior — recomendado baixar a versão **LTS**).
2. **[Google Chrome](https://www.google.com/chrome/)** instalado no Windows.

### 🚀 Como instalar e usar

1. **Baixe o projeto:** Clone este repositório ou clique no botão verde **`<> Code` → `Download ZIP`** no topo desta página e extraia em uma pasta:
   ```bash
   git clone https://github.com/devguilhermecardoso/you2moises.git
   cd you2moises
   ```
2. **Inicie com 2 cliques:**
   - Execute o arquivo **`iniciar.bat`**.
   - Na primeira execução, ele instalará todas as dependências automaticamente (`npm install` e `yt-dlp.exe`) e abrirá o painel em **`http://localhost:3000`**.
   - *Opcional:* Execute **`criar-atalho-area-de-trabalho.bat`** para criar um ícone **You2Moises** na sua Área de Trabalho.
3. **Conecte sua conta do Moises (Apenas na 1ª vez):**
   - Clique em **🔗 Abrir / Conectar Moises** no topo direito da tela.
   - Faça login na sua conta do Moises na janela do Chrome que abrir.
   - Assim que entrar na sua biblioteca, pode fechar a janela. Sua sessão ficará salva localmente na pasta `moises-session/` e todos os próximos envios serão **100% invisíveis em segundo plano**!

### 🔒 Privacidade e Segurança

- Sua sessão de login do Moises fica salva **exclusivamente no seu próprio computador** dentro da pasta local `moises-session/` (protegida no `.gitignore` para nunca ser enviada ao GitHub).
- Nenhuma senha ou credencial é armazenada ou enviada para servidores externos.

---

## 🇺🇸 About the Project (EN)

**You2Moises** is an automation tool built for musicians who practice and learn songs using **Moises.ai**. Instead of manually downloading each YouTube video, converting it to `.mp3`, opening Moises, and uploading files one by one, **You2Moises** automates the entire workflow in the background: just paste one or multiple YouTube URLs and click **Start**.

### ✨ Key Features

- **Batch Queue:** Add as many YouTube links as you want using the `+ Add song` button (or paste a multi-line list of URLs at once).
- **High-Quality MP3 Conversion:** Automatically fetches `yt-dlp` and converts audio using bundled `FFmpeg` with zero manual setup required.
- **Silent Background Upload to Moises (`Play`):** Uses your persistent Moises session to upload `.mp3` files straight into **Moises Play (Track Separation)** with default stem separation, running 100% invisibly in headless background mode (`--headless=new`).
- **Real-Time Progress:** Watch download, conversion, and Moises upload progress live on the web dashboard.
- **Local MP3 Library:** All converted `.mp3` tracks are stored in `downloads/` and can be re-sent to Moises anytime with a single click.

### 📋 Prerequisites

1. **[Node.js](https://nodejs.org/)** (v18 or higher — **LTS** recommended).
2. **[Google Chrome](https://www.google.com/chrome/)** installed on Windows.

### 🚀 Installation & Usage

1. **Download the project:** Clone this repository or click **`<> Code` → `Download ZIP`** and extract it:
   ```bash
   git clone https://github.com/devguilhermecardoso/you2moises.git
   cd you2moises
   ```
2. **Launch with a double-click:**
   - Run **`iniciar.bat`**.
   - On the first run, it automatically installs all dependencies (`npm install` and `yt-dlp.exe`) and opens the web UI at **`http://localhost:3000`**.
   - *Optional:* Run **`criar-atalho-area-de-trabalho.bat`** to create a **You2Moises** shortcut on your Windows Desktop.
3. **Connect your Moises account (First time only):**
   - Click **🔗 Abrir / Conectar Moises** in the top-right corner.
   - Sign in to your Moises account in the Chrome window that opens.
   - Once inside your library, you can close that window. Your session is saved locally in `moises-session/`, and all future uploads will run **100% silently in the background**!

### 🔒 Privacy & Security

- Your Moises login session is stored **locally on your machine only** inside `moises-session/` (excluded via `.gitignore`).
- No passwords or credentials are ever collected or transmitted to third-party servers.

---

## 👨‍💻 Autor / Author

Idealizado e desenvolvido por / Created and developed by **Guilherme Cardoso**:

- GitHub: [@devguilhermecardoso](https://github.com/devguilhermecardoso)

---

## 📄 Licença / License

Distribuído sob a licença [MIT](./LICENSE) / Distributed under the [MIT License](./LICENSE).
