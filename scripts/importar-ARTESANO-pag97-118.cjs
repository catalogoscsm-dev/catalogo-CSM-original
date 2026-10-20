const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ARTESANO 2025/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ARTESANO 2025')

const produtos = [
  { pag: 97,  nome: 'Mesa de Centro',        cod: '28014', dim: 'L76,8xA30,8xP70,1CM', acab: 'Hanover | Nero',                              cat: 'Mesa de Centro'    },
  { pag: 98,  nome: 'Mesa de Centro',        cod: '28017', dim: 'L120xA30xP60CM',       acab: 'Hanover | Nero',                              cat: 'Mesa de Centro'    },
  { pag: 99,  nome: 'Mesa de Centro',        cod: '28018', dim: 'Ø80xA30CM',            acab: 'Hanover | Nero',                              cat: 'Mesa de Centro'    },
  { pag: 100, nome: 'Mesa de Centro',        cod: '28021', dim: 'L82,8xA45xP61,8CM',   acab: 'Hanover | Nero',                              cat: 'Mesa de Centro'    },
  { pag: 101, nome: 'Mesa Lateral',          cod: '27942', dim: 'L35xA60,5xP35CM',     acab: 'Hanover | Preto Melamina',                    cat: 'Mesa Lateral'      },
  { pag: 102, nome: 'Mesa Lateral',          cod: '27939', dim: 'L40xA60xP40CM',       acab: 'Hanover | Preto Melamina',                    cat: 'Mesa Lateral'      },
  { pag: 103, nome: 'Mesa de Centro',        cod: '27947', dim: 'Ø80xA30CM',            acab: 'Hanover | Preto Melamina',                    cat: 'Mesa de Centro'    },
  { pag: 104, nome: 'Mesa de Centro',        cod: '27856', dim: 'Ø70xA27CM',            acab: 'Hanover | Vermont',                           cat: 'Mesa de Centro'    },
  { pag: 105, nome: 'Mesa Lateral',          cod: '27861', dim: 'L45xA51,5xP45CM',     acab: 'Nero',                                        cat: 'Mesa Lateral'      },
  { pag: 106, nome: 'Mesa Volpi Alta',       cod: '24814', dim: 'L30xA56xP30CM',       acab: 'Branco Melamina | Preto Melamina',             cat: 'Mesa Lateral'      },
  { pag: 107, nome: 'Mesa Cube P',           cod: '24801', dim: 'L40xA32,5xP40CM',     acab: 'Preto Melamina | Vermont',                    cat: 'Mesa de Centro'    },
  { pag: 108, nome: 'Mesa Lateral',          cod: '27886', dim: 'L58xA67xP35CM',       acab: 'Preto Melamina | Vermont | Hanover',           cat: 'Mesa Lateral'      },
  { pag: 109, nome: 'Mesa Lateral',          cod: '27820', dim: 'L35xA64xP40CM',       acab: 'Preto e Branco Melamina | Vermont | Hanover',  cat: 'Mesa Lateral'      },
  { pag: 110, nome: 'Mesa Lateral',          cod: '27869', dim: 'L60xA65xP33CM',       acab: 'Vermont',                                     cat: 'Mesa Lateral'      },
  { pag: 111, nome: 'Mesa para Notebook',    cod: '27889', dim: 'L62xA23xP33CM',       acab: 'Vermont',                                     cat: 'Mesa Auxiliar'     },
  { pag: 112, nome: 'Prateleira Decorativa', cod: '27894', dim: 'L90xA34,2xP23CM',     acab: 'Vermont | Hanover | Nero',                    cat: 'Prateleira'        },
  { pag: 113, nome: 'Sapateira Banco',       cod: '27890', dim: 'L90xA45xP33,2CM',     acab: 'Vermont',                                     cat: 'Sapateira'         },
  { pag: 114, nome: 'Mesa de Cabeceira',     cod: '27855', dim: 'L45xA63,3xP37,3CM',   acab: 'Vermont | Branco Melamina',                   cat: 'Mesa de Cabeceira' },
  { pag: 115, nome: 'Aparador',              cod: '27864', dim: 'L136xA75xP33CM',      acab: 'Vermont',                                     cat: 'Aparador'          },
  { pag: 116, nome: 'Escrivaninha Dobrável', cod: '27893', dim: 'L90xA75xP45CM',       acab: 'Vermont',                                     cat: 'Escrivaninha'      },
  { pag: 117, nome: 'Carrinho Bar',          cod: '27853', dim: 'L102,5xA93xP43CM',    acab: 'Vermont',                                     cat: 'Carrinho Bar'      },
  { pag: 118, nome: 'Carrinho Bar',          cod: '27813', dim: 'L93,5xA82,5xP39CM',   acab: 'Preto Melamina | Vermont',                    cat: 'Carrinho Bar'      },
]

// Páginas com recorte em vez de capa
const semCapa = { 103: 'recorte pag 103.png', 111: 'recorte pag 111.png' }
// Páginas com capa E recorte
const comRecorte = { 116: 'recorte pag 116.png' }

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (9, ?, ?, ?, ?, ?, ?, ?)
`)

let inseridos = 0
let copiados  = 0

for (const p of produtos) {
  const pagStr = String(p.pag)
  const imagens = []

  if (semCapa[p.pag]) {
    // Só tem recorte
    const srcFile  = path.join(SRC, `pag ${pagStr}`, semCapa[p.pag])
    const destName = `pag${pagStr}-${semCapa[p.pag]}`
    const destFile = path.join(DEST, destName)
    fs.copyFileSync(srcFile, destFile)
    imagens.push(`/imagens/ARTESANO 2025/${destName}`)
    copiados++
  } else {
    // Tem capa
    const srcCapa  = path.join(SRC, `pag ${pagStr}`, 'capa.png')
    const destName = `pag${pagStr}-capa.png`
    const destFile = path.join(DEST, destName)
    fs.copyFileSync(srcCapa, destFile)
    imagens.push(`/imagens/ARTESANO 2025/${destName}`)
    copiados++

    // Tem recorte também?
    if (comRecorte[p.pag]) {
      const srcRec   = path.join(SRC, `pag ${pagStr}`, comRecorte[p.pag])
      const destRec  = `pag${pagStr}-${comRecorte[p.pag]}`
      fs.copyFileSync(srcRec, path.join(DEST, destRec))
      imagens.push(`/imagens/ARTESANO 2025/${destRec}`)
      copiados++
    }
  }

  stmt.run(p.cod, p.nome, p.cat, p.dim, p.acab, p.pag, JSON.stringify(imagens))
  console.log(`  ✓ pag ${p.pag} — ${p.nome} (${p.cod})`)
  inseridos++
}

console.log(`\nConcluído: ${inseridos} produtos inseridos, ${copiados} imagens copiadas.`)
