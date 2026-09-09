const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

const dbDir = path.join(__dirname, '..', 'database')
fs.mkdirSync(dbDir, { recursive: true })
const db = new Database(path.join(dbDir, 'catalogo.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS catalogos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    pasta TEXT NOT NULL UNIQUE,
    ano INTEGER,
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    catalogo_id INTEGER NOT NULL REFERENCES catalogos(id),
    codigo TEXT,
    nome TEXT NOT NULL,
    descricao TEXT,
    material TEXT,
    dimensoes TEXT,
    acabamento TEXT,
    cores TEXT,
    preco_min REAL,
    preco_max REAL,
    pagina INTEGER,
    texto_livre TEXT,
    imagens TEXT DEFAULT '[]',
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(produto_id)
  );
  CREATE INDEX IF NOT EXISTS idx_produtos_catalogo ON produtos(catalogo_id);
  CREATE INDEX IF NOT EXISTS idx_produtos_nome ON produtos(nome);
`)

const catalogos = [
  { nome: 'ABV 2025', pasta: 'ABV 2025', ano: 2025 },
  { nome: 'Artano 2024', pasta: 'Artano 2024', ano: 2024 },
  { nome: 'Gold Line 2025', pasta: 'Gold Line 2025', ano: 2025 },
]

const insertCatalogo = db.prepare('INSERT OR IGNORE INTO catalogos (nome, pasta, ano) VALUES (?, ?, ?)')
for (const c of catalogos) insertCatalogo.run(c.nome, c.pasta, c.ano)

const getCatalogo = db.prepare('SELECT id FROM catalogos WHERE pasta = ?')

const produtos = [
  {
    pasta: 'ABV 2025',
    codigo: 'ABV-001',
    nome: 'Sofá Retrátil Vermont',
    descricao: 'Sofá retrátil e reclinável com estrutura em madeira maciça e espuma D33.',
    material: 'Madeira maciça + Espuma D33',
    dimensoes: 'L 280 x P 95 x A 100 cm',
    acabamento: 'Tecido veludo importado',
    cores: 'Cinza Chumbo, Bege, Azul Petróleo',
    preco_min: 3890.00,
    preco_max: 4290.00,
    pagina: 5,
    texto_livre: 'Garantia de 2 anos. Produto desmontável para facilitar transporte.',
  },
  {
    pasta: 'ABV 2025',
    codigo: 'ABV-002',
    nome: 'Mesa de Jantar Atenas',
    descricao: 'Mesa extensível com tampo em MDF revestido e pés em aço carbono pintado.',
    material: 'MDF + Aço Carbono',
    dimensoes: 'L 160/200 x P 90 x A 76 cm',
    acabamento: 'Laminado BP Off-White',
    cores: 'Off-White, Carvalho Nórdico',
    preco_min: 1290.00,
    preco_max: 1490.00,
    pagina: 12,
    texto_livre: 'Acompanha 6 cadeiras. Extensão adiciona 40cm ao tampo.',
  },
  {
    pasta: 'ABV 2025',
    codigo: 'ABV-003',
    nome: 'Rack Suspenso Milano',
    descricao: 'Rack para TV com painéis ripados e nichos internos com iluminação LED.',
    material: 'MDF 18mm',
    dimensoes: 'L 200 x P 35 x A 50 cm',
    acabamento: 'Ripado Freijó + Lacado Branco',
    cores: 'Freijó com Branco',
    preco_min: 2150.00,
    preco_max: null,
    pagina: 18,
    texto_livre: 'Suporta TVs até 75". LED incluso. Fixação na parede com suporte reforçado.',
  },
  {
    pasta: 'Artano 2024',
    codigo: 'ART-011',
    nome: 'Poltrona Giratória Eames',
    descricao: 'Poltrona giratória com base em alumínio polido e assento em couro ecológico.',
    material: 'Alumínio + Couro Ecológico',
    dimensoes: 'L 65 x P 65 x A 85 cm',
    acabamento: 'Couro ecológico texturizado',
    cores: 'Preto, Branco, Caramelo',
    preco_min: 1750.00,
    preco_max: 1950.00,
    pagina: 3,
    texto_livre: 'Base giratória 360°. Ajuste de altura a gás. Peso máximo 120kg.',
  },
  {
    pasta: 'Artano 2024',
    codigo: 'ART-022',
    nome: 'Aparador Nórdico Slim',
    descricao: 'Aparador de sala com 4 portas e puxadores em metal escovado.',
    material: 'MDF + Metal Escovado',
    dimensoes: 'L 180 x P 40 x A 75 cm',
    acabamento: 'Lacado Fosco',
    cores: 'Branco Neve, Grafite, Verde Musgo',
    preco_min: 1840.00,
    preco_max: 2100.00,
    pagina: 9,
    texto_livre: 'Prateleiras internas reguláveis. Suporta até 30kg por compartimento.',
  },
  {
    pasta: 'Artano 2024',
    codigo: 'ART-033',
    nome: 'Cama Box Casal Florence',
    descricao: 'Cama box casal com cabeceira estofada em linho e pés palito em madeira.',
    material: 'Madeira + Linho',
    dimensoes: 'L 160 x C 200 x A 130 cm',
    acabamento: 'Linho natural costurado',
    cores: 'Bege Natural, Cinza Claro, Mostarda',
    preco_min: 2600.00,
    preco_max: 3100.00,
    pagina: 22,
    texto_livre: 'Box com molas ensacadas. Cabeceira com botões capitonê. Não inclui colchão.',
  },
  {
    pasta: 'Gold Line 2025',
    codigo: 'GL-041',
    nome: 'Mesa de Centro Cube',
    descricao: 'Mesa de centro com tampo em vidro temperado e base geométrica em aço dourado.',
    material: 'Vidro Temperado 10mm + Aço',
    dimensoes: 'L 80 x P 80 x A 40 cm',
    acabamento: 'Dourado escovado',
    cores: 'Dourado + Vidro Transparente',
    preco_min: 980.00,
    preco_max: null,
    pagina: 6,
    texto_livre: 'Vidro temperado 10mm. Base soldada com tratamento anti-ferrugem.',
  },
  {
    pasta: 'Gold Line 2025',
    codigo: 'GL-055',
    nome: 'Estante Modular Brooklyn',
    descricao: 'Estante modular com nichos abertos e gavetas, design industrial.',
    material: 'MDF + Ferro Fundido',
    dimensoes: 'L 120 x P 30 x A 180 cm',
    acabamento: 'Carvalho Americano + Preto Fosco',
    cores: 'Carvalho com Preto',
    preco_min: 3200.00,
    preco_max: 3800.00,
    pagina: 14,
    texto_livre: 'Sistema modular expansível. Suporta até 15kg por nicho.',
  },
  {
    pasta: 'Gold Line 2025',
    codigo: 'GL-067',
    nome: 'Luminária de Piso Arc',
    descricao: 'Luminária de piso articulada em arco com cúpula em metal martilhado.',
    material: 'Aço + Metal Martilhado',
    dimensoes: 'H 175 cm / Alcance 90 cm',
    acabamento: 'Cobre envelhecido',
    cores: 'Cobre, Preto Matte, Dourado',
    preco_min: 620.00,
    preco_max: 750.00,
    pagina: 31,
    texto_livre: 'Bivolt automático. Acompanha lâmpada LED 12W E27. Dimmer incluso.',
  },
]

const insertProduto = db.prepare(`
  INSERT OR IGNORE INTO produtos (catalogo_id, codigo, nome, descricao, material, dimensoes, acabamento, cores, preco_min, preco_max, pagina, texto_livre, imagens)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]')
`)

for (const p of produtos) {
  const cat = getCatalogo.get(p.pasta)
  if (!cat) { console.log('Catálogo não encontrado:', p.pasta); continue }
  insertProduto.run(cat.id, p.codigo, p.nome, p.descricao, p.material, p.dimensoes, p.acabamento, p.cores, p.preco_min, p.preco_max, p.pagina, p.texto_livre)
}

console.log(`✓ ${catalogos.length} catálogos e ${produtos.length} produtos inseridos.`)
db.close()
