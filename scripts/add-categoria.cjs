// Categoriza todos os produtos por keywords no nome + texto_livre
const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '../database/catalogo.db'))

const cols = db.prepare("PRAGMA table_info(produtos)").all().map(c => c.name)
if (!cols.includes('categoria')) {
  db.prepare("ALTER TABLE produtos ADD COLUMN categoria TEXT").run()
  console.log('Coluna categoria adicionada.')
}

// Remove espaços entre letras únicas maiúsculas (OCR espaçado: "P O LT RO N A" → "poltrona")
function normalizeOcr(s) {
  return s.replace(/\b([A-ZÁÉÍÓÚÂÊÎÔÛÃÕ])\s(?=[A-ZÁÉÍÓÚÂÊÎÔÛÃÕ])/g, '$1').toLowerCase()
}

// Ordem importa: mais específico primeiro
const CATEGORIAS = [
  // ── Iluminação ──────────────────────────────────────────────────────────
  { nome: 'Iluminação',       kw: ['luminaria', 'luminária', 'pendente', 'abajur', 'lustre', 'arandela', 'plafon', 'spot ', 'spots', 'trilho eletrif', 'trilho point', 'poste de', 'balizador'] },
  // ── Decoração ───────────────────────────────────────────────────────────
  { nome: 'Decoração',        kw: ['cachepot', 'cachepô', 'vaso ', 'vasos', 'bandeja', 'bandejas', 'biombo', 'cesto', 'cestos', 'bau', 'baú', 'escultura', 'objeto decor', 'fruteira', 'porta-retrato', 'porta retrato', 'porta vela', 'porta-vela', 'difusor', 'incenso'] },
  // ── Externos / área externa ─────────────────────────────────────────────
  { nome: 'Externo',          kw: ['tenda ', 'espreguicadeira', 'espreguiçadeira', 'balanc', 'balanço', 'rede de', 'guarda-sol', 'guarda sol', 'gazebo', 'ombrelone', 'piscina'] },
  // ── Tapetes ─────────────────────────────────────────────────────────────
  { nome: 'Tapetes',          kw: ['tapete', 'rug', 'carpet', 'kilim'] },
  // ── Espelhos ────────────────────────────────────────────────────────────
  { nome: 'Espelhos',         kw: ['espelho', 'mirror'] },
  // ── Recamiers / Daybeds ─────────────────────────────────────────────────
  { nome: 'Recamiers',        kw: ['recamier', 'récamier', 'chaise longue', 'chaise-longue', 'daybed', 'day bed', 'modulos chaise', 'módulos chaise', 'modulo chaise', 'módulo chaise', 'chaise '] },
  // ── Sofás ───────────────────────────────────────────────────────────────
  { nome: 'Sofás',            kw: ['sofa', 'sofá', 'sectional', 'chesterfield', 'loveseat', 'namoradeira', 'sopha', 'modular com', 'sistema modular'] },
  // ── Poltronas ───────────────────────────────────────────────────────────
  { nome: 'Poltronas',        kw: ['poltrona', 'armchair', 'bergere', 'bergère', 'lounge chair', 'easychair', 'accent chair'] },
  // ── Cadeiras ────────────────────────────────────────────────────────────
  { nome: 'Cadeiras',         kw: ['cadeira', ' chair', 'bistro', 'bistrô', 'assento: a'] },
  // ── Banquetas ───────────────────────────────────────────────────────────
  { nome: 'Banquetas',        kw: ['banqueta', 'ottoman', 'puff', 'pufe', 'pouf', 'banco '] },
  // ── Cabeceiras ──────────────────────────────────────────────────────────
  { nome: 'Cabeceiras',       kw: ['cabeceira', 'headboard'] },
  // ── Camas ───────────────────────────────────────────────────────────────
  { nome: 'Camas',            kw: ['cama ', 'camas', ' bed ', 'beliche', 'box '] },
  // ── Mesas ───────────────────────────────────────────────────────────────
  { nome: 'Mesas',            kw: ['mesa ', 'mesas', ' table', 'escrivaninha', 'bancada', 'pedestal'] },
  // ── Aparadores ──────────────────────────────────────────────────────────
  { nome: 'Aparadores',       kw: ['aparador', 'buffet', 'sideboard', 'comoda', 'cômoda', 'criado-mudo', 'criado mudo', 'criado-', 'rack de tv', 'rack tv'] },
  // ── Estantes / Racks ────────────────────────────────────────────────────
  { nome: 'Estantes',         kw: ['estante', 'prateleira', 'bookcase', 'cristaleira', 'rack '] },
  // ── Armários ────────────────────────────────────────────────────────────
  { nome: 'Armários',         kw: ['armario', 'armário', 'guarda-roupa', 'wardrobe', 'closet'] },
  // ── Acessórios ──────────────────────────────────────────────────────────
  { nome: 'Acessórios',       kw: ['carrinho bar', 'carrinho de bar', 'carrinhos de bar', 'bar cart', 'cabideiro', 'revisteiro', 'porta-objetos', 'nicho'] },
]

function detectar(nome, textoLivre) {
  // Normaliza OCR espaçado e junta nome + texto_livre
  const haystack = ` ${normalizeOcr(nome)} ${normalizeOcr(textoLivre ?? '')} `.toLowerCase()
  for (const cat of CATEGORIAS) {
    if (cat.kw.some(k => haystack.includes(k))) return cat.nome
  }
  return 'Outros'
}

const produtos = db.prepare("SELECT id, nome, texto_livre FROM produtos").all()
const update   = db.prepare("UPDATE produtos SET categoria = ? WHERE id = ?")

const contagem = {}
const updateAll = db.transaction(() => {
  for (const p of produtos) {
    const cat = detectar(p.nome, p.texto_livre)
    update.run(cat, p.id)
    contagem[cat] = (contagem[cat] ?? 0) + 1
  }
})
updateAll()

console.log('\nCategorias atribuídas:')
Object.entries(contagem).sort((a, b) => b[1] - a[1]).forEach(([cat, n]) => {
  console.log(`  ${cat.padEnd(14)} ${n}`)
})
console.log(`\nTotal: ${produtos.length} produtos`)
db.close()
