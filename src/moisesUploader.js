const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright-core');

const SESSION_DIR = path.join(__dirname, '..', 'moises-session');
const MOISES_PLAY_URL = 'https://studio.moises.ai/play';

if (!fs.existsSync(SESSION_DIR)) {
  fs.mkdirSync(SESSION_DIR, { recursive: true });
}

let activeContext = null;
let activePage = null;
let currentModeHeadless = true;

async function closeBrowserContext() {
  if (activeContext) {
    try {
      await activeContext.close();
    } catch (_) {}
    activeContext = null;
    activePage = null;
  }
}

async function getBrowserPage({ headless = true } = {}) {
  // If we need to switch between headless (background) and visible (login), restart context
  if (activeContext && currentModeHeadless !== headless) {
    await closeBrowserContext();
  }

  if (activeContext) {
    try {
      const pages = activeContext.pages().filter((p) => !p.isClosed());
      if (pages.length > 0) {
        activePage = pages[0];
        return { context: activeContext, page: activePage };
      }
    } catch (_) {
      activeContext = null;
      activePage = null;
    }
  }

  await closeBrowserContext();

  currentModeHeadless = headless;
  const args = [
    '--disable-blink-features=AutomationControlled',
    '--no-first-run',
    '--no-default-browser-check',
  ];

  if (headless) {
    args.unshift('--headless=new');
    console.log('[Moises] Iniciando Chrome em segundo plano (invisível)...');
  } else {
    args.unshift('--start-maximized');
    console.log('[Moises] Iniciando Chrome visível para login...');
  }

  activeContext = await chromium.launchPersistentContext(SESSION_DIR, {
    channel: 'chrome',
    headless: false, // We use --headless=new in args for full Chrome compatibility
    viewport: headless ? { width: 1440, height: 900 } : null,
    args,
  });

  activeContext.on('close', () => {
    activeContext = null;
    activePage = null;
  });

  const pages = activeContext.pages();
  activePage = pages.length > 0 ? pages[0] : await activeContext.newPage();

  return { context: activeContext, page: activePage };
}

async function isLoggedIntoMoises(page) {
  try {
    const url = page.url();
    if (!url.includes('moises.ai')) return false;
    if (
      url.includes('/auth') ||
      url.includes('/login') ||
      url.includes('/signup') ||
      url.includes('/signin') ||
      url.includes('accounts.google.com')
    ) {
      return false;
    }

    return await page.evaluate(() => {
      const pathname = window.location.pathname.toLowerCase();
      if (
        pathname.includes('/auth') ||
        pathname.includes('/login') ||
        pathname.includes('/signup') ||
        pathname.includes('/signin')
      ) {
        return false;
      }
      const hasPasswordInput =
        document.querySelectorAll('input[type="password"], input[type="email"]').length > 0;
      if (hasPasswordInput) return false;

      return (
        pathname.includes('/play') ||
        pathname.includes('/home') ||
        pathname.includes('/upload') ||
        (document.body && document.body.innerText.includes('Adicionar'))
      );
    });
  } catch (_) {
    return false;
  }
}

async function openMoisesForLogin() {
  const { page } = await getBrowserPage({ headless: false });
  await page.goto(MOISES_PLAY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.bringToFront().catch(() => {});
  return { ok: true };
}

async function uploadToMoises(mp3FilePath, onProgress) {
  if (!fs.existsSync(mp3FilePath)) {
    throw new Error(`Arquivo MP3 não encontrado: ${mp3FilePath}`);
  }

  if (onProgress) {
    onProgress({
      stage: 'opening_moises',
      message: 'Conectando ao Moises em segundo plano...',
    });
  }

  // Run completely in background (--headless=new)
  let { page } = await getBrowserPage({ headless: true });

  await page.goto(MOISES_PLAY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  let loggedIn = await isLoggedIntoMoises(page);

  // Only if session is not logged in, open visible browser for user to sign in once
  if (!loggedIn) {
    if (onProgress) {
      onProgress({
        stage: 'waiting_login',
        message: 'Sessão desconectada. Abrindo janela do Moises para você fazer login...',
      });
    }
    ({ page } = await getBrowserPage({ headless: false }));
    await page.goto(MOISES_PLAY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const startTime = Date.now();
    const maxWaitMs = 5 * 60 * 1000;
    while (Date.now() - startTime < maxWaitMs) {
      await page.waitForTimeout(2000);
      loggedIn = await isLoggedIntoMoises(page);
      if (loggedIn) break;
    }

    if (!loggedIn) {
      throw new Error('Não foi possível autenticar no Moises.');
    }

    // Switch back to invisible background mode after login
    ({ page } = await getBrowserPage({ headless: true }));
    await page.goto(MOISES_PLAY_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
  }

  if (onProgress) {
    onProgress({
      stage: 'opening_play',
      message: 'Abrindo "Separar faixas" no Play em segundo plano...',
    });
  }

  // Click "Adicionar" on https://studio.moises.ai/play to load the upload iframe
  const adicionarBtn = page.locator('text="Adicionar"').first();
  await adicionarBtn.waitFor({ state: 'visible', timeout: 20000 });
  await adicionarBtn.click();

  // Wait for the studio1.moises.ai upload iframe containing input[type="file"]
  let uploadFrame = null;
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(1000);
    for (const f of page.frames()) {
      const count = await f.locator('input[type="file"]').count().catch(() => 0);
      if (count > 0) {
        uploadFrame = f;
        break;
      }
    }
    if (uploadFrame) break;
  }

  if (!uploadFrame) {
    throw new Error('Não foi possível carregar o formulário de upload do Play no Moises.');
  }

  if (onProgress) {
    onProgress({
      stage: 'uploading',
      message: 'Importando arquivo MP3 no Moises...',
    });
  }

  console.log('[Moises] Anexando MP3 no iframe de upload:', uploadFrame.url());
  const fileInput = uploadFrame.locator('input[type="file"]').first();
  await fileInput.setInputFiles(mp3FilePath);

  if (onProgress) {
    onProgress({
      stage: 'configuring_separation',
      message: 'Confirmando separação padrão e enviando para sua biblioteca...',
    });
  }

  // Wait for "Enviar" / "Próximo" button inside the upload iframe and click it
  let submitted = false;
  for (let step = 0; step < 15; step++) {
    await page.waitForTimeout(1500);

    const nextBtn = uploadFrame
      .locator('button:has-text("Próximo"), button:has-text("Seguinte"), button:has-text("Next")')
      .first();
    if ((await nextBtn.count().catch(() => 0)) > 0 && (await nextBtn.isVisible().catch(() => false)) && (await nextBtn.isEnabled().catch(() => false))) {
      console.log('[Moises] Clicando em Próximo...');
      await nextBtn.click();
      continue;
    }

    const submitBtn = uploadFrame
      .locator('button:has-text("Enviar"), button:has-text("Submit")')
      .first();
    if ((await submitBtn.count().catch(() => 0)) > 0 && (await submitBtn.isVisible().catch(() => false)) && (await submitBtn.isEnabled().catch(() => false))) {
      console.log('[Moises] Clicando em Enviar dentro do iframe...');
      await submitBtn.click();
      submitted = true;
      break;
    }
  }

  if (!submitted) {
    throw new Error('O botão "Enviar" não ficou disponível após anexar o MP3.');
  }

  if (onProgress) {
    onProgress({
      stage: 'uploading_progress',
      message: 'Finalizando envio do arquivo para a nuvem do Moises...',
    });
  }

  // Wait until Moises finishes uploading and navigates back to /play
  const waitStart = Date.now();
  while (Date.now() - waitStart < 60000) {
    await page.waitForTimeout(1500);
    const currentUrl = page.url();
    if (currentUrl.includes('/play') && !currentUrl.includes('/upload')) {
      console.log('[Moises] Upload concluído! Redirecionado de volta para /play.');
      break;
    }
  }

  await page.waitForTimeout(1500);
  return { ok: true };
}

module.exports = {
  uploadToMoises,
  openMoisesForLogin,
  closeBrowserContext,
};
