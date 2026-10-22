const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/Artano 2024/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/Artano 2024')

// Remove só as páginas que serão re-inseridas (idempotente)
db.prepare('DELETE FROM produtos WHERE catalogo_id = 2 AND pagina IN (3,5,7,9)').run()

// Cria pasta de destino
if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true })

const produtos = [
  // (só os 4 que faltaram — o resto já está no banco)
  // ── SOFÁS ──────────────────────────────────────────────────────────────────
  { pag:  3, nome: 'Álamo',          cat: 'Sofá',     dim: '2,16-2,96m x 0,95 x 0,92m',   acab: 'Tecido 4008 / Base Castanho' },
  { pag:  5, nome: 'Albert',         cat: 'Sofá',     dim: '2,76-2,96m x 1,03 x 0,86m',   acab: 'Tecido 2004 / Pés Cromados'  },
  { pag:  7, nome: 'Canoas',         cat: 'Sofá',     dim: '2,60-3,00m x 1,26 x 0,69m',   acab: 'Base Madeira Tauari'         },
  { pag:  9, nome: 'Delta',          cat: 'Sofá',     dim: '2,20-3,08m x 1,07 x 0,74m',   acab: 'Pés Madeira'                 },
  { pag: 11, nome: 'Dylan',          cat: 'Sofá',     dim: 'Modular (múltiplos módulos)',   acab: 'Tecido 1009 / Pés Castanho'  },
  { pag: 13, nome: 'Fatto',          cat: 'Sofá',     dim: '2,15-2,90m x 0,94 x 0,89m',   acab: 'Tecido 2003 / Pés Preto'     },
  { pag: 15, nome: 'Front',          cat: 'Sofá',     dim: '2,40-3,44m x 1,01 x 0,82m',   acab: 'Tecido 2014 / Pés Champagne' },
  { pag: 17, nome: 'Gramado',        cat: 'Sofá',     dim: '3,00-3,90m x 0,64 x 0,71m',   acab: 'Base Madeira Tauari'         },
  { pag: 19, nome: 'Milano',         cat: 'Sofá',     dim: '3,15m x 1,00 x 0,90m (módulos)', acab: 'Tecido 3000 / Pés Champagne' },
  { pag: 21, nome: 'Mirage',         cat: 'Sofá',     dim: '2,07-5,14m x 1,05-1,68 x 0,88m', acab: 'Tecido 1013 / Pés Preto'  },
  { pag: 23, nome: 'Missões',        cat: 'Sofá',     dim: '2,70-3,00m x 0,64 x 0,75m',   acab: 'Tecido P04 / Base Castanho'  },
  { pag: 25, nome: 'Monte Carlo',    cat: 'Sofá',     dim: '2,84-4,04m x 1,05 x 0,82m',   acab: 'Tecido P00 / Base Castanho'  },
  { pag: 27, nome: 'Monte Carlo',    cat: 'Sofá',     dim: '2,08-3,48m x 1,05 x 0,82m',   acab: 'Base Castanho'               },
  { pag: 29, nome: 'Pampas',         cat: 'Sofá',     dim: '2,56-2,96m x 0,69 x 0,72m',   acab: 'Tecido 2025 / Pés Grafite'   },
  { pag: 31, nome: 'Planalto',       cat: 'Sofá',     dim: 'Módulos 1,20-1,80m x 0,95 x 0,75m', acab: 'Base Madeira Tauari'  },
  { pag: 33, nome: 'Santa Carolina', cat: 'Sofá',     dim: '1,20-1,60m x 1,60-1,90 x 0,83m', acab: 'Tecido P08 / Pés Flutuantes' },
  { pag: 35, nome: 'Santa Carolina', cat: 'Sofá',     dim: 'Modular + Chaisê',             acab: 'Tecido 5006 / Pés Flutuante' },
  { pag: 37, nome: 'Serrano',        cat: 'Sofá',     dim: '2,91 x 1,48 x 0,72m',          acab: 'Base Madeira Tauari'         },
  // ── POLTRONAS ──────────────────────────────────────────────────────────────
  { pag: 39, nome: 'Aurora',         cat: 'Poltrona', dim: '0,80 x 0,80 x 0,65m',          acab: 'Base Giratória Madeira'      },
  { pag: 41, nome: 'Bella',          cat: 'Poltrona', dim: '0,99 x 0,78 x 0,85m',          acab: 'Tecido P04 / Pés Champagne'  },
  { pag: 43, nome: 'Córdoba',        cat: 'Poltrona', dim: '0,90 x 0,90 x 0,89m',          acab: 'Tecido 5010 / Pés Castanho'  },
  { pag: 45, nome: 'Leona',          cat: 'Poltrona', dim: '0,84 x 0,90 x 0,76m',          acab: 'Tecido P05 / Couro Caramelo ou Preto' },
  { pag: 47, nome: 'Lina',           cat: 'Poltrona', dim: '0,91 x 0,79 x 0,83m',          acab: 'Tecido 2009 / Base Giratória' },
  { pag: 49, nome: 'Mariana',        cat: 'Poltrona', dim: '1,00 x 0,92 x 0,82m',          acab: 'Tecido 2008 / Base Castanho'  },
  { pag: 51, nome: 'Pumma',          cat: 'Poltrona', dim: '1,03 x 0,90 x 0,75m',          acab: 'Tecido 2010 / Pés Grafite'   },
  { pag: 53, nome: 'Sicília',        cat: 'Poltrona', dim: '1,00 x 0,94 x 0,89m',          acab: 'Tecido 2003 / Pés Preto'     },
  { pag: 55, nome: 'Zarah',          cat: 'Poltrona', dim: '1,00 x 0,80 x 0,89m',          acab: 'Tecido 5002 / Pés Grafite'   },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (2, ?, ?, ?, ?, ?, ?, ?)
`)

let ok = 0
for (const p of produtos) {
  const pagStr   = String(p.pag).padStart(2, '0')
  const srcCapa  = path.join(SRC, `pag ${pagStr}`, 'capa.png')
  const destName = `pag${p.pag}-capa.png`
  const destPath = path.join(DEST, destName)

  if (!fs.existsSync(srcCapa)) {
    console.error(`  ✗ pag ${p.pag} — capa.png não encontrada`)
    continue
  }

  fs.copyFileSync(srcCapa, destPath)
  const imagens = JSON.stringify([`/imagens/Artano 2024/${destName}`])
  stmt.run('', p.nome, p.cat, p.dim, p.acab, p.pag, imagens)
  console.log(`  ✓ pag ${p.pag.toString().padStart(2)} — ${p.nome} (${p.cat})`)
  ok++
}

console.log(`\nConcluído: ${ok}/27 produtos inseridos.`)
