/**
 * limpar-nomes.cjs
 * Renomeia arquivos em todas as pastas "pag XX" de "imagens dos produtos":
 *  - Remove prefixo "Aço Mobilia XXXX-X — ..." ou "Aço Mobilia XXXX-X "
 *  - Converte .jfif → .jpg
 *  - Converte sufixo (1),(2),(3)... → b, c, d...
 *  - Remove caracteres problemáticos para URLs no Linux/Vercel: [ ] —
 */
const fs   = require('fs')
const path = require('path')

const SRC_BASE = 'C:\\Users\\joao.miguel\\Documents\\catalogos\\catalogos separados\\Aço Mobilia 2025-7\\imagens dos produtos'
const IMG_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jfif'])

const SUFIXOS = { '(1)': 'b', '(2)': 'c', '(3)': 'd', '(4)': 'e', '(5)': 'f' }

function limparNome(nome) {
  let n = nome

  // Remove prefixo "Aço Mobilia XXXX-X — " ou "Aço Mobilia XXXX-X " (com ou sem em-dash)
  n = n.replace(/^[Aa][çc][o]?\s+[Mm]obilia\s+\d{4}-\d+\s*[—\-]*\s*/i, '')
  n = n.replace(/^[Aa][çc][o]?\s+[Mm]obilia\s+\d{4}-\d+\s*/i, '')

  // Remove colchetes e conteúdo entre eles: " [4] " → " "
  n = n.replace(/\s*\[[^\]]*\]\s*/g, ' ').trim()

  // Remove em-dash (—) isolado
  n = n.replace(/\s*—\s*/g, ' ').trim()

  // Converte sufixos (1), (2)... → b, c...
  for (const [suf, letra] of Object.entries(SUFIXOS)) {
    n = n.replace(` ${suf}`, letra)
    n = n.replace(suf, letra)
  }

  // Troca extensão .jfif por .jpg
  n = n.replace(/\.jfif$/i, '.jpg')

  // Remove espaços duplos
  n = n.replace(/\s+/g, ' ').trim()

  return n
}

const pastas = fs.readdirSync(SRC_BASE, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^pag\s*\d+$/i.test(d.name))
  .map(d => d.name)

let totalRenomeados = 0

for (const pasta of pastas) {
  const dir = path.join(SRC_BASE, pasta)
  const arquivos = fs.readdirSync(dir).filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))

  for (const arquivo of arquivos) {
    const novo = limparNome(arquivo)
    if (novo === arquivo) continue

    const srcPath  = path.join(dir, arquivo)
    const destPath = path.join(dir, novo)

    if (fs.existsSync(destPath)) {
      console.warn(`  [dup] ${pasta}/${novo} já existe, pulando "${arquivo}"`)
      continue
    }

    fs.renameSync(srcPath, destPath)
    console.log(`  ✓ ${pasta}: "${arquivo}" → "${novo}"`)
    totalRenomeados++
  }
}

console.log(`\n${totalRenomeados} arquivo(s) renomeado(s).`)
