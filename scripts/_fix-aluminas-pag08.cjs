const db = require('better-sqlite3')('database/catalogo.db');

db.prepare(`UPDATE produtos SET
  dimensoes   = 'Sofá-220x80x90CM | Poltrona-80x80x90CM',
  texto_livre = 'Sofá',
  imagens     = NULL
WHERE id = 4761`).run();

console.log('Antares (ID 4761) atualizado.');
