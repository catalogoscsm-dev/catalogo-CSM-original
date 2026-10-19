const db = require('better-sqlite3')('database/catalogo.db');

const updates = [
  { id: 4763, nome: 'Lass',           texto_livre: 'Sofá', dimensoes: 'Sofá-220x86x87CM | Poltrona-86x86x87CM | Mesa-81x81x35CM' },
  { id: 4766, nome: 'Veredas Corda',  texto_livre: 'Sofá', dimensoes: 'Sofá-220x80x80CM | Poltrona-85x80x80CM' },
  { id: 4768, nome: 'Veredas Tricó',  texto_livre: 'Sofá', dimensoes: 'Sofá-220x80x80CM | Poltrona-85x80x80CM' },
  { id: 4770, nome: 'Erys',           texto_livre: 'Sofá', dimensoes: 'Sofá-250x88x84CM | Poltrona-110x88x84CM' },
  { id: 4772, nome: 'Armani',         texto_livre: 'Sofá', dimensoes: 'Sofá-240x110x70CM | Poltrona-90x100x70CM | Mesa-120x70x35CM' },
  { id: 4775, nome: 'Marbella',       texto_livre: 'Sofá', dimensoes: 'Sofá-220x89x83CM | Poltrona-90x89x83CM' },
  { id: 4777, nome: 'Vitta',          texto_livre: 'Sofá', dimensoes: 'Sofá-200x82x85CM | Poltrona-110x82x85CM' },
  { id: 4779, nome: 'Victus',         texto_livre: 'Sofá', dimensoes: 'S/Braço-240x90x78CM | C/Braço-320x90x78CM' },
];

const stmt = db.prepare('UPDATE produtos SET nome = @nome, texto_livre = @texto_livre, dimensoes = @dimensoes, imagens = NULL WHERE id = @id');
updates.forEach(u => { stmt.run(u); console.log(`ID ${u.id} (${u.nome}) atualizado.`); });
