// Importa CARPPEM 2025.2026 — Lote 0 (Tempo, Origami, Più, Recife: mesas) de carppem.json, bloco "importar". Uso: node scripts/importar-carppem-lote0.cjs
// Cria o catálogo se não existir; produtos existentes (mesmo catálogo + nome) são atualizados, não duplicados.
const Database = require('better-sqlite3')
const fs = require('fs'), path = require('path')

const ROOT = path.join(__dirname, '..')
const SRC  = 'C:/Users/joao.miguel/Documents/PROJETOS CSM/catalogos/catalogos separados/Carppem 2025.2026/imagens dos produtos'
const j = JSON.parse(fs.readFileSync(path.join(SRC, 'carppem.json'), 'utf8'))
const CAT_NOME = 'Carppem 2025.2026', PASTA = 'Carppem 2025.2026' // catálogo já existe no banco (id 19)
const DEST = path.join(ROOT, 'imagens-src', 'imagens', PASTA)
const ORDEM = ['capa', 'galeria-01', 'galeria-02', 'galeria-03']
const stamp = new Date().toISOString().replace(/[:.]/g, '-')

const db = new Database(path.join(ROOT, 'database/catalogo.db'))
const cats = new Set(db.prepare('select distinct categoria c from produtos where categoria is not null').all().map(r => r.c))
const NOVAS = [] // nenhuma categoria nova
const faltam = [...new Set(j.produtos.map(p => p.importar.categoria))].filter(c => !cats.has(c) && !NOVAS.includes(c))
if (faltam.length) { console.log('CATEGORIAS INEXISTENTES:', faltam); process.exit(1) }
for (const p of j.produtos) if (!Array.isArray(p.importar.texto_livre) || p.importar.texto_livre.length !== 3) { console.log('texto_livre != 3 itens:', p.nome); process.exit(1) }

// backups
fs.mkdirSync(path.join(ROOT, 'backups'), { recursive: true })
fs.copyFileSync(path.join(ROOT, 'data/static-data.json'), path.join(ROOT, `backups/static-data.${stamp}.json`))
db.pragma('wal_checkpoint(TRUNCATE)')
fs.copyFileSync(path.join(ROOT, 'database/catalogo.db'), path.join(ROOT, `backups/catalogo.${stamp}.db`))

const urlOf = arq => '/imagens/' + [PASTA, ...arq.split('/')].map(encodeURIComponent).join('/')
const faltando = []
const rows = j.produtos.map(p => {
  const imgs = []
  for (const k of ORDEM.filter(k => p.imagens[k])) {
    const arq = `${p.pasta}/${p.imagens[k].arquivo}`
    const from = path.join(SRC, arq)
    if (!fs.existsSync(from)) { faltando.push(arq); continue }
    const to = path.join(DEST, arq)
    fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to)
    imgs.push(urlOf(arq))
  }
  const i = p.importar
  return { imgs, row: { nome: i.nome, categoria: i.categoria, descricao: i.descricao, material: i.material,
    acabamento: i.acabamento, dimensoes: i.dimensoes, texto_livre: i.texto_livre.join('\n'), pagina: p.paginas[0] } }
})

let cat = db.prepare('select id from catalogos where pasta=?').get(PASTA)
const res = []
db.transaction(() => {
  if (!cat) { cat = { id: db.prepare('insert into catalogos (nome,pasta,ano) values (?,?,?)').run(CAT_NOME, PASTA, 2026).lastInsertRowid }; console.log('catálogo criado id', cat.id) }
  const sel = db.prepare('select id from produtos where catalogo_id=? and nome=?')
  const ins = db.prepare(`insert into produtos (catalogo_id,nome,descricao,material,dimensoes,acabamento,pagina,texto_livre,imagens,categoria)
    values (@catalogo_id,@nome,@descricao,@material,@dimensoes,@acabamento,@pagina,@texto_livre,@imagens,@categoria)`)
  const upd = db.prepare(`update produtos set descricao=@descricao,material=@material,dimensoes=@dimensoes,acabamento=@acabamento,
    pagina=@pagina,texto_livre=@texto_livre,imagens=@imagens,categoria=@categoria where id=@id`)
  for (const r of rows) {
    const d = { ...r.row, catalogo_id: cat.id, imagens: JSON.stringify(r.imgs) }
    const ex = sel.get(cat.id, r.row.nome)
    if (ex) { upd.run({ ...d, id: ex.id }); res.push([ex.id, r.row.nome, 'atualizado', r.imgs.length]) }
    else { const id = ins.run(d).lastInsertRowid; res.push([id, r.row.nome, 'inserido', r.imgs.length]) }
  }
})()
db.close()
console.log(res, '| arquivos ausentes:', faltando, '| sem foto:', rows.filter(r => !r.imgs.length).length)
