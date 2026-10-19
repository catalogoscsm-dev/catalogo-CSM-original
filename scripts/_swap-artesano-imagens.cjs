'use strict';
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'));

const produtos = db.prepare('SELECT id, nome, imagens FROM produtos WHERE id BETWEEN 5560 AND 5575').all();
const upd = db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?');

const run = db.transaction(() => {
  for (const p of produtos) {
    const urls = JSON.parse(p.imagens);
    if (urls.length < 2) { console.log(`  [${p.nome}] menos de 2 imagens, pulando.`); continue; }
    const swapped = [...urls].reverse();
    upd.run(JSON.stringify(swapped), p.id);
    console.log(`  ✓ ${p.nome}: ${swapped[0].split('/').pop()} → primeiro`);
  }
});

run();
db.close();
console.log('\nPronto!');
