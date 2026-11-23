// Importa BONTÉ 2025 — lote 1 (pág 4–48) a partir de bonte.json. Uso: node scripts/importar-bonte-lote1.cjs
const Database = require('better-sqlite3')
const fs = require('fs'), path = require('path')

const ROOT = path.join(__dirname, '..')
const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/BONTÉ 2025/imagens dos produtos'
const PASTA = 'BONTÉ 2025'
const DEST  = path.join(ROOT, 'imagens-src', 'imagens', PASTA)
const stamp = new Date().toISOString().replace(/[:.]/g, '-')

// 1) backups
fs.mkdirSync(path.join(ROOT, 'backups'), { recursive: true })
fs.copyFileSync(path.join(ROOT, 'data/static-data.json'), path.join(ROOT, `backups/static-data.${stamp}.json`))
const dbPath = path.join(ROOT, 'database/catalogo.db')
const db = new Database(dbPath)
db.pragma('wal_checkpoint(TRUNCATE)')
fs.copyFileSync(dbPath, path.join(ROOT, `backups/catalogo.${stamp}.db`))

// 2) categorias existentes (match exato, sem inventar)
const cats = new Set(db.prepare('select distinct categoria c from produtos where categoria is not null').all().map(r => r.c))
const catFaltando = {}
const mapCat = s => { if (cats.has(s)) return s; catFaltando[s] = (catFaltando[s] || 0) + 1; return null }

// 3) conversão
const num = mm => { const v = mm / 10; return Number.isInteger(v) ? String(v) : String(v).replace('.', ',') }
// misto = produto com variações redondas E retangulares: a tabela do site só tem colunas Largura/Prof., então Ø vira L=P=Ø
function dimVar(v, misto) {
  const t = []
  if (v.diametro != null && misto) t.push('L' + num(v.diametro), 'A' + num(v.altura), 'P' + num(v.diametro))
  else if (v.diametro != null) t.push('Ø' + num(v.diametro))
  else {
    if (v.comprimento != null) t.push('L' + num(v.comprimento))
    else if (v.largura != null) t.push('L' + num(v.largura))
  }
  if (v.altura != null && !(v.diametro != null && misto)) t.push('A' + num(v.altura))
  if (v.diametro == null && v.comprimento != null && v.largura != null) t.push('P' + num(v.largura))
  else if (v.profundidade != null) t.push('P' + num(v.profundidade))
  return `REF${v.ref}-${t.join('x')}CM`
}
const j = JSON.parse(fs.readFileSync(path.join(SRC, 'bonte.json'), 'utf8'))
const lote = j.produtos.filter(p => p.lote === 1)

const rows = lote.map(p => {
  const obs = []
  if (p.designer) obs.push(`Design: ${p.designer}`)
  const rot = p.variacoes.filter(v => v.rotulo).map(v => `REF${v.ref}: ${v.rotulo}`)
  if (rot.length) obs.push(rot.join(' | '))
  const arq = p.imagens.capa.arquivo
  return {
    codigo: p.variacoes.map(v => v.ref).join(', '),
    nome: p.nome,
    dimensoes: p.variacoes.map(v => dimVar(v, p.variacoes.some(x => x.diametro != null) && p.variacoes.some(x => x.diametro == null))).join(' | '),
    pagina: p.pagina,
    texto_livre: obs.join('\n') || null,
    categoria: mapCat(p.secao),
    arquivo: arq,
    imagem: '/imagens/' + [PASTA, ...arq.split('/')].map(encodeURIComponent).join('/'),
  }
})

// 4) imagens (sem renomear, mantendo pasta "pag XX/")
let copiadas = 0, faltando = []
for (const r of rows) {
  const from = path.join(SRC, r.arquivo)
  if (!fs.existsSync(from)) { faltando.push(r.arquivo); r.imagem = null; continue }
  const to = path.join(DEST, r.arquivo)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.copyFileSync(from, to); copiadas++
}

// 5) banco: troca só os placeholders do próprio catálogo Bonté (id 15, pág 4–48)
const cat = db.prepare('select id from catalogos where pasta=?').get(PASTA)
if (!cat) throw new Error('catálogo Bonté não encontrado')
const del = db.prepare('delete from produtos where catalogo_id=? and pagina between 4 and 48')
const ins = db.prepare(`insert into produtos (catalogo_id,codigo,nome,dimensoes,pagina,texto_livre,imagens,categoria)
  values (@catalogo_id,@codigo,@nome,@dimensoes,@pagina,@texto_livre,@imagens,@categoria)`)
db.transaction(() => {
  const d = del.run(cat.id)
  console.log('removidos (placeholders Bonté pág 4–48):', d.changes)
  for (const r of rows) ins.run({ catalogo_id: cat.id, codigo: r.codigo, nome: r.nome, dimensoes: r.dimensoes,
    pagina: r.pagina, texto_livre: r.texto_livre, imagens: JSON.stringify(r.imagem ? [r.imagem] : []), categoria: r.categoria })
})()
db.close()
console.log('inseridos:', rows.length, '| imagens copiadas:', copiadas, '| sem imagem:', faltando)
console.log('categorias sem equivalente (ficaram null):', catFaltando)
console.log('exemplo:', rows[0].dimensoes, '|', rows[15].dimensoes)
