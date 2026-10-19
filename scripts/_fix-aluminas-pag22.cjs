const db = require('better-sqlite3')('database/catalogo.db');

// Atualiza Cayman
db.prepare(`UPDATE produtos SET texto_livre = 'Mesa', dimensoes = '97x110x38CM', imagens = NULL WHERE id = 4783`).run();
console.log('Cayman (ID 4783) atualizado.');

// Insere Idealle
const info = db.prepare(`
  INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao)
  VALUES (100, 'Idealle', 22, 'Mesa', '100x100x40CM', 'Alumínio e Fibra Sintética', 'Mesa de centro redonda com estrutura trançada.')
`).run();
console.log('Idealle inserido com ID:', info.lastInsertRowid);
