// Importa BONTÉ 2025 — lote 2 (págs 52–96) de bonte.json. Uso: node scripts/importar-bonte-lote2.cjs
// (bonte.json tem mais 25 produtos "lote 2" nas págs 97–129; ficam fora desta carga.)
const Database = require('better-sqlite3')
const fs = require('fs'), path = require('path')

const ROOT = path.join(__dirname, '..')
const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/BONTÉ 2025/imagens dos produtos'
const PASTA = 'BONTÉ 2025'
const DEST  = path.join(ROOT, 'imagens-src', 'imagens', PASTA)
const PAG_MIN = 52, PAG_MAX = 96
const CAT = { 'Mesas de Centro': 'Mesa de Centro', 'Mesas Laterais': 'Mesa Lateral', 'Mesas de Cabeceira e Camas': 'Mesa de Cabeceira' }
const stamp = new Date().toISOString().replace(/[:.]/g, '-')

const db = new Database(path.join(ROOT, 'database/catalogo.db'))
const cats = new Set(db.prepare('select distinct categoria c from produtos where categoria is not null').all().map(r => r.c))
const faltam = [...new Set(Object.values(CAT))].filter(c => !cats.has(c))
if (faltam.length) { console.log('CATEGORIAS INEXISTENTES:', faltam); process.exit(1) }

const j = JSON.parse(fs.readFileSync(path.join(SRC, 'bonte.json'), 'utf8'))
const lote = j.produtos.filter(p => p.lote === 2 && p.pagina >= PAG_MIN && p.pagina <= PAG_MAX)
const semMapa = lote.filter(p => !CAT[p.secao]).map(p => p.secao)
if (semMapa.length) { console.log('SEÇÕES SEM MAPEAMENTO:', [...new Set(semMapa)]); process.exit(1) }

// backups
fs.mkdirSync(path.join(ROOT, 'backups'), { recursive: true })
fs.copyFileSync(path.join(ROOT, 'data/static-data.json'), path.join(ROOT, `backups/static-data.${stamp}.json`))
db.pragma('wal_checkpoint(TRUNCATE)')
fs.copyFileSync(path.join(ROOT, 'database/catalogo.db'), path.join(ROOT, `backups/catalogo.${stamp}.db`))

const num = mm => { const v = mm / 10; return Number.isInteger(v) ? String(v) : String(v).replace('.', ',') }
function dimVar(v, misto) {
  const t = []
  if (v.diametro != null && misto) t.push('L' + num(v.diametro), 'A' + num(v.altura), 'P' + num(v.diametro))
  else if (v.diametro != null) t.push('Ø' + num(v.diametro), 'A' + num(v.altura))
  else {
    if (v.comprimento != null) t.push('L' + num(v.comprimento))
    if (v.altura != null) t.push('A' + num(v.altura))
    if (v.profundidade != null) t.push('P' + num(v.profundidade))
  }
  return `REF${v.ref}-${t.join('x')}CM`
}
const urlOf = arq => '/imagens/' + [PASTA, ...arq.split('/')].map(encodeURIComponent).join('/')

const rows = lote.map(p => {
  const red = p.variacoes.filter(v => v.diametro != null), ret = p.variacoes.filter(v => v.diametro == null)
  const misto = red.length > 0 && ret.length > 0
  const obs = []
  if (p.designer) obs.push(`Design: ${p.designer}`)
  const rot = p.variacoes.filter(v => v.rotulo || v.descricao).map(v => `REF${v.ref}: ${[v.rotulo, v.descricao].filter(Boolean).join(' - ')}`)
  if (rot.length) obs.push(rot.join(' | '))
  if (misto) obs.push(`Medidas redondas (REF${red.map(v => v.ref).join(', REF')}): largura e profundidade = diâmetro.`)
  const arqs = [p.imagens.capa.arquivo]
  if (p.imagens['galeria-01']) arqs.push(p.imagens['galeria-01'].arquivo)
  return { p, misto, arqs,
    row: { codigo: p.variacoes.map(v => v.ref).join(', '), nome: p.nome,
      dimensoes: p.variacoes.map(v => dimVar(v, misto)).join(' | '), pagina: p.pagina,
      texto_livre: obs.join('\n') || null, categoria: CAT[p.secao] } }
})

let copiadas = 0; const faltando = []
for (const r of rows) {
  r.imgs = []
  for (const arq of r.arqs) {
    const from = path.join(SRC, arq)
    if (!fs.existsSync(from)) { faltando.push(arq); continue }
    const to = path.join(DEST, arq)
    fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); copiadas++
    r.imgs.push(urlOf(arq))
  }
}

const cat = db.prepare('select id from catalogos where pasta=?').get(PASTA)
const del = db.prepare('delete from produtos where catalogo_id=? and pagina between ? and ?')
const ins = db.prepare(`insert into produtos (catalogo_id,codigo,nome,dimensoes,pagina,texto_livre,imagens,categoria)
  values (@catalogo_id,@codigo,@nome,@dimensoes,@pagina,@texto_livre,@imagens,@categoria)`)
db.transaction(() => {
  console.log('removidos (placeholders Bonté pág 52–96):', del.run(cat.id, PAG_MIN, PAG_MAX).changes)
  for (const r of rows) ins.run({ ...r.row, catalogo_id: cat.id, imagens: JSON.stringify(r.imgs) })
})()
const resumo = db.prepare('select categoria, count(*) n from produtos where catalogo_id=? and pagina between ? and ? group by 1').all(cat.id, PAG_MIN, PAG_MAX)
db.close()
console.log('inseridos:', rows.length, '| imagens copiadas:', copiadas, '| arquivos ausentes:', faltando)
console.log('sem foto:', rows.filter(r => !r.imgs.length).map(r => r.p.id))
console.log('por categoria:', resumo)
console.log('mistos:', rows.filter(r => r.misto).map(r => r.p.id))
