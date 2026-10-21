const { createCanvas, loadImage } = require('@napi-rs/canvas')
const fs = require('fs')
const path = require('path')

const SRC = 'C:/Users/joao.miguel/Downloads/Noir — versão escura@1xx.png'
const DEST = path.join(__dirname, '../public/icons')

fs.mkdirSync(DEST, { recursive: true })

async function gerarIcone(tamanho, arquivo) {
  const img = await loadImage(SRC)
  const canvas = createCanvas(tamanho, tamanho)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, tamanho, tamanho)
  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(path.join(DEST, arquivo), buffer)
  console.log(`✓ ${arquivo} (${tamanho}x${tamanho})`)
}

;(async () => {
  await gerarIcone(192, 'icon-192.png')
  await gerarIcone(512, 'icon-512.png')
  console.log('Ícones PWA gerados em public/icons/')
})()
