const db = require('better-sqlite3')('database/catalogo.db')
const rows = db.prepare("SELECT pagina, nome, dimensoes, material, acabamento, texto_livre FROM produtos WHERE nome LIKE '%LIVE%' OR nome LIKE '%ORVALHO%' OR nome LIKE '%LAGUS%'").all()
console.log(JSON.stringify(rows, null, 2))
db.close()
