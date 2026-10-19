const db = require('better-sqlite3')('database/catalogo.db');

const upd = db.prepare('UPDATE produtos SET nome=@nome, texto_livre=@texto_livre, dimensoes=@dimensoes, imagens=NULL WHERE id=@id');
const ins = db.prepare(`INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, dimensoes, material, descricao) VALUES (100, @nome, @pagina, @texto_livre, @dimensoes, 'Alumínio', @descricao)`);

// pag 82: split "Gaivota e Nilo"
upd.run({ id: 4866, nome: 'Gaivota', texto_livre: 'Espreguiçadeira', dimensoes: '63x198x38CM' });
ins.run({ nome: 'Nilo', pagina: 82, texto_livre: 'Espreguiçadeira', dimensoes: '80x191x38CM', descricao: 'Espreguiçadeira em alumínio.' });
console.log('pag 82 ✓ Gaivota + Nilo');

// pag 83: Afrodite chaise
upd.run({ id: 4868, nome: 'Afrodite', texto_livre: 'Chaise', dimensoes: '140x180x35CM' });
console.log('pag 83 ✓ Afrodite');

// pag 86: Vitta balanço
upd.run({ id: 4869, nome: 'Vitta', texto_livre: 'Balanço', dimensoes: '150x160x220CM' });
console.log('pag 86 ✓ Vitta');

// pag 87: Gota cadeira suspensa
upd.run({ id: 4870, nome: 'Gota', texto_livre: 'Cadeira Suspensa', dimensoes: '120x90x160CM' });
console.log('pag 87 ✓ Gota');

// pag 88: Mayore cadeira suspensa
upd.run({ id: 4871, nome: 'Mayore', texto_livre: 'Cadeira Suspensa', dimensoes: '100x109x170CM' });
console.log('pag 88 ✓ Mayore');

// pag 89: Ouro Preto cadeira suspensa
upd.run({ id: 4872, nome: 'Ouro Preto', texto_livre: 'Cadeira Suspensa', dimensoes: '150x145x155CM' });
console.log('pag 89 ✓ Ouro Preto');

// pag 90: Fiorella cadeira suspensa
upd.run({ id: 4873, nome: 'Fiorella', texto_livre: 'Cadeira Suspensa', dimensoes: '150x130x130CM' });
console.log('pag 90 ✓ Fiorella');

// pag 91: Derby cadeira suspensa
upd.run({ id: 4874, nome: 'Derby', texto_livre: 'Cadeira Suspensa', dimensoes: '117x95x152CM' });
console.log('pag 91 ✓ Derby');

// pag 92: Martin cadeira suspensa circular
upd.run({ id: 4875, nome: 'Martin', texto_livre: 'Cadeira Suspensa', dimensoes: 'Ø68x37CM' });
console.log('pag 92 ✓ Martin');

// pag 93: York cadeira suspensa (sem ficha, dimensoes ficam inalteradas)
db.prepare('UPDATE produtos SET texto_livre=?, imagens=NULL WHERE id=?').run('Cadeira Suspensa', 4876);
console.log('pag 93 ✓ York (texto_livre)');

// pag 96: split "Ocean e Square" (Ocean pag 96, Square pag 96b)
upd.run({ id: 4877, nome: 'Ocean', texto_livre: 'Daybed', dimensoes: 'Ø170x100CM' });
ins.run({ nome: 'Square', pagina: 96, texto_livre: 'Daybed', dimensoes: 'Ø180x80CM', descricao: 'Daybed circular em alumínio.' });
console.log('pag 96 ✓ Ocean + Square');

// pag 97: Drumond daybed + mesa
upd.run({ id: 4878, nome: 'Drumond', texto_livre: 'Daybed', dimensoes: 'Concha-Ø160x76CM | Mesa-Ø53x58CM' });
console.log('pag 97 ✓ Drumond');

// pag 98: split "Vitta e Erys"
upd.run({ id: 4880, nome: 'Vitta', texto_livre: 'Daybed', dimensoes: 'Ø150x80CM' });
ins.run({ nome: 'Erys', pagina: 98, texto_livre: 'Daybed', dimensoes: 'Ø180x152CM', descricao: 'Daybed circular em alumínio.' });
console.log('pag 98 ✓ Vitta + Erys');

// pag 99: split "Marbella e Itapuã"
upd.run({ id: 4881, nome: 'Marbella', texto_livre: 'Aparador', dimensoes: '45x140x100CM' });
ins.run({ nome: 'Itapuã', pagina: 99, texto_livre: 'Rack', dimensoes: '250x40x80CM', descricao: 'Rack de madeira e metal.' });
console.log('pag 99 ✓ Marbella + Itapuã');

// pag 100: split "Sky e Mobile"
upd.run({ id: 4882, nome: 'Sky', texto_livre: 'Mesa', dimensoes: '60x220x75CM' });
ins.run({ nome: 'Mobile', pagina: 100, texto_livre: 'Aparador', dimensoes: '50x140x70CM', descricao: 'Aparador com gavetas em madeira e metal.' });
console.log('pag 100 ✓ Sky + Mobile');

// pag 101: Victus gazebo
upd.run({ id: 4883, nome: 'Victus', texto_livre: 'Gazebo', dimensoes: '200x200x200CM' });
console.log('pag 101 ✓ Victus');

// pag 102: Monte Carlo gazebo
upd.run({ id: 4884, nome: 'Monte Carlo', texto_livre: 'Gazebo', dimensoes: '200x200x200CM' });
console.log('pag 102 ✓ Monte Carlo');

// pag 103: Barcelos gazebo
upd.run({ id: 4885, nome: 'Barcelos', texto_livre: 'Gazebo', dimensoes: '200x200x200CM' });
console.log('pag 103 ✓ Barcelos');

// pag 106: split "Tivoli e Bruce"
upd.run({ id: 4886, nome: 'Tivoli', texto_livre: 'Carrinho Bar', dimensoes: '57x90x73CM' });
ins.run({ nome: 'Bruce', pagina: 106, texto_livre: 'Carrinho Bar', dimensoes: '90x50x76CM', descricao: 'Carrinho bar em madeira e metal.' });
console.log('pag 106 ✓ Tivoli + Bruce');

// pag 107: Angra carrinho bar
upd.run({ id: 4887, nome: 'Angra', texto_livre: 'Carrinho Bar', dimensoes: '120x65x80CM' });
console.log('pag 107 ✓ Angra');

// pag 108: split "Corbelle e Gardênia"
upd.run({ id: 4888, nome: 'Corbelle', texto_livre: 'Puff', dimensoes: 'Ø38x40CM' });
ins.run({ nome: 'Gardênia', pagina: 108, texto_livre: 'Puff', dimensoes: 'Ø42x47CM', descricao: 'Puff em alumínio.' });
console.log('pag 108 ✓ Corbelle + Gardênia');

// pag 109: split "Drumond e Square"
upd.run({ id: 4890, nome: 'Drumond', texto_livre: 'Puff', dimensoes: 'Ø60x50CM' });
ins.run({ nome: 'Square', pagina: 109, texto_livre: 'Puff', dimensoes: '42x42x40CM', descricao: 'Puff quadrado em alumínio.' });
console.log('pag 109 ✓ Drumond + Square');

// pag 110: split "Lunar e Porto"
upd.run({ id: 4892, nome: 'Lunar', texto_livre: 'Banco', dimensoes: '180x45x45CM' });
ins.run({ nome: 'Porto', pagina: 110, texto_livre: 'Banco', dimensoes: '120x67x80CM', descricao: 'Banco com estrutura em alumínio.' });
console.log('pag 110 ✓ Lunar + Porto');

// pag 111: Lass namoradeira
upd.run({ id: 4894, nome: 'Lass', texto_livre: 'Namoradeira', dimensoes: '130x60x80CM' });
console.log('pag 111 ✓ Lass');

// pag 112: split "Vitta e Panamá" (camas pet)
upd.run({ id: 4895, nome: 'Vitta', texto_livre: 'Cama Pet', dimensoes: 'Ø65x40CM' });
ins.run({ nome: 'Panamá', pagina: 112, texto_livre: 'Cama Pet', dimensoes: 'Ø65x45CM', descricao: 'Cama pet em alumínio.' });
console.log('pag 112 ✓ Vitta + Panamá');

// pag 113: Cesto — sem imagens, apenas corrige tipo
db.prepare('UPDATE produtos SET texto_livre=? WHERE id=?').run('Cesto', 4896);
console.log('pag 113 ✓ Cesto (tipo)');

// pag 114: Cachepô corda náutica
upd.run({ id: 4897, nome: 'Cachepô', texto_livre: 'Cachepô', dimensoes: 'Ø50x103CM' });
console.log('pag 114 ✓ Cachepô');

// pag 115: split Copacabana chão + teto
upd.run({ id: 4898, nome: 'Copacabana', texto_livre: 'Luminária', dimensoes: 'Ø50x170CM' });
ins.run({ nome: 'Copacabana', pagina: 115, texto_livre: 'Luminária', dimensoes: 'Ø80x50CM | Ø70x50CM | Ø60x45CM', descricao: 'Luminária de teto em alumínio.' });
console.log('pag 115 ✓ Copacabana chão + teto');

// pag 118: split Central com manivela + sem manivela
upd.run({ id: 4899, nome: 'Central', texto_livre: 'Guarda-sol', dimensoes: 'Ø250CM | Ø270CM | Ø300CM' });
ins.run({ nome: 'Central', pagina: 118, texto_livre: 'Guarda-sol', dimensoes: 'Ø250CM | Ø270CM | Ø300CM', descricao: 'Guarda-sol central sem manivela.' });
console.log('pag 118 ✓ Central com manivela + sem manivela');

// pag 119: split Lateral Redondo + Quadrado
upd.run({ id: 4900, nome: 'Lateral', texto_livre: 'Guarda-sol', dimensoes: 'Ø330CM' });
ins.run({ nome: 'Lateral', pagina: 119, texto_livre: 'Guarda-sol', dimensoes: '300x300CM', descricao: 'Guarda-sol lateral quadrado.' });
console.log('pag 119 ✓ Lateral Redondo + Quadrado');

console.log('\n--- Resultado pag 82-119 ---');
db.prepare('SELECT id, nome, pagina FROM produtos WHERE catalogo_id=100 AND pagina BETWEEN 82 AND 119 ORDER BY pagina, id').all()
  .forEach(r => console.log(`pag ${r.pagina} | ID ${r.id} | ${r.nome}`));
