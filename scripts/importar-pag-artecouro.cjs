'use strict';
/**
 * Importa imagens das pastas pag XX da estrutura nova do Artecouro 2026 / Concept 2026.
 *
 * Lê de:  catalogos separados/Artecouro 2025/imagens dos produtos/<CATALOGO>/pag XX/
 * Salva:  public/imagens/<CATALOGO>/
 * Pula:   full.png, full2.png, full3.png, ficha tecn.png (são imagens de análise)
 *
 * Uso: node scripts/importar-pag-artecouro.cjs [--catalogo "Artecouro 2026"] [--dry-run]
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const sharp    = require('sharp');
const { BASE_CATALOGOS } = require('./config.cjs');

const DRY_RUN = process.argv.includes('--dry-run');

// Catálogo alvo (default = Artecouro 2026)
const _catEq  = process.argv.find(a => a.startsWith('--catalogo='))?.replace('--catalogo=', '');
const _catIdx = process.argv.indexOf('--catalogo');
const _catVal = _catIdx !== -1 ? process.argv[_catIdx + 1] : null;
const catArg  = _catEq || (_catVal && !_catVal.startsWith('--') ? _catVal : null);
const CATALOGO_NOME = catArg || 'Artecouro 2026';

const BASE_IMG  = path.join(BASE_CATALOGOS, 'Artecouro 2025', 'imagens dos produtos', CATALOGO_NOME);
const DB_PATH   = path.join(__dirname, '..', 'database', 'catalogo.db');
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo-csm.png');
const db        = new Database(DB_PATH);

const OPACITY      = 0.38;
const LOGO_RATIO   = 0.14;
const MARGIN_RATIO = 0.025;
const logoBuffer   = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

// Arquivos de análise — não vão para o catálogo
const SKIP_FILES = new Set(['full.png','full.jpg','full2.png','full3.png','ficha tecn.png','ficha tecn.jpg']);

// Detecta onde o cabeçalho com nome termina (área branca no topo com texto)
// Retorna quantos pixels cortar do topo, ou 0 se não detectar cabeçalho.
async function detectarCropCapa(srcPath) {
  const { data, info } = await sharp(srcPath)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const maxScan = Math.floor(height * 0.35); // analisa só os primeiros 35%

  let lastHeaderRow = 0;
  for (let y = 0; y < maxScan; y++) {
    const rowStart = y * width;
    let whitePixels = 0;
    for (let x = 0; x < width; x++) {
      if (data[rowStart + x] > 220) whitePixels++;
    }
    const whiteRatio = whitePixels / width;
    // Linha considerada "cabeçalho" se >80% dos pixels são brancos/quase-brancos
    if (whiteRatio > 0.80) lastHeaderRow = y;
  }

  // Só corta se encontrou uma região de cabeçalho com pelo menos 2% de altura
  return lastHeaderRow > height * 0.02 ? lastHeaderRow + 4 : 0;
}

async function aplicarWatermark(srcPath, destPath, cropTop = 0) {
  if (DRY_RUN) { console.log(`  [dry-run] ${path.basename(destPath)}`); return; }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (!logoBuffer) { fs.copyFileSync(srcPath, destPath); return; }
  let img  = sharp(srcPath);
  const meta0 = await img.metadata();
  if (cropTop > 0) {
    img = sharp(srcPath).extract({ left: 0, top: cropTop, width: meta0.width, height: meta0.height - cropTop });
  }
  const { width, height } = cropTop > 0
    ? { width: meta0.width, height: meta0.height - cropTop }
    : meta0;
  const logoW   = Math.max(60, Math.round(width * LOGO_RATIO));
  const margin  = Math.round(width * MARGIN_RATIO);
  const resized = await sharp(logoBuffer).resize({ width: logoW, fit: 'inside' }).png().toBuffer();
  const meta    = await sharp(resized).metadata();
  const { data, info } = await sharp(resized).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * OPACITY);
  const overlay = await sharp(Buffer.from(data), { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  await img
    .composite([{ input: overlay, left: width - meta.width - margin, top: height - meta.height - margin }])
    .toFile(destPath);
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
}

async function importar() {
  const cat = db.prepare('SELECT id, pasta FROM catalogos WHERE nome = ?').get(CATALOGO_NOME);
  if (!cat) { console.error(`Catálogo "${CATALOGO_NOME}" não encontrado no banco.`); process.exit(1); }
  console.log(`\n▶ ${CATALOGO_NOME} (id ${cat.id})${DRY_RUN ? ' [DRY-RUN]' : ''}`);

  const publicDir = path.join(__dirname, '..', 'public', 'imagens', CATALOGO_NOME);
  if (!DRY_RUN) fs.mkdirSync(publicDir, { recursive: true });

  if (!fs.existsSync(BASE_IMG)) {
    console.error(`Pasta de imagens não encontrada:\n  ${BASE_IMG}`); process.exit(1);
  }

  // Pega todas as pastas pag XX ordenadas
  const pagDirs = fs.readdirSync(BASE_IMG, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^pag \d+/i.test(d.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  let updated = 0, skipped = 0;

  for (const dir of pagDirs) {
    const pagFolder = dir.name;
    const pagNum    = parseInt(pagFolder.replace(/^pag /i, ''));
    const srcDir    = path.join(BASE_IMG, pagFolder);

    // Produto por catálogo + página
    const prod = db.prepare('SELECT id, nome, imagens FROM produtos WHERE catalogo_id = ? AND pagina = ?')
      .get(cat.id, pagNum);
    if (!prod) {
      console.log(`  [skip] ${pagFolder} — produto não encontrado (pág. ${pagNum})`);
      skipped++; continue;
    }

    const files = fs.readdirSync(srcDir)
      .filter(f => !SKIP_FILES.has(f.toLowerCase()) && /\.(png|jpg|jpeg|webp)$/i.test(f));

    if (!files.length) {
      console.log(`  [skip] ${pagFolder} (${prod.nome}) — sem imagens de catálogo`);
      skipped++; continue;
    }

    // capa.png sempre primeiro se existir
    files.sort((a, b) => {
      const isCapaA = a.toLowerCase() === 'capa.png' ? 0 : 1;
      const isCapaB = b.toLowerCase() === 'capa.png' ? 0 : 1;
      return isCapaA - isCapaB;
    });

    const urls = [];
    for (const file of files) {
      const slug    = sanitizeFilename(`${CATALOGO_NOME}_pag${pagNum}_${file}`);
      const srcPath = path.join(srcDir, file);
      const dstPath = path.join(publicDir, slug);
      const isCapa  = file.toLowerCase() === 'capa.png';
      const cropTop = isCapa ? await detectarCropCapa(srcPath) : 0;
      if (isCapa && cropTop > 0) {
        console.log(`  ${prod.nome} pág.${pagNum} → ${slug} (crop topo: ${cropTop}px)`);
      } else {
        console.log(`  ${prod.nome} pág.${pagNum} → ${slug}`);
      }
      await aplicarWatermark(srcPath, dstPath, cropTop);
      urls.push(`/imagens/${encodeURIComponent(CATALOGO_NOME)}/${encodeURIComponent(slug)}`);
    }

    if (!DRY_RUN) {
      db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?')
        .run(JSON.stringify(urls), prod.id);
    }
    updated++;
  }

  console.log(`\n✓ ${updated} produto(s) atualizados, ${skipped} ignorados.`);
}

importar().catch(e => { console.error(e); process.exit(1); });
