const db = require('better-sqlite3')('database/catalogo.db')
const prod = db.prepare("SELECT id, imagens FROM produtos WHERE nome = 'MESA AUXILIAR GRÉCIA' AND pagina = 74").get()
if (!prod) { console.error('não encontrado'); process.exit(1) }
let imgs = JSON.parse(prod.imagens || '[]')
const novaImg = '/imagens/ARMIL%20COMPLETO%202024/pag%2074-teste-wm.png'
if (!imgs.includes(novaImg)) imgs.push(novaImg)
db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(imgs), prod.id)
console.log('OK — imagens:', imgs)
db.close()
