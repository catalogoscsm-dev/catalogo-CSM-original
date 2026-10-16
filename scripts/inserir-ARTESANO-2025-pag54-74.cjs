'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'));
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = ?").get('ARTESANO 2025');
if (!cat) { console.error('Catálogo ARTESANO 2025 não encontrado.'); process.exit(1); }

const CATALOGO_ID = cat.id;

const MAT_MADEIRA = 'Estrutura MDF com acabamento melamínico; painéis em rattan; pés em madeira maciça';
const MAT_METAL   = 'Estrutura MDF com acabamento melamínico; painéis em rattan; pés em metal com acabamento dourado';
const MAT_CAMA    = 'Estrutura em madeira maciça; cabeceira com painel em rattan; ripas incluídas';
const MAT_CAB     = 'Estrutura em madeira maciça; painel em rattan';
const ACB_MADEIRA = 'Melamínico; Rattan; Madeira natural';
const ACB_METAL   = 'Melamínico; Rattan; Metal dourado';
const ACB_CAMA    = 'Madeira natural; Rattan';
const COR         = 'Hanover, Nero';

const produtos = [
  { pagina: 54, codigo: '27056', nome: 'Cama Queen',                             dimensoes: '172x110x208CM', material: MAT_CAMA,    acabamento: ACB_CAMA,    texto_livre: 'Cama',             descricao: 'Cama queen com cabeceira em rattan e estrutura em madeira maciça.' },
  { pagina: 54, codigo: '27055', nome: 'Cama Casal',                             dimensoes: '152x110x198CM', material: MAT_CAMA,    acabamento: ACB_CAMA,    texto_livre: 'Cama',             descricao: 'Cama casal com cabeceira em rattan e estrutura em madeira maciça.' },
  { pagina: 55, codigo: '27058', nome: 'Cama Solteiro',                          dimensoes: '102x110x198CM', material: MAT_CAMA,    acabamento: ACB_CAMA,    texto_livre: 'Cama',             descricao: 'Cama solteiro com cabeceira em rattan e estrutura em madeira maciça.' },
  { pagina: 56, codigo: '28025', nome: 'Roupeiro - Pés de Madeira',              dimensoes: '80x180x57CM',   material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Roupeiro',          descricao: 'Roupeiro de 2 portas com painéis em rattan e pés em madeira maciça.' },
  { pagina: 57, codigo: '27967', nome: 'Cabeceira Casal',                        dimensoes: '160x60x2CM',    material: MAT_CAB,     acabamento: ACB_CAMA,    texto_livre: 'Cabeceira',        descricao: 'Cabeceira casal com painel em rattan e moldura em madeira.' },
  { pagina: 58, codigo: '27966', nome: 'Cabeceira Solteiro',                     dimensoes: '90x60x2CM',     material: MAT_CAB,     acabamento: ACB_CAMA,    texto_livre: 'Cabeceira',        descricao: 'Cabeceira solteiro com painel em rattan e moldura em madeira.' },
  { pagina: 59, codigo: '28932', nome: 'Mesa de Cabeceira - Pés Metálicos',     dimensoes: '48x60x38CM',    material: MAT_METAL,   acabamento: ACB_METAL,   texto_livre: 'Mesa de Cabeceira', descricao: 'Mesa de cabeceira com gaveta em rattan e pés em metal dourado.' },
  { pagina: 60, codigo: '27932', nome: 'Mesa de Cabeceira - Pés de Madeira',    dimensoes: '48x60x38CM',    material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Mesa de Cabeceira', descricao: 'Mesa de cabeceira com gaveta em rattan e pés em madeira maciça.' },
  { pagina: 61, codigo: '27934', nome: 'Cômoda - Pés de Madeira',               dimensoes: '93x82x43CM',    material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Cômoda',           descricao: 'Cômoda com 3 gavetas em rattan e pés em madeira maciça.' },
  { pagina: 62, codigo: '27931', nome: 'Escrivaninha - Pés de Madeira',         dimensoes: '139x77x60CM',   material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Escrivaninha',      descricao: 'Escrivaninha com 2 gavetas em rattan e pés em madeira maciça.' },
  { pagina: 63, codigo: '27965', nome: 'Estante - Pés de Madeira',              dimensoes: '90x180x37CM',   material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Estante',          descricao: 'Estante aberta com prateleiras e painéis em rattan, pés em madeira maciça.' },
  { pagina: 64, codigo: '27968', nome: 'Sapateira Banco - Pés de Madeira',      dimensoes: '93x45x33CM',    material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Sapateira Banco',  descricao: 'Banco sapateira com assento estofado e compartimentos abertos, pés em madeira maciça.' },
  { pagina: 65, codigo: '28963', nome: 'Cristaleira - Pés Metálicos',           dimensoes: '83x150x38CM',   material: MAT_METAL,   acabamento: ACB_METAL,   texto_livre: 'Cristaleira',      descricao: 'Cristaleira com portas em vidro, gaveta em rattan e pés em metal dourado.' },
  { pagina: 66, codigo: '28964', nome: 'Carrinho Bar - Pés Metálicos',          dimensoes: '110x85x42CM',   material: MAT_METAL,   acabamento: ACB_METAL,   texto_livre: 'Carrinho Bar',     descricao: 'Carrinho bar com gaveta em rattan, porta-taças e rodas, base em metal dourado.' },
  { pagina: 67, codigo: '28929', nome: 'Bar / Armário - Pés Metálicos',         dimensoes: '93x110x38CM',   material: MAT_METAL,   acabamento: ACB_METAL,   texto_livre: 'Bar',              descricao: 'Armário bar com 2 portas em rattan e pés em metal dourado.' },
  { pagina: 68, codigo: '27929', nome: 'Bar / Armário - Pés de Madeira',        dimensoes: '93x110x38CM',   material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Bar',              descricao: 'Armário bar com 2 portas em rattan e pés em madeira maciça.' },
  { pagina: 69, codigo: '28969', nome: 'Balcão Buffet - Pés Metálicos',         dimensoes: '139x81x38CM',   material: MAT_METAL,   acabamento: ACB_METAL,   texto_livre: 'Buffet',           descricao: 'Buffet com portas e gavetas em rattan, pés em metal dourado.' },
  { pagina: 70, codigo: '28935', nome: 'Balcão Buffet Grande - Pés Metálicos',  dimensoes: '183x81x38CM',   material: MAT_METAL,   acabamento: ACB_METAL,   texto_livre: 'Buffet',           descricao: 'Buffet amplo com 4 portas e gavetas em rattan, pés em metal dourado.' },
  { pagina: 71, codigo: '27936', nome: 'Aparador - Pés de Madeira',             dimensoes: '103x81x38CM',   material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Aparador',         descricao: 'Aparador com 2 gavetas em rattan e prateleira inferior, pés em madeira maciça.' },
  { pagina: 72, codigo: '27930', nome: 'Rack - Pés de Madeira',                 dimensoes: '183x66x38CM',   material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Rack',             descricao: 'Rack para TV com 2 portas em rattan e nichos centrais, pés em madeira maciça.' },
  { pagina: 73, codigo: '28961', nome: 'Mesa de Centro - Pés Metálicos',        dimensoes: '93x38x45CM',    material: MAT_METAL,   acabamento: ACB_METAL,   texto_livre: 'Mesa de Centro',   descricao: 'Mesa de centro com tampo em MDF, prateleira em rattan e pés em metal dourado.' },
  { pagina: 74, codigo: '27962', nome: 'Mesa Lateral - Pés de Madeira',         dimensoes: '43x58x40CM',    material: MAT_MADEIRA, acabamento: ACB_MADEIRA, texto_livre: 'Mesa Lateral',     descricao: 'Mesa lateral com tampo em MDF e prateleira em rattan, pés em madeira maciça.' },
];

const run = db.transaction(() => {
  for (const p of produtos) {
    const existing = db.prepare('SELECT id FROM produtos WHERE catalogo_id = ? AND pagina = ? AND codigo = ?').get(CATALOGO_ID, p.pagina, p.codigo);
    if (existing) {
      console.log(`  [pag ${String(p.pagina).padStart(2,'0')}] Já existe: ${p.nome} (ID ${existing.id}) — pulando.`);
      continue;
    }
    const info = db.prepare(`
      INSERT INTO produtos (catalogo_id, codigo, nome, descricao, material, dimensoes, acabamento, cores, pagina, texto_livre, imagens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')
    `).run(CATALOGO_ID, p.codigo, p.nome, p.descricao, p.material, p.dimensoes, p.acabamento, COR, p.pagina, p.texto_livre);
    console.log(`  [pag ${String(p.pagina).padStart(2,'0')}] ${p.nome} inserido (ID ${info.lastInsertRowid})`);
  }
});

run();
db.close();
console.log('\nPronto!');
