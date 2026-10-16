'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'));
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = ?").get('ARTESANO 2025');
if (!cat) { console.error('Catálogo ARTESANO 2025 não encontrado.'); process.exit(1); }

const CATALOGO_ID = cat.id;
const MAT = 'Estrutura MDF com acabamento melamínico; pés em madeira maciça torneados; puxadores zamak com pintura epóxi dourada; costas 15mm';
const MAT_V = MAT + '; portas em vidro canelado com dobradiças amortecidas';
const ACB = 'Melamínico; Zamak dourado';
const COR = 'Hanover, Nero';

const produtos = [
  { pagina:  6, codigo: '28037', nome: 'Penteadeira',             dimensoes: '95x80x50CM',  material: MAT,   texto_livre: 'Penteadeira',       descricao: 'Design escandinavo com gaveta telescópica e pés torneados em madeira maciça.' },
  { pagina:  8, codigo: '28035', nome: 'Cômoda Dupla',            dimensoes: '185x83x43CM', material: MAT,   texto_livre: 'Cômoda',            descricao: 'Cômoda dupla de ampla capacidade com 6 gavetas e estrutura em MDF.' },
  { pagina: 10, codigo: '28036', nome: 'Cômoda',                  dimensoes: '95x83x43CM',  material: MAT,   texto_livre: 'Cômoda',            descricao: 'Cômoda com 3 gavetas telescópicas e acabamento melamínico de alta durabilidade.' },
  { pagina: 12, codigo: '28038', nome: 'Mesa de Cabeceira I',     dimensoes: '63x60x38CM',  material: MAT,   texto_livre: 'Mesa de Cabeceira', descricao: 'Mesa de cabeceira com nicho e gaveta telescópica, pés torneados em madeira.' },
  { pagina: 14, codigo: '29039', nome: 'Mesa de Cabeceira II',    dimensoes: '65x60x38CM',  material: MAT,   texto_livre: 'Mesa de Cabeceira', descricao: 'Mesa de cabeceira com 2 gavetas e pés em madeira maciça torneada.' },
  { pagina: 16, codigo: '28040', nome: 'Mesa de Cabeceira III',   dimensoes: '50x60x38CM',  material: MAT,   texto_livre: 'Mesa de Cabeceira', descricao: 'Mesa de cabeceira compacta com gaveta e nicho aberto.' },
  { pagina: 18, codigo: '28041', nome: 'Mesa de Cabeceira IV',    dimensoes: '50x60x38CM',  material: MAT,   texto_livre: 'Mesa de Cabeceira', descricao: 'Mesa de cabeceira com 2 gavetas e acabamento sofisticado.' },
  { pagina: 20, codigo: '28029', nome: 'Escrivaninha',            dimensoes: '125x80x50CM', material: MAT,   texto_livre: 'Escrivaninha',      descricao: 'Escrivaninha com 2 gavetas e prateleira inferior, ideal para home office.' },
  { pagina: 22, codigo: '28030', nome: 'Rack',                   dimensoes: '141x70x38CM', material: MAT,   texto_livre: 'Rack',              descricao: 'Rack para TV com portas, nicho central e gaveta em design contemporâneo.' },
  { pagina: 24, codigo: '28059', nome: 'Aparador',               dimensoes: '125x81x38CM', material: MAT,   texto_livre: 'Aparador',          descricao: 'Aparador com 2 gavetas e pés torneados em madeira maciça.' },
  { pagina: 26, codigo: '28058', nome: 'Aparador Compacto',      dimensoes: '90x81x38CM',  material: MAT,   texto_livre: 'Aparador',          descricao: 'Aparador compacto com gaveta e estrutura em MDF de alta qualidade.' },
  { pagina: 28, codigo: '28032', nome: 'Balcão Buffet',          dimensoes: '185x75x38CM', material: MAT_V, texto_livre: 'Buffet',            descricao: 'Buffet amplo com portas em vidro canelado, gavetas e pés torneados.' },
  { pagina: 30, codigo: '28031', nome: 'Balcão Buffet Compacto', dimensoes: '141x75x38CM', material: MAT_V, texto_livre: 'Buffet',            descricao: 'Buffet compacto com portas em vidro canelado e puxadores dourados.' },
  { pagina: 32, codigo: '28033', nome: 'Buffet Aparador',        dimensoes: '85x80x38CM',  material: MAT_V, texto_livre: 'Buffet',            descricao: 'Buffet aparador com portas em vidro canelado e pés elegantes em madeira.' },
  { pagina: 34, codigo: '28060', nome: 'Cristaleira',            dimensoes: '65x180x38CM', material: MAT_V, texto_livre: 'Cristaleira',       descricao: 'Cristaleira alta com portas em vidro canelado e prateleiras internas.' },
  { pagina: 36, codigo: '28034', nome: 'Cristaleira Compacta',   dimensoes: '65x150x38CM', material: MAT_V, texto_livre: 'Cristaleira',       descricao: 'Cristaleira com portas em vidro canelado e gaveta inferior de apoio.' },
];

const check  = db.prepare('SELECT id FROM produtos WHERE catalogo_id = ? AND pagina = ? AND codigo = ?');
const insert = db.prepare(`
  INSERT INTO produtos (catalogo_id, codigo, nome, descricao, material, dimensoes, acabamento, cores, pagina, texto_livre, imagens)
  VALUES (@catalogo_id, @codigo, @nome, @descricao, @material, @dimensoes, @acabamento, @cores, @pagina, @texto_livre, '[]')
`);

const run = db.transaction(() => {
  for (const p of produtos) {
    const existing = check.get(CATALOGO_ID, p.pagina, p.codigo);
    if (existing) {
      console.log(`  [pag ${String(p.pagina).padStart(2,'0')}] Já existe: ${p.nome} (ID ${existing.id}) — pulando.`);
      continue;
    }
    const info = insert.run({ ...p, catalogo_id: CATALOGO_ID, acabamento: ACB, cores: COR });
    console.log(`  ✓ [pag ${String(p.pagina).padStart(2,'0')}] ${p.nome} inserido (ID ${info.lastInsertRowid})`);
  }
});

run();
db.close();
console.log('\nPronto!');
