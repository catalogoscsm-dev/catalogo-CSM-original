'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'));
const cat = db.prepare("SELECT id FROM catalogos WHERE pasta = ?").get('ARTESANO 2025');
if (!cat) { console.error('Catálogo ARTESANO 2025 não encontrado.'); process.exit(1); }

const CATALOGO_ID = cat.id;
const MAT = 'Estrutura MDF com acabamento melamínico; base em metal; puxadores em metal dourado';
const ACB = 'Melamínico; Metal dourado';
const COR = 'Hanover, Nero';

const produtos = [
  { pagina: 40, codigo: '28071', nome: 'Balcão Buffet II',       dimensoes: '135x75x38CM',  texto_livre: 'Buffet',            descricao: 'Buffet com 2 portas e nichos abertos laterais, base em metal.' },
  { pagina: 41, codigo: '28075', nome: 'Balcão Buffet Grande',   dimensoes: '180x75x38CM',  texto_livre: 'Buffet',            descricao: 'Buffet de 4 portas em amplo formato, base em metal com acabamento dourado.' },
  { pagina: 42, codigo: '28069', nome: 'Bar',                    dimensoes: '90x140x38CM',  texto_livre: 'Bar',               descricao: 'Bar com 2 portas e prateleira inferior aberta, ideal para home bar.' },
  { pagina: 43, codigo: '28065', nome: 'Armário Bar',            dimensoes: '90x111x38CM',  texto_livre: 'Bar',               descricao: 'Armário bar compacto com 2 portas e base em metal.' },
  { pagina: 44, codigo: '28066', nome: 'Aparador II',            dimensoes: '100x81x38CM',  texto_livre: 'Aparador',          descricao: 'Aparador com 2 gavetas e prateleira inferior em base metálica.' },
  { pagina: 45, codigo: '28076', nome: 'Rack Grande',            dimensoes: '180x60x38CM',  texto_livre: 'Rack',              descricao: 'Rack para TV de 180cm com portas e nichos centrais.' },
  { pagina: 46, codigo: '28070', nome: 'Rack II',                dimensoes: '150x60x38CM',  texto_livre: 'Rack',              descricao: 'Rack para TV com porta central e nichos laterais abertos.' },
  { pagina: 47, codigo: '28067', nome: 'Escrivaninha II',        dimensoes: '125x80x50CM',  texto_livre: 'Escrivaninha',      descricao: 'Escrivaninha com 2 gavetas e base em metal dourado.' },
  { pagina: 48, codigo: '28068', nome: 'Cômoda II',              dimensoes: '90x82x43CM',   texto_livre: 'Cômoda',            descricao: 'Cômoda com 3 gavetas e base em metal, design contemporâneo.' },
  { pagina: 49, codigo: '28061', nome: 'Mesa de Cabeceira V',    dimensoes: '60x59x38CM',   texto_livre: 'Mesa de Cabeceira', descricao: 'Mesa de cabeceira com gaveta e prateleira inferior em base metálica.' },
  { pagina: 50, codigo: '28062', nome: 'Mesa de Cabeceira VI',   dimensoes: '60x59x38CM',   texto_livre: 'Mesa de Cabeceira', descricao: 'Mesa de cabeceira com 2 gavetas e base em metal.' },
];

const run = db.transaction(() => {
  for (const p of produtos) {
    // Remove entradas antigas ruins nesta página (sem o código correto)
    const oldEntries = db.prepare('SELECT id, nome, codigo FROM produtos WHERE catalogo_id = ? AND pagina = ? AND codigo != ?').all(CATALOGO_ID, p.pagina, p.codigo);
    for (const old of oldEntries) {
      db.prepare('DELETE FROM produtos WHERE id = ?').run(old.id);
      console.log(`  [pag ${String(p.pagina).padStart(2,'0')}] Removido entrada antiga: "${old.nome}" (ID ${old.id})`);
    }
    // Verifica se já existe com código correto
    const existing = db.prepare('SELECT id FROM produtos WHERE catalogo_id = ? AND pagina = ? AND codigo = ?').get(CATALOGO_ID, p.pagina, p.codigo);
    if (existing) {
      console.log(`  [pag ${String(p.pagina).padStart(2,'0')}] Já existe: ${p.nome} (ID ${existing.id}) — pulando.`);
      continue;
    }
    const info = db.prepare(`
      INSERT INTO produtos (catalogo_id, codigo, nome, descricao, material, dimensoes, acabamento, cores, pagina, texto_livre, imagens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')
    `).run(CATALOGO_ID, p.codigo, p.nome, p.descricao, MAT, p.dimensoes, ACB, COR, p.pagina, p.texto_livre);
    console.log(`  ✓ [pag ${String(p.pagina).padStart(2,'0')}] ${p.nome} inserido (ID ${info.lastInsertRowid})`);
  }
});

run();
db.close();
console.log('\nPronto!');
