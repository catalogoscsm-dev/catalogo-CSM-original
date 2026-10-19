const db = require('better-sqlite3')('database/catalogo.db');

// Atualiza produtos existentes
const updates = [
  { id: 4814, nome: 'Amélia',  pagina: 46, texto_livre: 'Poltrona', dimensoes: '57x59x84CM' },
  { id: 4820, nome: 'Belt',    pagina: 51, texto_livre: 'Poltrona', dimensoes: '58x60x74CM' },
  // pag 52: split "Ocean e Queen"
  { id: 4821, nome: 'Ocean',   pagina: 52, texto_livre: 'Poltrona', dimensoes: '56x65x86CM' },
  // pag 53: split "Luna e Giorgio"
  { id: 4823, nome: 'Luna',    pagina: 53, texto_livre: 'Poltrona', dimensoes: '53x62x86CM' },
  // pag 54: split "Cayman e Villas" (Cayman aqui é poltrona, diferente das mesas)
  { id: 4825, nome: 'Cayman',  pagina: 54, texto_livre: 'Poltrona', dimensoes: '65x60x80CM' },
  // pag 55: Lapa (poltrona, diferente da Lapa mesa de jantar pag 35b)
  { id: 4827, nome: 'Lapa',    pagina: 55, texto_livre: 'Poltrona', dimensoes: '64x61x80CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome=@nome, pagina=@pagina, texto_livre=@texto_livre, dimensoes=@dimensoes, imagens=NULL WHERE id=@id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} → ${u.nome} pag ${u.pagina} ✓`); });

// Insere segundos produtos (b)
const inserts = [
  // pag 46b: Amélia colorway azul (variante)
  { pagina: 46, nome: 'Amélia',   texto_livre: 'Poltrona', dimensoes: '57x59x84CM', descricao: 'Poltrona com estrutura em alumínio.' },
  // pag 51b: Eros
  { pagina: 51, nome: 'Eros',     texto_livre: 'Poltrona', dimensoes: '55x59x74CM', descricao: 'Poltrona com estrutura em alumínio.' },
  // pag 52b: Queen
  { pagina: 52, nome: 'Queen',    texto_livre: 'Poltrona', dimensoes: '71x68x77CM', descricao: 'Poltrona com estrutura em alumínio.' },
  // pag 53b: Giorgio
  { pagina: 53, nome: 'Giorgio',  texto_livre: 'Poltrona', dimensoes: '64x61x80CM', descricao: 'Poltrona com estrutura em alumínio.' },
  // pag 54b: Villas
  { pagina: 54, nome: 'Villas',   texto_livre: 'Poltrona', dimensoes: '55x58x80CM', descricao: 'Poltrona com estrutura em alumínio.' },
  // pag 55b: Lapa colorway diferente
  { pagina: 55, nome: 'Lapa',     texto_livre: 'Poltrona', dimensoes: '64x61x80CM', descricao: 'Poltrona com estrutura em alumínio.' },
];

const ins = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100, @nome, @pagina, @texto_livre, @dimensoes, 'Alumínio', @descricao)`);
inserts.forEach(p => {
  const r = ins.run(p);
  console.log(`Inserido ${p.nome} pag ${p.pagina} → ID ${r.lastInsertRowid}`);
});

// Verificação
console.log('\n--- Resultado pag 46-55 ---');
const rows = db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 46 AND 55 ORDER BY pagina, id').all();
rows.forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
