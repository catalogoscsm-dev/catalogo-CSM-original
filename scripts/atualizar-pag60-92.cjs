const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '../database/catalogo.db'))

const updates = [
  {
    id: 5502,
    nome: 'Napoli',
    descricao: 'Sofá compacto com encosto D23 e assento D26, pés em madeira.',
    material: 'Enc.: Espuma D23 soft c/ fibra poliéster, cinta elástica | Ass.: Espuma D26 soft c/ fibra poliéster, cinta elástica | Est.: Madeira eucalipto e MDF | Braços: Espuma D26 dura | Pés: Madeira',
    dimensoes: '88x085CM | 155x88CM | 205x88CM',
    texto_livre: 'Sofá',
    pagina: 60,
  },
  {
    id: 5503,
    nome: 'Oxford',
    descricao: 'Sofá com encosto de almofadas de fibra siliconada e assento em D30.',
    material: 'Enc.: Almofadas de fibra siliconada, cinta elástica | Ass.: Espuma D30 soft c/ fibra poliéster, cinta elástica | Est.: Madeira eucalipto e MDF | Braços: Fibra siliconada | Pés: Madeira',
    dimensoes: '90x095CM | 180x90CM | 230x90CM',
    texto_livre: 'Sofá',
    pagina: 62,
  },
  {
    id: 5504,
    nome: 'PAUSE',
    descricao: 'Sofá retrátil com assento em tecnoforme e mola zig zag.',
    material: 'Enc.: Espuma D23, cinta elástica e fibra siliconada | Ass.: Espuma D29, tecnoforme e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D25 soft, tecnoforme | Pés: Madeira',
    dimensoes: '106x104CM | 83x104CM | 156x103CM',
    texto_livre: 'Sofá Retrátil',
    pagina: 64,
  },
  {
    id: 5505,
    nome: 'Poli',
    descricao: 'Poltrona giratória com encosto e braços em espuma D23 soft e base giratória.',
    material: 'Enc.: Espuma D23 soft c/ fibra siliconada, cinta elástica | Ass.: Espuma D30 soft c/ fibra siliconada, cinta elástica | Est.: Madeira eucalipto e MDF | Braços: Espuma D23 soft c/ fibra siliconada | Pés: Base giratória',
    dimensoes: '99x085CM',
    texto_livre: 'Poltrona Giratória',
    pagina: 66,
  },
  {
    id: 5506,
    nome: 'POSITANO',
    descricao: 'Sofá modular com assento em plumante e mola zig zag, pés em madeira.',
    material: 'Enc.: Espuma D23, plumante e fibra siliconada | Ass.: Espuma D29, plumante e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D23, D26 dura, plumante | Pés: Madeira',
    dimensoes: '210x94CM | 160x94CM | 150x94CM | 100x94CM | 94x80CM',
    texto_livre: 'Sofá',
    pagina: 68,
  },
  {
    id: 5507,
    nome: 'Premium',
    descricao: 'Sofá modular arredondado com assento pillow em D26 e molas zig zag.',
    material: 'Enc.: Almofadas de fibra siliconada, molas zig zag | Ass.: Espuma D26 soft c/ pillow D26 soft, molas zig zag | Est.: Madeira eucalipto e MDF | Braços: Fibra | Pés: Madeira',
    dimensoes: '88x097CM | 148x97CM | 172x97CM | 206x97CM | 232x97CM | 332x97CM',
    texto_livre: 'Sofá',
    pagina: 70,
  },
  {
    id: 5508,
    nome: 'QATAR',
    descricao: 'Sofá retrátil modular com múltiplas configurações de assento e posições abertas/fechadas.',
    material: 'Enc.: Fibra siliconada | Ass.: Espuma D26HR, D29, plumante e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D23, plumante | Pés: Sapata plástica',
    dimensoes: '97x097CM | 153x097CM | 82x153CM | 63x153CM | 102x153CM | 117x153CM',
    texto_livre: 'Sofá Retrátil',
    pagina: 72,
  },
  {
    id: 5509,
    nome: 'REC',
    descricao: 'Sofá clássico com assento em plumante e mola zig zag, pés em madeira.',
    material: 'Enc.: Fibra siliconada | Ass.: Espuma D23, D26 HR, plumante e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D23 soft, tecnoforme | Pés: Madeira',
    dimensoes: '220x99CM | 99x100CM',
    texto_livre: 'Sofá',
    pagina: 74,
  },
  {
    id: 5510,
    nome: 'RECAMIER',
    descricao: 'Recamier estofado com assento em plumante e pés em alumínio.',
    material: 'Ass.: Espuma D23, D23 soft, D30 e plumante | Est.: Madeira eucalipto e MDF | Pés: Alumínio',
    dimensoes: '180x60CM',
    texto_livre: 'Recamier',
    pagina: 76,
  },
  {
    id: 5511,
    nome: 'Renoir',
    descricao: 'Sofá com encosto em fibra siliconada e assento em D26 soft com mola zig zag, pés em aço.',
    material: 'Enc.: Fibra siliconada, cinta elástica | Ass.: Espuma D26 soft c/ fibra siliconada, mola zig zag e arame de aço | Est.: Madeira eucalipto e MDF | Braços: Espuma D26 dura c/ fibra siliconada | Pés: Aço',
    dimensoes: '92x083CM | 218x92CM | 160x92CM',
    texto_livre: 'Sofá',
    pagina: 78,
  },
  {
    id: 5512,
    nome: 'Rubi',
    descricao: 'Sofá modular com assento em D32 e plumante, pés em MDF.',
    material: 'Enc.: Espuma D23 c/ fibra siliconada, cinta elástica | Ass.: Espuma D32 c/ plumante e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D23 soft c/ tecnoform | Pés: MDF',
    dimensoes: '65x101CM | 158x101CM | 185x101CM',
    texto_livre: 'Sofá',
    pagina: 80,
  },
  {
    id: 5513,
    nome: 'SANTORINI',
    descricao: 'Sofá retrátil modular com mecanismo, assento em D29 e mola aspiral.',
    material: 'Enc.: Espuma D23, plumante e fibra siliconada | Ass.: Espuma D29, plumante, cinta elástica e mola aspiral | Est.: Madeira eucalipto e MDF | Braços: Espuma D23 e D26 dura | Pés: Madeira',
    dimensoes: '122x165CM | 100x165CM | 60x165CM',
    texto_livre: 'Sofá Retrátil',
    pagina: 82,
  },
  {
    id: 5514,
    nome: 'Seul',
    descricao: 'Sofá retrátil bipartido com chaise e assento em D26 HR e mola espiral, pés em MDF.',
    material: 'Enc.: Espuma D25 soft c/ plumante, cinta elástica | Ass.: Espuma D26 HR soft c/ plumante e mola espiral | Est.: Madeira eucalipto e MDF | Pés: MDF',
    dimensoes: '100x132CM | 100x100CM | 90x100CM | 116x100CM',
    texto_livre: 'Sofá Retrátil',
    pagina: 84,
  },
  {
    id: 5515,
    nome: 'Sintra',
    descricao: 'Sofá retrátil bipartido com assento em D23 e D32 soft e plumante, pés em MDF.',
    material: 'Enc.: Espuma D23 soft, fibra siliconada e cinta elástica | Ass.: Espuma D23 e D32 soft, plumante e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D16 e D23 soft | Pés: MDF',
    dimensoes: '83x105CM | 63x096CM | 95x096CM | 129x096CM',
    texto_livre: 'Sofá Retrátil',
    pagina: 86,
  },
  {
    id: 5516,
    nome: 'TRIP',
    descricao: 'Sofá retrátil com assento em D29 e plumante, pés em ferro e madeira.',
    material: 'Enc.: Espuma D23, cinta elástica e fibra siliconada | Ass.: Espuma D29, plumante e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D26 HR, plumante | Pés: Ferro 15cm e madeira',
    dimensoes: '103x100CM | 83x100CM | 156x103CM',
    texto_livre: 'Sofá Retrátil',
    pagina: 88,
  },
  {
    id: 5517,
    nome: 'URBE',
    descricao: 'Sofá reto em múltiplos tamanhos com assento em D26 plumante, pés em aço.',
    material: 'Enc.: Plumante e fibra siliconada | Ass.: Espuma D26 plumante e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D23, D26 dura, plumante | Pés: Aço',
    dimensoes: '160x90CM | 200x90CM | 240x90CM | 280x90CM | 90x88CM',
    texto_livre: 'Sofá',
    pagina: 90,
  },
  {
    id: 5518,
    nome: 'Wind',
    descricao: 'Poltrona retrátil com assento em D26 HR e plumante, pés em aço.',
    material: 'Enc.: Fibra siliconada e mola zig zag | Ass.: Espuma D26 HR e D19 soft c/ plumante | Est.: Madeira eucalipto e MDF | Pés: Aço',
    dimensoes: '90x104CM | 104x165CM',
    texto_livre: 'Poltrona Retrátil',
    pagina: 92,
  },
]

const stmt = db.prepare(`
  UPDATE produtos SET
    nome = @nome,
    descricao = @descricao,
    material = @material,
    dimensoes = @dimensoes,
    texto_livre = @texto_livre,
    pagina = @pagina
  WHERE id = @id
`)

for (const u of updates) {
  const info = stmt.run(u)
  console.log(`✅ ID ${u.id} (${u.nome}): ${info.changes} linha(s) atualizada(s)`)
}

db.close()
console.log('\nConcluído.')
