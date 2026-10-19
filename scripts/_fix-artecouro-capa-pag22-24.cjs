'use strict';
/**
 * Re-gera pag 22 (Colorado) e pag 24 (Como) para Artecouro 2026
 * usando capa.PNG limpo (sem título) como fonte.
 * Também remove a segunda imagem (ficha técnica) do array de imagens.
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const sharp    = require('sharp');
const { BASE_CATALOGOS } = require('./config.cjs');

const DB_PATH   = path.join(__dirname, '..', 'database', 'catalogo.db');
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo-csm.png');
const db        = new Database(DB_PATH);

const OPACITY      = 0.38;
const LOGO_RATIO   = 0.14;
const MARGIN_RATIO = 0.025;
const logoBuffer   = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

async function aplicarWatermark(srcPath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (!logoBuffer) { fs.copyFileSync(srcPath, destPath); return; }
  const img  = sharp(srcPath);
  const { width, height } = await img.metadata();
  const logoW   = Math.max(60, Math.round(width * LOGO_RATIO));
  const margin  = Math.round(width * MARGIN_RATIO);
  const resized = await sharp(logoBuffer).resize({ width: logoW, fit: 'inside' }).png().toBuffer();
  const meta    = await sharp(resized).metadata();
  const { data, info } = await sharp(resized).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * OPACITY);
  const overlay = await sharp(Buffer.from(data), { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
  await sharp(srcPath)
    .composite([{ input: overlay, left: width - meta.width - margin, top: height - meta.height - margin, blend: 'over' }])
    .toFile(destPath);
}

const BASE_ARTECOURO = path.join(BASE_CATALOGOS, 'Artecouro 2025', 'imagens dos produtos', 'Artecouro 2026');

// Mapeamento: pagina → capa.PNG limpa
const PAGINAS = [22, 24];

async function main() {
  const cat = db.prepare("SELECT id, pasta FROM catalogos WHERE nome = 'Artecouro 2026'").get();
  if (!cat) { console.error('Catálogo Artecouro 2026 não encontrado.'); process.exit(1); }

  const publicDir = path.join(__dirname, '..', 'public', 'imagens', cat.pasta);

  for (const pag of PAGINAS) {
    const prod = db.prepare('SELECT id, nome, imagens FROM produtos WHERE catalogo_id = ? AND pagina = ?').get(cat.id, pag);
    if (!prod) { console.error(`Produto pag ${pag} não encontrado.`); continue; }

    const capaPath = path.join(BASE_ARTECOURO, `pag ${pag}`, 'capa.PNG');
    if (!fs.existsSync(capaPath)) {
      console.error(`  capa.PNG não encontrado: ${capaPath}`);
      continue;
    }

    const destName = `foto_pag${pag}_Catálogo_Artecouro_2026.png`;
    const destPath = path.join(publicDir, destName);

    console.log(`  [${prod.nome}] re-gerando imagem limpa...`);
    await aplicarWatermark(capaPath, destPath);
    console.log(`  ✓ ${destPath}`);

    // Manter apenas a primeira imagem (remover ficha técnica do array)
    const imagensAtuais = JSON.parse(prod.imagens || '[]');
    const urlFoto = `/imagens/${encodeURIComponent(cat.pasta)}/${encodeURIComponent(destName)}`;
    const novasImagens = JSON.stringify([urlFoto]);
    db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(novasImagens, prod.id);
    console.log(`  ✓ imagens DB atualizado → apenas 1 imagem (era ${imagensAtuais.length})`);
  }

  db.close();
  console.log('\nConcluído!');
}

main().catch(e => { console.error(e); process.exit(1); });
