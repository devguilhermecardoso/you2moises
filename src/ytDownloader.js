const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const BIN_DIR = path.join(__dirname, '..', 'bin');
const YT_DLP_PATH = path.join(BIN_DIR, 'yt-dlp.exe');
const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');

if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true });
}
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

function downloadFileWithRedirects(url, destPath) {
  return new Promise((resolve, reject) => {
    const request = (currentUrl) => {
      https
        .get(currentUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            return request(res.headers.location);
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`Falha ao baixar yt-dlp (HTTP ${res.statusCode})`));
          }
          const file = fs.createWriteStream(destPath);
          res.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
          file.on('error', (err) => {
            fs.unlink(destPath, () => {});
            reject(err);
          });
        })
        .on('error', reject);
    };
    request(url);
  });
}

async function ensureYtDlp(onLog) {
  if (fs.existsSync(YT_DLP_PATH)) {
    const stats = fs.statSync(YT_DLP_PATH);
    if (stats.size > 1024 * 1024) {
      return YT_DLP_PATH;
    }
  }
  if (onLog) onLog('Baixando utilitário yt-dlp.exe (apenas na primeira execução)...');
  await downloadFileWithRedirects(
    'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
    YT_DLP_PATH
  );
  if (onLog) onLog('yt-dlp.exe instalado com sucesso!');
  return YT_DLP_PATH;
}

function sanitizeFileName(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function getVideoTitle(ytDlpBin, url) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ytDlpBin, [
      '--no-playlist',
      '--get-title',
      '--no-warnings',
      '--encoding',
      'utf-8',
      url,
    ]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => {
      stdout += chunk.toString('utf8');
    });
    proc.stderr.on('data', (chunk) => {
      stderr += chunk.toString('utf8');
    });

    proc.on('close', (code) => {
      if (code === 0 && stdout.trim()) {
        const lines = stdout.trim().split(/\r?\n/);
        resolve(lines[0].trim());
      } else {
        reject(new Error(stderr.trim() || 'Não foi possível obter informações do vídeo do YouTube.'));
      }
    });
  });
}

async function downloadYoutubeMp3(url, onProgress) {
  const ytDlpBin = await ensureYtDlp((msg) => onProgress && onProgress({ stage: 'preparing', message: msg }));

  if (onProgress) {
    onProgress({ stage: 'fetching_info', message: 'Buscando informações do vídeo no YouTube...' });
  }

  let rawTitle = 'Musica_YouTube';
  try {
    rawTitle = await getVideoTitle(ytDlpBin, url);
  } catch (err) {
    // Fallback if title check fails
  }

  const cleanTitle = sanitizeFileName(rawTitle) || `musica_${Date.now()}`;
  const outputTemplate = path.join(DOWNLOADS_DIR, `${cleanTitle}.%(ext)s`);
  const finalMp3Path = path.join(DOWNLOADS_DIR, `${cleanTitle}.mp3`);

  // Reuse already downloaded MP3 if present
  if (fs.existsSync(finalMp3Path) && fs.statSync(finalMp3Path).size > 10240) {
    if (onProgress) {
      onProgress({
        stage: 'converting',
        title: cleanTitle,
        percent: 100,
        message: `MP3 já disponível localmente ("${cleanTitle}.mp3").`,
      });
    }
    return {
      title: cleanTitle,
      filePath: finalMp3Path,
      fileName: path.basename(finalMp3Path),
    };
  }

  if (onProgress) {
    onProgress({
      stage: 'downloading',
      title: cleanTitle,
      message: `Baixando e convertendo "${cleanTitle}" para MP3...`,
    });
  }

  return new Promise((resolve, reject) => {
    const args = [
      '--no-playlist',
      '-x',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '0',
      '--ffmpeg-location',
      ffmpegPath,
      '--newline',
      '--encoding',
      'utf-8',
      '-o',
      outputTemplate,
      url,
    ];

    const proc = spawn(ytDlpBin, args);
    let lastError = '';

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString('utf8');
      const match = text.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
      if (match && onProgress) {
        onProgress({
          stage: 'downloading',
          title: cleanTitle,
          percent: parseFloat(match[1]),
          message: `Baixando áudio (${match[1]}%)...`,
        });
      } else if (text.includes('[ExtractAudio]') && onProgress) {
        onProgress({
          stage: 'converting',
          title: cleanTitle,
          percent: 100,
          message: 'Convertendo para MP3 com FFmpeg...',
        });
      }
    });

    proc.stderr.on('data', (chunk) => {
      lastError += chunk.toString('utf8');
    });

    proc.on('close', (code) => {
      if (code === 0 && fs.existsSync(finalMp3Path)) {
        resolve({
          title: cleanTitle,
          filePath: finalMp3Path,
          fileName: path.basename(finalMp3Path),
        });
      } else {
        const files = fs
          .readdirSync(DOWNLOADS_DIR)
          .filter((f) => f.endsWith('.mp3'))
          .map((f) => ({
            name: f,
            fullPath: path.join(DOWNLOADS_DIR, f),
            mtime: fs.statSync(path.join(DOWNLOADS_DIR, f)).mtimeMs,
          }))
          .sort((a, b) => b.mtime - a.mtime);

        if (code === 0 && files.length > 0 && Date.now() - files[0].mtime < 60000) {
          resolve({
            title: path.basename(files[0].name, '.mp3'),
            filePath: files[0].fullPath,
            fileName: files[0].name,
          });
        } else {
          reject(new Error(lastError.trim() || `Erro ao converter vídeo (código ${code}).`));
        }
      }
    });
  });
}

module.exports = {
  downloadYoutubeMp3,
  ensureYtDlp,
  DOWNLOADS_DIR,
};
