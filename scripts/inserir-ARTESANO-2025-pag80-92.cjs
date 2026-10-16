'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'));
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = ?").get('ARTESANO 2025');
if (!cat) { console.error('Catálogo ARTESANO 2025 não encontrado.'); process.exit(1); }

const CATALOGO_ID = cat.id;
const MAT = 'Estrutura em metal com acabamento lacado preto; tampos e painéis em MDF com acabamento melamínico; elementos em gradeado metálico';
const ACB = 'Metal preto lacado; Melamínico';
const COR = 'Hanover, Preto';

const produtos = [
  { pagina: 80, codigo: '27912', nome: 'Rack para TV - Metal',         dimensoes: '180x61x38CM',  texto_livre: 'Rack',          descricao: 'Rack para TV de até 70" com portas em gradeado metálico e estrutura em metal lacado.' },
  { pagina: 81, codigo: '27913', nome: 'Estante - Metal',              dimensoes: '90x181x38CM',  texto_livre: 'Estante',       descricao: 'Estante aberta com gaveta inferior e elementos em gradeado metálico, estrutura em metal lacado.' },
  { pagina: 82, codigo: '27914', nome: 'Estante Compacta - Metal',     dimensoes: '47x181x38CM',  texto_livre: 'Estante',       descricao: 'Estante compacta com gaveta inferior e elementos em gradeado metálico, estrutura em metal lacado.' },
  { pagina: 83, codigo: '27897', nome: 'Cristaleira - Metal',          dimensoes: '93x141x38CM',  texto_livre: 'Cristaleira',   descricao: 'Cristaleira com portas em gradeado metálico, gaveta inferior e estrutura em metal lacado.' },
  { pagina: 84, codigo: '27898', nome: 'Buffet Bar Dinâmico',          dimensoes: '135x76x38CM',  texto_livre: 'Bar',           descricao: 'Buffet bar com prateleiras laterais abertas, portas centrais e estrutura em metal lacado.' },
  { pagina: 85, codigo: '27899', nome: 'Buffet Bar',                   dimensoes: '100x76x38CM',  texto_livre: 'Bar',           descricao: 'Buffet bar com portas em gradeado metálico e prateleira superior, estrutura em metal lacado.' },
  { pagina: 86, codigo: '27901', nome: 'Balcão Buffet - Metal',        dimensoes: '188x80x36CM',  texto_livre: 'Buffet',        descricao: 'Balcão buffet amplo com portas deslizantes e nicho central, base em metal lacado.' },
  { pagina: 87, codigo: '27900', nome: 'Aparador com Nicho',           dimensoes: '160x74x36CM',  texto_livre: 'Aparador',      descricao: 'Aparador com nicho central aberto e estrutura em metal lacado.' },
  { pagina: 88, codigo: '27902', nome: 'Aparador Dinâmico',            dimensoes: '120x75x40CM',  texto_livre: 'Aparador',      descricao: 'Aparador dinâmico com tampo em MDF e prateleira em gradeado metálico, 120cm.' },
  { pagina: 89, codigo: '27903', nome: 'Aparador Dinâmico Grande',     dimensoes: '140x75x40CM',  texto_livre: 'Aparador',      descricao: 'Aparador dinâmico com tampo em MDF e prateleira em gradeado metálico, 140cm.' },
  { pagina: 90, codigo: '27904', nome: 'Mesa de Centro - Metal',       dimensoes: '80x35x50CM',   texto_livre: 'Mesa de Centro', descricao: 'Mesa de centro com tampo em MDF e estrutura em metal lacado, 80cm.' },
  { pagina: 91, codigo: '27905', nome: 'Mesa de Centro Grande - Metal',dimensoes: '100x35x60CM',  texto_livre: 'Mesa de Centro', descricao: 'Mesa de centro com tampo em MDF e estrutura em metal lacado, 100cm.' },
  { pagina: 92, codigo: '27915', nome: 'Mesa Lateral - Metal',         dimensoes: '40x59x40CM',   texto_livre: 'Mesa Lateral',  descricao: 'Mesa lateral com tampo em MDF e prateleira em gradeado metálico, base em metal lacado.' },
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
    `).run(CATALOGO_ID, p.codigo, p.nome, p.descricao, MAT, p.dimensoes, ACB, COR, p.pagina, p.texto_livre);
    console.log(`  [pag ${String(p.pagina).padStart(2,'0')}] ${p.nome} inserido (ID ${info.lastInsertRowid})`);
  }
});

run();
db.close();
console.log('\nPronto!');
