/**
 * Aplica marca d'água da CSM em todas as imagens de produtos.
 * Uso: node scripts/watermark.cjs
 * Flags: --dry-run (mostra o que faria sem alterar), --pasta "NOME" (só um catálogo)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public', 'imagens');
const LOGO = path.join(__dirname, '..', 'public', 'logo-csm.png');
const OPACITY = 0.38;       // 38% de opacidade
const LOGO_RATIO = 0.14;    // 14% da largura da imagem
const MARGIN_RATIO = 0.025; // margem de 2.5% das bordas

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const pastaFlag = args.indexOf('--pasta');
const somentePasta = pastaFlag !== -1 ? args[pastaFlag + 1] : null;

async function buildOverlay(logoBuffer, targetW, targetH) {
  const logoW = Math.max(60, Math.round(targetW * LOGO_RATIO));
  const margin = Math.round(targetW * MARGIN_RATIO);

  // Redimensiona o logo mantendo proporção
  const resized = await sharp(logoBuffer)
    .resize({ width: logoW, fit: 'inside' })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  const lw = meta.width;
  const lh = meta.height;

  // Aplica opacidade: extrai canal alpha e multiplica
  const withAlpha = await sharp(resized)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = withAlpha;
  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * OPACITY);
  }

  const overlay = await sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toBuffer();

  return {
    overlay,
    left: targetW - lw - margin,
    top: targetH - lh - margin,
  };
}

async function processImage(filePath, logoBuffer) {
  const ext = path.extname(filePath).toLowerCase();
  const supported = ['.png', '.jpg', '.jpeg', '.webp'];
  if (!supported.includes(ext)) return false;

  const img = sharp(filePath);
  const { width, height } = await img.metadata();

  const { overlay, left, top } = await buildOverlay(logoBuffer, width, height);

  if (dryRun) {
    console.log(`  [dry] ${path.relative(ROOT, filePath)} (${width}x${height})`);
    return true;
  }

  // Salva no mesmo arquivo (sobrescreve)
  const tmpPath = filePath + '.wm.tmp';
  await sharp(filePath)
    .composite([{ input: overlay, left, top, blend: 'over' }])
    .toFile(tmpPath);

  fs.renameSync(tmpPath, filePath);
  return true;
}

async function main() {
  if (!fs.existsSync(LOGO)) {
    console.error('Logo não encontrado em:', LOGO);
    process.exit(1);
  }

  const logoBuffer = fs.readFileSync(LOGO);
  console.log(`Marca d'água CSM — opacidade ${Math.round(OPACITY * 100)}%${dryRun ? ' [DRY RUN]' : ''}`);
  console.log('Pasta base:', ROOT);
  if (somentePasta) console.log('Filtrando por:', somentePasta);
  console.log('');

  const pastas = fs.readdirSync(ROOT).filter(f =>
    fs.statSync(path.join(ROOT, f)).isDirectory() &&
    (!somentePasta || f === somentePasta)
  );

  function collectImages(dir) {
    const result = [];
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) {
        result.push(...collectImages(full));
      } else {
        result.push(full);
      }
    }
    return result;
  }

  let total = 0, ok = 0;
  for (const pasta of pastas) {
    const pastaPath = path.join(ROOT, pasta);
    const arquivos = collectImages(pastaPath);
    console.log(`📁 ${pasta} (${arquivos.length} arquivos)`);

    for (const filePath of arquivos) {
      total++;
      try {
        const processed = await processImage(filePath, logoBuffer);
        if (processed) { ok++; process.stdout.write('.'); }
      } catch (e) {
        console.error(`\n  ERRO: ${path.basename(filePath)} — ${e.message}`);
      }
    }
    console.log('');
  }

  console.log(`\nConcluído: ${ok}/${total} imagens processadas.`);
  if (dryRun) console.log('(dry-run: nenhum arquivo foi alterado)');
}

main().catch(err => { console.error(err); process.exit(1); });
