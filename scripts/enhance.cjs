/**
 * enhance.cjs — melhora qualidade de imagens de recorte
 * Foca em: nitidez nas bordas, leve contraste, sem distorção de cor
 *
 * Uso standalone:
 *   node scripts/enhance.cjs "caminho/entrada.png" "caminho/saida.png"
 *
 * Como função (usado pelo importar-armil.cjs):
 *   const { enhanceImage } = require('./enhance.cjs')
 *   await enhanceImage(srcPath, destPath)
 */

const sharp = require('sharp')
const path = require('path')

async function enhanceImage(inputPath, outputPath) {
  const img = sharp(inputPath)
  const meta = await img.metadata()

  // Upscale moderado só se a imagem for pequena (< 800px de largura)
  const shouldUpscale = meta.width < 800
  const targetW = shouldUpscale ? Math.min(meta.width * 2, 1600) : meta.width

  await img
    // 1. Upscale suave com Lanczos se necessário
    .resize(targetW, null, { kernel: sharp.kernel.lanczos3 })
    // 2. Sharpening nas bordas — sigma baixo = só toca as transições nítidas
    //    (exatamente o que acontece nas bordas pixeladas de recorte)
    .sharpen({ sigma: 1.2, m1: 1.5, m2: 0.5 })
    // 3. Leve boost de contraste/clareza sem alterar as cores
    .modulate({ brightness: 1.02, saturation: 1.05 })
    // 4. Saída PNG com compressão equilibrada
    .png({ compressionLevel: 8, adaptiveFiltering: true })
    .toFile(outputPath)
}

// Se rodado direto na linha de comando
if (require.main === module) {
  const [, , input, output] = process.argv
  if (!input || !output) {
    console.error('\nUso: node scripts/enhance.cjs <entrada> <saida>\n')
    process.exit(1)
  }
  enhanceImage(input, output)
    .then(() => console.log(`✓ Salvo em: ${output}`))
    .catch(err => { console.error(err); process.exit(1) })
}

module.exports = { enhanceImage }
