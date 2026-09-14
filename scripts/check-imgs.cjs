const db = require('better-sqlite3')('database/catalogo.db')
const imgs = db.prepare("SELECT nome, imagens FROM produtos WHERE imagens != '[]' LIMIT 5").all()
imgs.forEach(r => {
  const arr = JSON.parse(r.imagens)
  console.log(r.nome, '->', arr[0])
})
db.close()
