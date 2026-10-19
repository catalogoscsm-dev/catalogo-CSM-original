const db = require('better-sqlite3')('database/catalogo.db');

// Corrige produtos existentes: pagina + dados
const updates = [
  { id: 4784, nome: 'Vision',       pagina: 23, texto_livre: 'Mesa',        dimensoes: 'Ø100x40CM' },
  { id: 4785, nome: 'Lunar',        pagina: 24, texto_livre: 'Mesa',        dimensoes: '120x70x17CM' },
  { id: 4786, nome: 'Catteli',      pagina: 24, texto_livre: 'Mesa',        dimensoes: '120x60x35CM' },
  { id: 4787, nome: 'Orione',       pagina: 25, texto_livre: 'Mesa',        dimensoes: '100x60x35CM' },
  { id: 4788, nome: 'Veredas',      pagina: 26, texto_livre: 'Mesa',        dimensoes: 'Ø100x35CM' },
  { id: 4789, nome: 'Marbella',     pagina: 27, texto_livre: 'Mesa',        dimensoes: '90x75x35CM' },
  { id: 4790, nome: 'Luci',         pagina: 28, texto_livre: 'Mesa Lateral', dimensoes: '50x56x30CM' },
  { id: 4791, nome: 'Lua',          pagina: 25, texto_livre: 'Mesa',        dimensoes: '150x60x35CM' },
  { id: 4792, nome: 'Indianápolis', pagina: 26, texto_livre: 'Mesa',        dimensoes: 'Ø100x35CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome=@nome, pagina=@pagina, texto_livre=@texto_livre, dimensoes=@dimensoes, imagens=NULL WHERE id=@id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} → ${u.nome} pag ${u.pagina} ✓`); });

// Insere produtos faltantes (b e novos)
const inserts = [
  { pagina: 23, nome: 'Solar',      texto_livre: 'Mesa',         dimensoes: 'Ø110x35CM',  descricao: 'Mesa de centro circular.' },
  { pagina: 27, nome: 'Vitta',      texto_livre: 'Mesa',         dimensoes: '150x60x35CM', descricao: 'Mesa de centro retangular.' },
  { pagina: 28, nome: 'Veredas',    texto_livre: 'Mesa Lateral', dimensoes: 'Ø45x35CM',  descricao: 'Mesa lateral circular.' },
  { pagina: 29, nome: 'Palermo',    texto_livre: 'Mesa Lateral', dimensoes: 'Ø50x40CM',  descricao: 'Mesa lateral circular.' },
  { pagina: 29, nome: 'Selene',     texto_livre: 'Mesa Lateral', dimensoes: 'Ø60x40CM',  descricao: 'Mesa lateral circular.' },
  { pagina: 30, nome: 'Point',      texto_livre: 'Mesa Lateral', dimensoes: 'Ø50x50CM',  descricao: 'Mesa lateral circular.' },
  { pagina: 30, nome: 'Presser',    texto_livre: 'Mesa Lateral', dimensoes: 'Ø50x40CM',  descricao: 'Mesa lateral circular.' },
  { pagina: 31, nome: 'Sonic',      texto_livre: 'Mesa Lateral', dimensoes: '50x50x50CM', descricao: 'Mesa lateral quadrada.' },
  { pagina: 31, nome: 'Tronco',     texto_livre: 'Mesa Lateral', dimensoes: '49x45x40CM', descricao: 'Mesa lateral quadrada.' },
];

const ins = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100, @nome, @pagina, @texto_livre, @dimensoes, 'Alumínio', @descricao)`);
inserts.forEach(p => {
  const r = ins.run(p);
  console.log(`Inserido ${p.nome} pag ${p.pagina} → ID ${r.lastInsertRowid}`);
});

// Verificação final
console.log('\n--- Resultado pag 23-31 ---');
const rows = db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id = 100 AND pagina BETWEEN 23 AND 31 ORDER BY pagina, id').all();
rows.forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
