/**
 * upscale.cjs — upscaling de IA em lote usando Real-ESRGAN
 *
 * Pré-requisito: baixar o executável em
 *   https://github.com/xinntao/Real-ESRGAN/releases
 *   (arquivo: realesrgan-ncnn-vulkan-*-windows.zip)
 *   e descompactar em: catalogo-digital/tools/
 *   (o .exe e os modelos devem ficar dentro dessa pasta)
 *
 * Uso:
 *   node scripts/upscale.cjs                                      # todas as imagens importadas
 *   node scripts/upscale.cjs --pasta "Artano 2024"                # só um catálogo importado
 *   node scripts/upscale.cjs --dir "C:\caminho\qualquer\pasta"    # qualquer pasta do disco
 *   node scripts/upscale.cjs --dry-run                            # simula sem alterar
 *   node scripts/upscale.cjs --force                              # processa mesmo imagens grandes
 *   node scripts/upscale.cjs --min-largura 800                    # muda o limiar (padrão: 1200)
 */

const { spawnSync } = require('child_process');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────
const ESRGAN_EXE  = path.join(__dirname, '..', 'tools', 'realesrgan-ncnn-vulkan.exe');
const MODELO      = 'realesrgan-x4plus';   // melhor para fotos realistas
const MIN_LARGURA = 1200;                  // px — pula imagens já maiores que isso
const ROOT        = path.join(__dirname, '..', 'public', 'imagens');
// ─────────────────────────────────────────────────────────────────────────────

const args          = process.argv.slice(2);
const dryRun        = args.includes('--dry-run');
const force         = args.includes('--force');
const pastaFlag     = args.indexOf('--pasta');
const somentePasta  = pastaFlag !== -1 ? args[pastaFlag + 1] : null;
const dirFlag       = args.indexOf('--dir');
const dirCustom     = dirFlag !== -1 ? args[dirFlag + 1] : null;
const minLarFlag    = args.indexOf('--min-largura');
const limiar        = minLarFlag !== -1 ? parseInt(args[minLarFlag + 1]) : MIN_LARGURA;

// Escala aplicada conforme tamanho atual da imagem
function escolherEscala(largura) {
  if (largura < 600) return 4;
  return 2;
}

async function processarImagem(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return 'skip';

  const meta  = await sharp(filePath).metadata();
  const largura = meta.width;

  if (!force && largura >= limiar) return 'skip';

  const escala   = escolherEscala(largura);
  const tmpPng   = filePath + '.esrgan.tmp.png';

  if (dryRun) {
    const novaLargura = Math.round(largura * escala);
    process.stdout.write(`  [dry] ${path.relative(ROOT, filePath).padEnd(60)} ${largura}px → x${escala} → ~${novaLargura}px\n`);
    return 'dry';
  }

  // Chama o executável Real-ESRGAN
  const resultado = spawnSync(
    ESRGAN_EXE,
    ['-i', filePath, '-o', tmpPng, '-n', MODELO, '-s', String(escala)],
    { cwd: path.dirname(ESRGAN_EXE), stdio: 'pipe' }
  );

  if (resultado.status !== 0 || !fs.existsSync(tmpPng)) {
    const msg = (resultado.stderr?.toString() || resultado.stdout?.toString() || '').trim();
    throw new Error(msg || `ESRGAN retornou status ${resultado.status}`);
  }

  // Converte o PNG temporário de volta para o formato original
  if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(tmpPng).jpeg({ quality: 92, mozjpeg: true }).toFile(filePath + '.final.tmp');
    fs.unlinkSync(tmpPng);
    fs.renameSync(filePath + '.final.tmp', filePath);
  } else if (ext === '.webp') {
    await sharp(tmpPng).webp({ quality: 90 }).toFile(filePath + '.final.tmp');
    fs.unlinkSync(tmpPng);
    fs.renameSync(filePath + '.final.tmp', filePath);
  } else {
    // PNG → PNG (lossless, mantém qualidade máxima)
    fs.renameSync(tmpPng, filePath);
  }

  return 'ok';
}

function coletarImagens(dir) {
  const resultado = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      resultado.push(...coletarImagens(full));
    } else {
      resultado.push(full);
    }
  }
  return resultado;
}

async function main() {
  if (!fs.existsSync(ESRGAN_EXE)) {
    console.error(`\nExecutável não encontrado: ${ESRGAN_EXE}`);
    console.error('\nBaixe em: https://github.com/xinntao/Real-ESRGAN/releases');
    console.error('Descompacte o ZIP em: catalogo-digital/tools/');
    console.error('Certifique-se que o .exe e a pasta "models" estão dentro de tools/\n');
    process.exit(1);
  }

  // Decide a raiz: --dir tem prioridade, senão usa public/imagens
  const raiz = dirCustom ? path.resolve(dirCustom) : ROOT;

  if (!fs.existsSync(raiz)) {
    console.error(`\nPasta não encontrada: ${raiz}\n`);
    process.exit(1);
  }

  console.log(`\nUpscale IA — Real-ESRGAN (${MODELO})${dryRun ? ' [DRY RUN]' : ''}${force ? ' [FORCE]' : ''}`);
  console.log(`Raiz: ${raiz}`);
  console.log(`Limiar: imagens com largura < ${limiar}px serão processadas`);
  if (somentePasta && !dirCustom) console.log(`Filtrando por catálogo: ${somentePasta}`);
  console.log('');

  // Com --dir, trata a pasta inteira como uma única unidade (não divide por subpastas)
  // Sem --dir, itera pelas subpastas de catálogos dentro de public/imagens
  let pastas;
  if (dirCustom) {
    pastas = ['.'];  // processa a pasta raiz diretamente
  } else {
    pastas = fs.readdirSync(raiz).filter(f =>
      fs.statSync(path.join(raiz, f)).isDirectory() &&
      (!somentePasta || f === somentePasta)
    );
  }

  if (pastas.length === 0) {
    console.error(`Nenhuma pasta encontrada em: ${raiz}`);
    if (somentePasta) console.error(`(verifique o nome exato: "${somentePasta}")`);
    process.exit(1);
  }

  let totalArqs = 0, processadas = 0, puladas = 0, erros = 0;
  const inicio = Date.now();

  for (const pasta of pastas) {
    const pastaPath = path.join(raiz, pasta);
    const arquivos  = coletarImagens(pastaPath).filter(f =>
      ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(f).toLowerCase())
    );

    if (arquivos.length === 0) continue;

    // Conta quantas vão ser processadas
    let processaveis = 0;
    for (const f of arquivos) {
      try {
        const { width } = await sharp(f).metadata();
        if (force || width < limiar) processaveis++;
      } catch { /* ignora */ }
    }

    console.log(`📁 ${pasta} — ${arquivos.length} imagens, ${processaveis} para processar`);

    for (let i = 0; i < arquivos.length; i++) {
      const filePath = arquivos[i];
      totalArqs++;
      try {
        const status = await processarImagem(filePath);
        if (status === 'ok') {
          processadas++;
          const nome = path.basename(filePath).padEnd(35);
          const decorrido = ((Date.now() - inicio) / 1000).toFixed(0);
          process.stdout.write(`  ✓ [${processadas}] ${nome} (${decorrido}s)\n`);
        } else if (status === 'skip') {
          puladas++;
        }
      } catch (e) {
        erros++;
        console.error(`  ✗ ERRO: ${path.basename(filePath)} — ${e.message}`);
      }
    }
    console.log('');
  }

  const tempo = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log('─'.repeat(50));
  console.log(`Concluído em ${tempo}s`);
  console.log(`  ✓ Processadas : ${processadas}`);
  console.log(`  → Puladas     : ${puladas} (já >= ${limiar}px)`);
  if (erros > 0) console.log(`  ✗ Erros       : ${erros}`);
  if (dryRun) console.log('\n(dry-run: nenhum arquivo foi alterado)');
}

main().catch(err => { console.error(err); process.exit(1); });
