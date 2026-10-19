const db = require('better-sqlite3')('database/catalogo.db');

const updates = [
  { id: 4846, nome: 'Duda',    pagina: 68, texto_livre: 'Banqueta',         dimensoes: '56x60x97CM' },
  { id: 4848, nome: 'Britto',  pagina: 69, texto_livre: 'Banqueta',         dimensoes: '41x46x66CM' },
  { id: 4851, nome: 'Panamá',  pagina: 70, texto_livre: 'Banqueta',         dimensoes: '58x53x103CM' },
  { id: 4853, nome: 'Ocean',   pagina: 71, texto_livre: 'Banqueta',         dimensoes: '46x53x100CM' },
  { id: 4855, nome: 'Plaza',   pagina: 72, texto_livre: 'Banqueta',         dimensoes: '46x52x100CM' },
  { id: 4857, nome: 'Maya',    pagina: 73, texto_livre: 'Banqueta',         dimensoes: 'Ø38x65CM' },
  { id: 4858, nome: 'Fox',     pagina: 76, texto_livre: 'Espreguiçadeira', dimensoes: '66x200x37CM' },
  // Vitta estava no pagina=77 mas o folder é pag 76b → corrige pagina
  { id: 4859, nome: 'Vitta',   pagina: 76, texto_livre: 'Espreguiçadeira', dimensoes: '80x197x37CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome=@nome, pagina=@pagina, texto_livre=@texto_livre, dimensoes=@dimensoes, imagens=NULL WHERE id=@id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} → ${u.nome} pag ${u.pagina} ✓`); });

// Insere segundos produtos para páginas com pasta XXb
const inserts = [
  { pagina: 68, nome: 'Martin', texto_livre: 'Banqueta', dimensoes: '57x57x96CM', descricao: 'Banqueta giratória em alumínio.' },
  { pagina: 70, nome: 'Dafne',  texto_livre: 'Banqueta', dimensoes: '45x55x95CM', descricao: 'Banqueta em alumínio.' },
  { pagina: 72, nome: 'Eros',   texto_livre: 'Banqueta', dimensoes: '50x54x100CM', descricao: 'Banqueta em alumínio.' },
];

const ins = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100, @nome, @pagina, @texto_livre, @dimensoes, 'Alumínio', @descricao)`);
inserts.forEach(p => { const r = ins.run(p); console.log(`Inserido ${p.nome} pag ${p.pagina} → ID ${r.lastInsertRowid}`); });

console.log('\n--- Resultado pag 68-76 ---');
db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 68 AND 76 ORDER BY pagina, id').all()
  .forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
