# 🎵 You2Moises

> **Do YouTube direto para a sua biblioteca do Moises.ai — 100% automatizado e em segundo plano.**  
> Desenvolvido por **[Guilherme Cardoso (@devguilhermecardoso)](https://github.com/devguilhermecardoso)**

![License](https://img.shields.io/badge/license-MIT-00e5a3)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-38bdf8)
![Platform](https://img.shields.io/badge/plataforma-Windows-blue)
![Author](https://img.shields.io/badge/autor-Guilherme%20Cardoso-00e5a3)

O **You2Moises** é uma ferramenta criada para músicos que estudam repertório no **Moises.ai**. Em vez de baixar cada vídeo do YouTube manualmente, converter para `.mp3`, abrir o site do Moises e subir arquivo por arquivo, o **You2Moises** faz todo o processo sozinho e em segundo plano: basta colar um ou vários links do YouTube e clicar em **Enviar**.

---

## ✨ Funcionalidades

- **Fila de Músicas (Lote):** Adicione quantos links do YouTube quiser clicando em `+ Adicionar mais uma música` (ou colando vários links de uma vez).
- **Conversão Automática para MP3 (Alta Qualidade):** Baixa automaticamente o utilitário `yt-dlp` e converte o áudio usando `FFmpeg` integrado sem precisar configurar nada no sistema.
- **Importação 100% em Segundo Plano no Moises (`Play`):** Usa sua sessão autenticada do Moises para enviar os arquivos `.mp3` diretamente para a ferramenta **Play (Separar faixas)** com a separação padrão, de forma totalmente invisível (`--headless=new`), sem abrir janelas na sua frente.
- **Progresso em Tempo Real:** Acompanhe na interface o status de download, conversão e envio de cada música.
- **Histórico Local de MP3:** Todos os arquivos `.mp3` gerados ficam salvos na pasta `downloads/` e podem ser reenviados para o Moises com 1 clique.

---

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado no seu computador (Windows):

1. **[Node.js](https://nodejs.org/)** (versão 18 ou superior — recomendado baixar a versão **LTS**).
2. **[Google Chrome](https://www.google.com/chrome/)** instalado no Windows.

---

## 🚀 Como instalar e usar

### 1. Baixar o You2Moises
Você pode clonar este repositório ou baixar o arquivo `.zip` no botão verde **`<> Code` → `Download ZIP`** aqui no GitHub:

```bash
git clone https://github.com/devguilhermecardoso/you2moises.git
cd you2moises
```

### 2. Iniciar com 2 cliques
- Dê dois cliques no arquivo **`iniciar.bat`**.
  - *Na primeira execução, ele instalará todas as dependências automaticamente (`npm install` e `yt-dlp.exe`).*
  - O servidor será iniciado oculto em segundo plano e abrirá automaticamente o painel em **`http://localhost:3000`**.
- **Dica:** Dê dois cliques em **`criar-atalho-area-de-trabalho.bat`** para criar um atalho **You2Moises** direto na sua Área de Trabalho!

### 3. Conectar sua conta do Moises (Apenas na 1ª vez)
1. No topo direito da tela, clique em **🔗 Abrir / Conectar Moises**.
2. Uma janela do Chrome abrirá na página do Moises: faça login na sua conta normalmente.
3. Assim que entrar na sua biblioteca, pode fechar essa janela do Chrome. Sua sessão ficará salva localmente na pasta `moises-session/`.
4. A partir daí, todos os próximos envios acontecerão **100% em segundo plano (invisíveis)**!

---

## 🔒 Privacidade e Segurança

- Sua sessão de login do Moises fica salva **exclusivamente no seu próprio computador** dentro da pasta local `moises-session/` (que já está bloqueada no `.gitignore` para nunca ser enviada ao GitHub).
- Nenhuma senha ou credencial é armazenada ou enviada para servidores externos.

---

## 👨‍💻 Autor

Idealizado e desenvolvido por **Guilherme Cardoso**:

- GitHub: [@devguilhermecardoso](https://github.com/devguilhermecardoso)

---

## 📄 Licença

Este projeto está sob a licença [MIT](./LICENSE).
