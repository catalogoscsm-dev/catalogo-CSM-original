const Database = require('better-sqlite3')
const path = require('path')
const db = new Database(path.join(__dirname, '../database/catalogo.db'), { readonly: true })
// Mostra nome + texto_livre de produtos em Outros que têm texto_livre
const rows = db.prepare(`
  SELECT nome, texto_livre
  FROM produtos
  WHERE categoria='Outros' AND texto_livre IS NOT NULL AND texto_livre != ''
  ORDER BY RANDOM() LIMIT 40
`).all()
rows.forEach(r => console.log(`[${r.nome}] → ${r.texto_livre?.substring(0,120)}`))
db.close()
