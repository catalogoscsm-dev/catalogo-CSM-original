// scripts/publicar-static-data.cjs — publica os dados PÚBLICOS dos produtos no site.
//
// Roda automaticamente antes do build (npm "prebuild"), inclusive no CI do GitHub Pages.
// Lê data/static-data.json (commitado) e grava public/static-data.json, que o Next
// exporta para a raiz do site. A planilha CSM (aba Produtos) lê esse arquivo.
//
// Segurança: só copia os campos da lista PERMITIDOS — os mesmos que a página do produto
// já mostra. Qualquer campo novo/interno que apareça em data/static-data.json fica de fora.
// Imagens: só caminhos com hash (/img/<12 hex>.webp); outros são descartados.
const fs   = require('fs')
const path = require('path')

const ORIGEM  = path.join(__dirname, '../data/static-data.json')
const DESTINO = path.join(__dirname, '../public/static-data.json')

const PERMITIDOS = ['id', 'nome', 'descricao', 'dimensoes', 'material', 'acabamento',
                    'cores', 'categoria', 'texto_livre', 'imagens']
const IMG_OK = /^\/img\/[0-9a-f]{12}\.webp$/

const { produtos } = JSON.parse(fs.readFileSync(ORIGEM, 'utf8'))
if (!Array.isArray(produtos)) throw new Error('data/static-data.json sem a lista "produtos"')

let imagensDescartadas = 0
const publicos = produtos
  .filter(p => Number.isInteger(p && p.id))
  .map(p => {
    const o = {}
    for (const k of PERMITIDOS) if (p[k] !== undefined && p[k] !== null && p[k] !== '') o[k] = p[k]
    const imgs = Array.isArray(p.imagens) ? p.imagens : []
    o.imagens = imgs.filter(u => typeof u === 'string' && IMG_OK.test(u))
    imagensDescartadas += imgs.length - o.imagens.length
    return o
  })

fs.writeFileSync(DESTINO, JSON.stringify({ versao: 1, produtos: publicos }))
console.log(`static-data público: ${publicos.length} produtos → public/static-data.json` +
            (imagensDescartadas ? ` (${imagensDescartadas} imagens fora do padrão descartadas)` : ''))
