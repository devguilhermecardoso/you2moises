const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { downloadYoutubeMp3, DOWNLOADS_DIR } = require('./src/ytDownloader');
const { uploadToMoises, openMoisesForLogin } = require('./src/moisesUploader');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/downloads', express.static(DOWNLOADS_DIR));

const sseClients = new Set();

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    res.write(payload);
  }
}

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

app.get('/api/files', (req, res) => {
  try {
    if (!fs.existsSync(DOWNLOADS_DIR)) {
      return res.json({ files: [] });
    }
    const files = fs
      .readdirSync(DOWNLOADS_DIR)
      .filter((f) => f.toLowerCase().endsWith('.mp3'))
      .map((f) => {
        const fullPath = path.join(DOWNLOADS_DIR, f);
        const stat = fs.statSync(fullPath);
        return {
          name: f,
          sizeMB: (stat.size / (1024 * 1024)).toFixed(2),
          createdAt: stat.mtime,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/open-folder', (req, res) => {
  exec(`explorer "${DOWNLOADS_DIR}"`);
  res.json({ ok: true });
});

app.post('/api/moises-login', async (req, res) => {
  try {
    console.log('[Server] Abrindo janela do Moises para login/conexão...');
    await openMoisesForLogin();
    res.json({ ok: true });
  } catch (err) {
    console.error('[Server] Erro ao abrir Moises:', err);
    res.status(500).json({ error: err.message });
  }
});

let isProcessingBatch = false;

app.post('/api/upload-existing', async (req, res) => {
  const { fileName } = req.body;
  if (!fileName) {
    return res.status(400).json({ error: 'Nome do arquivo não informado.' });
  }
  const fullPath = path.join(DOWNLOADS_DIR, path.basename(fileName));
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Arquivo MP3 não encontrado.' });
  }
  if (isProcessingBatch) {
    return res.status(409).json({ error: 'Já existe um envio em andamento.' });
  }

  isProcessingBatch = true;
  res.json({ started: true });

  (async () => {
    try {
      broadcast('file-upload-update', {
        fileName,
        status: 'uploading',
        message: 'Abrindo Moises para enviar...',
      });

      await uploadToMoises(fullPath, (prog) => {
        broadcast('file-upload-update', {
          fileName,
          status: 'uploading',
          message: prog.message,
        });
      });

      broadcast('file-upload-update', {
        fileName,
        status: 'done',
        message: 'Enviado para o Moises!',
      });
    } catch (err) {
      console.error('[Server] Erro ao enviar MP3 existente:', err);
      broadcast('file-upload-update', {
        fileName,
        status: 'error',
        message: err.message || 'Erro ao enviar para o Moises.',
      });
    } finally {
      isProcessingBatch = false;
    }
  })();
});

app.post('/api/process', async (req, res) => {
  const { items, uploadMoises = true } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Informe pelo menos um link do YouTube.' });
  }

  if (isProcessingBatch) {
    return res.status(409).json({ error: 'Já existe uma fila sendo processada no momento.' });
  }

  isProcessingBatch = true;
  res.json({ started: true, total: items.length });

  (async () => {
    try {
      for (const item of items) {
        const { id, url } = item;
        if (!url || !url.trim()) continue;

        try {
          console.log(`[Server] Processando link: ${url}`);
          broadcast('item-update', {
            id,
            status: 'downloading',
            message: 'Iniciando download do YouTube...',
          });

          const mp3Info = await downloadYoutubeMp3(url.trim(), (prog) => {
            broadcast('item-update', {
              id,
              status: 'downloading',
              title: prog.title,
              percent: prog.percent,
              message: prog.message,
            });
          });

          if (uploadMoises) {
            console.log(`[Server] MP3 pronto (${mp3Info.fileName}). Enviando para o Moises...`);
            broadcast('item-update', {
              id,
              status: 'uploading',
              title: mp3Info.title,
              fileName: mp3Info.fileName,
              message: 'MP3 pronto! Abrindo Moises para enviar (Separação Padrão)...',
            });

            await uploadToMoises(mp3Info.filePath, (prog) => {
              broadcast('item-update', {
                id,
                status: 'uploading',
                title: mp3Info.title,
                fileName: mp3Info.fileName,
                message: prog.message,
              });
            });

            broadcast('item-update', {
              id,
              status: 'done',
              title: mp3Info.title,
              fileName: mp3Info.fileName,
              message: 'Concluído! Música enviada para o Moises com separação padrão.',
            });
          } else {
            broadcast('item-update', {
              id,
              status: 'done',
              title: mp3Info.title,
              fileName: mp3Info.fileName,
              message: 'MP3 baixado com sucesso!',
            });
          }
        } catch (itemErr) {
          console.error('[Server] Erro ao processar item:', itemErr);
          broadcast('item-update', {
            id,
            status: 'error',
            message: itemErr.message || 'Erro ao processar esta música.',
          });
        }
      }
    } finally {
      isProcessingBatch = false;
      broadcast('batch-complete', { done: true });
    }
  })();
});

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🎵 You2Moises iniciado em: http://localhost:${PORT}`);
  console.log(`👨‍💻 Desenvolvido por Guilherme Cardoso (@devguilhermecardoso)`);
  console.log(`=============================================================\n`);
});
