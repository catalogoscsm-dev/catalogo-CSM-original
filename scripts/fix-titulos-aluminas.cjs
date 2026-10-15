// Corta o título do topo das imagens do catálogo ALUMINAS 2024
// Estratégia: varre top 30% da imagem, detecta últimas linhas com >85% pixels brancos
const sharp = require('sharp')
const fs    = require('fs')
const path  = require('path')

const PASTA = path.join(__dirname, '../public/imagens/ALUMINAS 2024')
const THRESHOLD  = 0.85   // % de pixels brancos para considerar linha de header
const MAX_SCAN   = 0.30   // varrer só os primeiros 30% da altura
const MIN_CROP   = 0.02   // crop mínimo: 2% da altura (ignora imagens sem header)
const PAD        = 10     // pixels extras abaixo do último header

async function detectarCrop(srcPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  const maxY = Math.floor(height * MAX_SCAN)
  let lastHeaderRow = 0

  for (let y = 0; y < maxY; y++) {
    let white = 0
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (data[i] > 225 && data[i+1] > 225 && data[i+2] > 225) white++
    }
    if (white / width > THRESHOLD) lastHeaderRow = y
  }

  return lastHeaderRow > height * MIN_CROP ? lastHeaderRow + PAD : 0
}

async function processar() {
  const arquivos = fs.readdirSync(PASTA).filter(f => /\.(png|jpg|jpeg)$/i.test(f))
  console.log(`${arquivos.length} imagens encontradas em ALUMINAS 2024\n`)

  let cortados = 0, ignorados = 0

  for (const nome of arquivos) {
    const src = path.join(PASTA, nome)
    const cropY = await detectarCrop(src)

    if (cropY === 0) {
      console.log(`  ↷ sem header   ${nome}`)
      ignorados++
      continue
    }

    const meta = await sharp(src).metadata()
    const novaAltura = meta.height - cropY

    const tmp = src + '.tmp.png'
    await sharp(src)
      .extract({ left: 0, top: cropY, width: meta.width, height: novaAltura })
      .png({ compressionLevel: 8 })
      .toFile(tmp)

    fs.renameSync(tmp, src)
    console.log(`  ✓ cortou ${cropY}px  ${nome}`)
    cortados++
  }

  console.log(`\nPronto: ${cortados} cortados, ${ignorados} ignorados.`)
}

processar().catch(console.error)
