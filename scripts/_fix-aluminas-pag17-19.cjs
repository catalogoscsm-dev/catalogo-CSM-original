const db = require('better-sqlite3')('database/catalogo.db');

const updates = [
  { id: 4780, nome: 'Lunar',   texto_livre: 'Sofá', dimensoes: 'S/Braço-100x100x80CM | C/Braço-100x100x80CM' },
  { id: 4781, nome: 'Ayron',   texto_livre: 'Sofá', dimensoes: 'Módulo-200x90x80CM | Módulo Longo-300x90x80CM' },
  { id: 4782, nome: 'Inhotim', texto_livre: 'Sofá', dimensoes: 'S/Braço-200x82x85CM | C/Braço-110x82x85CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome = @nome, texto_livre = @texto_livre, dimensoes = @dimensoes, imagens = NULL WHERE id = @id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} (${u.nome}) atualizado.`); });
