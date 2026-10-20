const fs   = require('fs')
const path = require('path')
const db   = require('better-sqlite3')(path.join(__dirname, '../database/catalogo.db'))

const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/ARTESANO 2025/imagens dos produtos'
const DEST = path.join(__dirname, '../public/imagens/ARTESANO 2025')

// pag 156 e 167: pastas não existem — puladas
const produtos = [
  { pag: 146, nome: 'Plataforma Híbrida Simples',                  cod: '25629', dim: '120cm-L120xA74xP70CM|136cm-L136xA74xP70CM',                                        acab: '', cat: 'Mesa de Escritório', extras: ['recorte pag 146_1.png', 'recorte pag 146_2.png'] },
  { pag: 149, nome: 'Mesa Opus Dinâmica',                          cod: '25475', dim: '160cm-L160xA74xP70CM|180cm-L180xA74xP70CM',                                        acab: '', cat: 'Mesa de Escritório' },
  { pag: 150, nome: 'Mesa Reta - Pé Metal',                        cod: '25605', dim: '90cm-L90xA74xP60CM|120cm-L120xA74xP60CM|136cm-L136xA74xP60CM|160cm-L160xA74xP60CM', acab: '', cat: 'Mesa de Escritório' },
  { pag: 151, nome: 'Mesa Reta - Pé Painel',                       cod: '25601', dim: '90cm-L90xA74xP60CM|120cm-L120xA74xP60CM|136cm-L136xA74xP60CM|160cm-L160xA74xP60CM', acab: '', cat: 'Mesa de Escritório' },
  { pag: 152, nome: 'Armário Baixo',                               cod: '25420', dim: 'L120xA74xP45CM',                                                                    acab: '', cat: 'Armário'            },
  { pag: 153, nome: 'Plataforma Dupla - Pé Metal',                 cod: '25541', dim: '120cm-L120xA74xP120CM|136cm-L136xA74xP120CM',                                       acab: '', cat: 'Mesa de Escritório' },
  { pag: 154, nome: 'Plataforma Dupla de Cont. - Pé Painel',       cod: '25525', dim: '120cm-L120xA74xP120CM|136cm-L136xA74xP120CM',                                       acab: '', cat: 'Mesa de Escritório' },
  { pag: 155, nome: 'Armário Duplo Alto',                          cod: '25409', dim: 'L80xA160xP45CM',                                                                    acab: '', cat: 'Armário'            },
  { pag: 157, nome: 'Loocker - 8 Portas',                          cod: '25416', dim: 'L80xA160xP43,4CM',                                                                  acab: '', cat: 'Armário'            },
  { pag: 162, nome: 'Mesa de Reunião Retangular c/ Cx de Tomada',  cod: '25655', dim: 'L240xA74xP110CM',                                                                   acab: '', cat: 'Mesa de Reunião'    },
  { pag: 163, nome: 'Mesa de Reunião Modular de Cont.',            cod: '25390', dim: 'L92,5xA74xP110CM',                                                                  acab: '', cat: 'Mesa de Reunião'    },
  { pag: 165, nome: 'Mesa de Reunião Redonda - Pé Metal',          cod: '25725', dim: 'Ø110xA74CM',                                                                        acab: '', cat: 'Mesa de Reunião'    },
  { pag: 168, nome: 'Lateral Terminal',                            cod: '25712', dim: 'L36xA211,7xP1,5CM',                                                                 acab: '', cat: 'Acessório'          },
  { pag: 168, nome: 'Lateral de Continuação',                      cod: '25713', dim: 'L36xA211,7xP1,5CM',                                                                 acab: '', cat: 'Acessório'          },
]

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, categoria, dimensoes, acabamento, pagina, imagens)
  VALUES (9, ?, ?, ?, ?, ?, ?, ?)
`)

const capaCopiada = new Set()
let inseridos = 0

for (const p of produtos) {
  const pagStr   = String(p.pag)
  const capaName = `pag${pagStr}-capa.png`
  const imagens  = []

  // Copia capa só uma vez por página (pag 168 tem 2 produtos)
  if (!capaCopiada.has(p.pag)) {
    fs.copyFileSync(path.join(SRC, `pag ${pagStr}`, 'capa.png'), path.join(DEST, capaName))
    capaCopiada.add(p.pag)
  }
  imagens.push(`/imagens/ARTESANO 2025/${capaName}`)

  // Recortes extras (ex: pag 146)
  if (p.extras) {
    for (const extra of p.extras) {
      const destExtra = `pag${pagStr}-${extra}`
      fs.copyFileSync(path.join(SRC, `pag ${pagStr}`, extra), path.join(DEST, destExtra))
      imagens.push(`/imagens/ARTESANO 2025/${destExtra}`)
    }
  }

  stmt.run(p.cod, p.nome, p.cat, p.dim, p.acab, p.pag, JSON.stringify(imagens))
  console.log(`  ✓ pag ${pagStr} — ${p.nome} (${p.cod})`)
  inseridos++
}

console.log(`\nConcluído: ${inseridos} produtos inseridos.`)
