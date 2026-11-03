/**
 * upscale-api.cjs — upscaling de IA via Replicate (Real-ESRGAN na nuvem)
 * Sem instalação local. Usa a API gratuita do replicate.com.
 *
 * SETUP (só uma vez):
 *   1. Crie conta gratuita em https://replicate.com
 *   2. Vá em https://replicate.com/account/api-tokens e gere um token
 *   3. Adicione ao .env.local:  REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxx
 *
 * Uso:
 *   node scripts/upscale-api.cjs --dir "C:\caminho\da\pasta"
 *   node scripts/upscale-api.cjs --pasta "Artano 2024"
 *   node scripts/upscale-api.cjs --dir "C:\caminho" --dry-run
 *   node scripts/upscale-api.cjs --dir "C:\caminho" --escala 2
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────
const MODELO_REPLICATE = 'nightmareai/real-esrgan';
const VERSAO_MODELO    = '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b';
const MIN_LARGURA      = 1200;   // imagens >= este valor são puladas
const ROOT             = path.join(__dirname, '..', 'public', 'imagens');
const ENV_FILE         = path.join(__dirname, '..', '.env.local');
// ─────────────────────────────────────────────────────────────────────────────

// Lê token do .env.local automaticamente
function lerToken() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;
  if (!fs.existsSync(ENV_FILE)) return null;
  const linhas = fs.readFileSync(ENV_FILE, 'utf8').split('\n');
  for (const linha of linhas) {
    const m = linha.match(/^REPLICATE_API_TOKEN\s*=\s*(.+)$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

// ─── ARGUMENTOS ──────────────────────────────────────────────────────────────
const args         = process.argv.slice(2);
const dryRun       = args.includes('--dry-run');
const force        = args.includes('--force');
const dirFlag      = args.indexOf('--dir');
const dirCustom    = dirFlag  !== -1 ? args[dirFlag + 1]  : null;
const pastaFlag    = args.indexOf('--pasta');
const somentePasta = pastaFlag !== -1 ? args[pastaFlag + 1] : null;
const escalaFlag   = args.indexOf('--escala');
const escalaFixa   = escalaFlag !== -1 ? parseInt(args[escalaFlag + 1]) : null;
// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function escolherEscala(largura) {
  if (escalaFixa) return escalaFixa;
  return largura < 600 ? 4 : 2;
}

// Baixa um arquivo de uma URL para um path local
function baixarArquivo(url, destino) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destino);
    https.get(url, res => {
      // Segue redirecionamentos
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destino);
        return baixarArquivo(res.headers.location, destino).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlinkSync(destino);
      reject(err);
    });
  });
}

// Chama a API do Replicate e aguarda o resultado
async function upscaleViaAPI(token, imagemBase64, escala) {
  // 1. Cria a predição
  const resPost = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: VERSAO_MODELO,
      input: {
        image: imagemBase64,
        scale: escala,
        face_enhance: false,
      },
    }),
  });

  const predicao = await resPost.json();

  if (!predicao.id) {
    const erro = predicao.detail || JSON.stringify(predicao);
    throw new Error(`Replicate recusou a requisição: ${erro}`);
  }

  // 2. Aguarda até ficar pronta (poll a cada 3s)
  let tentativas = 0;
  while (tentativas < 60) {
    await sleep(3000);
    tentativas++;

    const resGet = await fetch(`https://api.replicate.com/v1/predictions/${predicao.id}`, {
      headers: { 'Authorization': `Token ${token}` },
    });
    const status = await resGet.json();

    if (status.status === 'succeeded') return status.output;
    if (status.status === 'failed')    throw new Error(status.error || 'Falhou sem mensagem de erro');
    // status === 'starting' ou 'processing' → continua esperando
  }

  throw new Error('Timeout: a API demorou mais de 3 minutos para responder');
}

async function processarImagem(filePath, token) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return 'skip';

  const meta = await sharp(filePath).metadata();
  if (!force && meta.width >= MIN_LARGURA) return 'skip';

  const escala = escolherEscala(meta.width);

  if (dryRun) {
    const novaL = Math.round(meta.width * escala);
    process.stdout.write(`  [dry] ${path.basename(filePath).padEnd(40)} ${meta.width}px → x${escala} → ~${novaL}px\n`);
    return 'dry';
  }

  // Converte imagem para PNG base64 (formato que a API aceita melhor)
  const pngBuffer = await sharp(filePath).png().toBuffer();
  const base64    = `data:image/png;base64,${pngBuffer.toString('base64')}`;

  // Chama a API
  const urlResultado = await upscaleViaAPI(token, base64, escala);

  // Baixa o resultado para um arquivo temporário
  const tmpPath = filePath + '.api.tmp.png';
  await baixarArquivo(urlResultado, tmpPath);

  // Converte de volta para o formato original e sobrescreve
  if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(tmpPath).jpeg({ quality: 92, mozjpeg: true }).toFile(filePath + '.final.tmp');
    fs.unlinkSync(tmpPath);
    fs.renameSync(filePath + '.final.tmp', filePath);
  } else if (ext === '.webp') {
    await sharp(tmpPath).webp({ quality: 90 }).toFile(filePath + '.final.tmp');
    fs.unlinkSync(tmpPath);
    fs.renameSync(filePath + '.final.tmp', filePath);
  } else {
    fs.renameSync(tmpPath, filePath);
  }

  return 'ok';
}

function coletarImagens(dir) {
  const resultado = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) resultado.push(...coletarImagens(full));
    else resultado.push(full);
  }
  return resultado;
}

async function main() {
  const token = lerToken();

  if (!token) {
    console.error('\n─────────────────────────────────────────────────');
    console.error('  Token do Replicate não encontrado!');
    console.error('');
    console.error('  1. Crie conta gratuita em: https://replicate.com');
    console.error('  2. Gere um token em:        https://replicate.com/account/api-tokens');
    console.error('  3. Adicione ao .env.local:');
    console.error('     REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxx');
    console.error('─────────────────────────────────────────────────\n');
    process.exit(1);
  }

  const raiz = dirCustom ? path.resolve(dirCustom) : ROOT;

  if (!fs.existsSync(raiz)) {
    console.error(`\nPasta não encontrada: ${raiz}\n`);
    process.exit(1);
  }

  // Coleta todos os arquivos de imagem
  let arquivos;
  if (dirCustom) {
    arquivos = coletarImagens(raiz);
  } else {
    arquivos = fs.readdirSync(raiz)
      .filter(f => fs.statSync(path.join(raiz, f)).isDirectory() && (!somentePasta || f === somentePasta))
      .flatMap(pasta => coletarImagens(path.join(raiz, pasta)));
  }

  arquivos = arquivos.filter(f => ['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(f).toLowerCase()));

  // Pré-filtra para contar quantas serão processadas
  const paraProcessar = [];
  for (const f of arquivos) {
    try {
      const { width } = await sharp(f).metadata();
      if (force || width < MIN_LARGURA) paraProcessar.push({ f, width });
    } catch { /* ignora arquivos corrompidos */ }
  }

  console.log(`\nUpscale via Replicate (${MODELO_REPLICATE})${dryRun ? ' [DRY RUN]' : ''}`);
  console.log(`Raiz: ${raiz}`);
  console.log(`Total de imagens encontradas : ${arquivos.length}`);
  console.log(`Para processar (< ${MIN_LARGURA}px)  : ${paraProcessar.length}`);
  console.log('');

  if (paraProcessar.length === 0) {
    console.log('Nenhuma imagem precisa de upscale. Use --force para processar todas.');
    return;
  }

  let ok = 0, erros = 0;
  const inicio = Date.now();

  for (let i = 0; i < paraProcessar.length; i++) {
    const { f, width } = paraProcessar[i];
    const escala = escolherEscala(width);
    const progresso = `[${i + 1}/${paraProcessar.length}]`;

    process.stdout.write(`${progresso} ${path.basename(f)} (${width}px → x${escala})... `);

    try {
      await processarImagem(f, token);
      const decorrido = ((Date.now() - inicio) / 1000).toFixed(0);
      console.log(`✓ (${decorrido}s total)`);
      ok++;
    } catch (e) {
      console.log(`✗ ERRO: ${e.message}`);
      erros++;
    }
  }

  const tempo = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log('\n' + '─'.repeat(50));
  console.log(`Concluído em ${tempo}s`);
  console.log(`  ✓ Processadas: ${ok}`);
  if (erros > 0) console.log(`  ✗ Erros: ${erros}`);
  if (dryRun) console.log('\n(dry-run: nenhum arquivo foi alterado)');
}

main().catch(err => { console.error(err); process.exit(1); });
