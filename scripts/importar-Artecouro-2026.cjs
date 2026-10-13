'use strict';
/**
 * Importa imagens dos catálogos Artecouro 2026 e Artecouro Concept 2026
 * direto das páginas convertidas do PDF (pdf-convertido/).
 *
 * Para cada produto: página par = foto do produto, página ímpar seguinte = ficha técnica.
 *
 * Uso: node scripts/importar-Artecouro-2026.cjs [--dry-run]
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const sharp    = require('sharp');
const { BASE_CATALOGOS } = require('./config.cjs');

const DRY_RUN = process.argv.includes('--dry-run');

const PDF_DIR   = path.join(BASE_CATALOGOS, 'Artecouro 2025', 'imagens dos produtos', 'pdf-convertido');
const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo-csm.png');
const DB_PATH   = path.join(__dirname, '..', 'database', 'catalogo.db');
const db        = new Database(DB_PATH);

const OPACITY     = 0.38;
const LOGO_RATIO  = 0.14;
const MARGIN_RATIO = 0.025;
const logoBuffer  = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;

async function aplicarWatermark(srcPath, destPath) {
  if (DRY_RUN) return;
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

// Catálogos: nome no banco → prefixo do arquivo → pasta em public/imagens
const CATALOGOS = [
  {
    nome:    'Artecouro 2026',
    prefixo: 'Catálogo_Artecouro_2026',
  },
  {
    nome:    'Artecouro Concept 2026',
    prefixo: 'Catálogo_Artecouro_Concept_2026',
  },
];

async function importarCatalogo({ nome, prefixo }) {
  const cat = db.prepare('SELECT id, pasta FROM catalogos WHERE nome = ?').get(nome);
  if (!cat) { console.error(`Catálogo "${nome}" não encontrado.`); return; }

  const publicDir = path.join(__dirname, '..', 'public', 'imagens', cat.pasta);
  if (!DRY_RUN) fs.mkdirSync(publicDir, { recursive: true });

  const produtos = db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = ? ORDER BY pagina').all(cat.id);
  console.log(`\n═══ ${nome} (ID ${cat.id}) — ${produtos.length} produtos ═══`);

  let atualizados = 0;
  for (const prod of produtos) {
    const pagFoto   = prod.pagina;          // página par = foto do produto
    const pagFicha  = prod.pagina + 1;       // página ímpar = ficha técnica

    const arquivoFoto  = `foto_pag${pagFoto}_${prefixo}.png`;
    const arquivoFicha = `foto_pag${pagFicha}_${prefixo}.png`;
    const srcFoto   = path.join(PDF_DIR, arquivoFoto);
    const srcFicha  = path.join(PDF_DIR, arquivoFicha);

    const urls = [];

    // Foto do produto (capa)
    if (fs.existsSync(srcFoto)) {
      const destFoto = path.join(publicDir, arquivoFoto);
      if (!fs.existsSync(destFoto)) {
        process.stdout.write(`  [${prod.nome}] watermark foto...`);
        await aplicarWatermark(srcFoto, destFoto);
        if (!DRY_RUN) console.log(' ✓');
      }
      urls.push(`/imagens/${encodeURIComponent(cat.pasta)}/${encodeURIComponent(arquivoFoto)}`);
    } else {
      console.warn(`  [${prod.nome}] ⚠ Foto não encontrada: ${arquivoFoto}`);
    }

    // Ficha técnica (galeria)
    if (fs.existsSync(srcFicha)) {
      const destFicha = path.join(publicDir, arquivoFicha);
      if (!fs.existsSync(destFicha)) {
        process.stdout.write(`  [${prod.nome}] watermark ficha...`);
        await aplicarWatermark(srcFicha, destFicha);
        if (!DRY_RUN) console.log(' ✓');
      }
      urls.push(`/imagens/${encodeURIComponent(cat.pasta)}/${encodeURIComponent(arquivoFicha)}`);
    }

    if (urls.length > 0 && !DRY_RUN) {
      db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(urls), prod.id);
      atualizados++;
      console.log(`  ✓ ${prod.nome} (p${pagFoto}) — ${urls.length} imagem(ns)`);
    } else if (DRY_RUN) {
      console.log(`  [DRY] ${prod.nome} p${pagFoto}: foto=${fs.existsSync(srcFoto)} ficha=${fs.existsSync(srcFicha)}`);
    }
  }
  console.log(`\n  → ${atualizados}/${produtos.length} produtos atualizados`);
}

async function main() {
  console.log(`Importação Artecouro 2026${DRY_RUN ? ' [DRY-RUN]' : ''}`);
  console.log(`PDF dir: ${PDF_DIR}\n`);

  for (const cat of CATALOGOS) {
    await importarCatalogo(cat);
  }

  if (!DRY_RUN) db.close();
  console.log('\nConcluído!');
}

main().catch(e => { console.error(e); process.exit(1); });
