/**
 * setup-aluminas.cjs
 * Cria o catálogo ALUMINAS 2024 no banco e insere todos os produtos.
 * Uso: node scripts/setup-aluminas.cjs
 */
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

const { BASE_CATALOGOS } = require('./config.cjs')
const CATALOG_PASTA = 'ALUMINAS 2024'
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
db.pragma('journal_mode = WAL')

// ── Catálogo ─────────────────────────────────────────────────────────────────
const existing = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
if (existing) {
  console.log('Catálogo já existe. Apagando produtos anteriores...')
  db.prepare('DELETE FROM produtos WHERE catalogo_id = ?').run(existing.id)
}
const catId = existing?.id ?? db.prepare(
  'INSERT INTO catalogos (nome, pasta, ano) VALUES (?, ?, ?)'
).run(CATALOG_PASTA, CATALOG_PASTA, 2024).lastInsertRowid

console.log(`Catálogo ID: ${catId}`)

// ── Produtos (extraídos via GPT-4o do PDF imagem) ────────────────────────────
const produtos = [
  // Sofás / Poltronas
  { pagina:  8, nome: 'Antares',      descricao: 'Sofá',      dimensoes: '220 x 80 x 90 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Estrutura envolvente com trama artesanal nas laterais e visual leve.' },
  { pagina:  8, nome: 'Antares',      descricao: 'Poltrona',  dimensoes: '80 x 80 x 90 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona com laterais curvas trançadas e desenho acolhedor.' },
  { pagina:  9, nome: 'Lass',         descricao: 'Sofá',      dimensoes: '220 x 86 x 87 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Design marcante com estrutura aparente e composição geométrica.' },
  { pagina:  9, nome: 'Lass',         descricao: 'Poltrona',  dimensoes: '86 x 86 x 87 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona compacta com estrutura lateral de forte presença visual.' },
  { pagina:  9, nome: 'Lass',         descricao: 'Mesa',      dimensoes: '81 x 81 x 35 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa baixa de formato circular com base visualmente escultórica.' },
  { pagina: 10, nome: 'Veredas',      descricao: 'Sofá',      dimensoes: '220 x 80 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Linhas contemporâneas combinadas com trama artesanal nos braços.' },
  { pagina: 10, nome: 'Veredas',      descricao: 'Poltrona',  dimensoes: '85 x 80 x 80 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de desenho leve com trama lateral e estrutura metálica aparente.' },
  { pagina: 11, nome: 'Veredas',      descricao: 'Sofá',      dimensoes: '220 x 80 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Versão com acabamento trançado e estética descontraída.' },
  { pagina: 11, nome: 'Veredas',      descricao: 'Poltrona',  dimensoes: '85 x 80 x 80 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona com encosto envolvente e trama artesanal.' },
  { pagina: 12, nome: 'Erys',         descricao: 'Sofá',      dimensoes: '250 x 88 x 84 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Estrutura marcada por desenho geométrico nas laterais.' },
  { pagina: 12, nome: 'Erys',         descricao: 'Poltrona',  dimensoes: '110 x 88 x 84 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de linhas envolventes com laterais decorativas.' },
  { pagina: 13, nome: 'Armani',       descricao: 'Sofá',      dimensoes: '240 x 110 x 70 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Volume generoso combinado a base aparente e desenho contemporâneo.' },
  { pagina: 13, nome: 'Armani',       descricao: 'Poltrona',  dimensoes: '90 x 100 x 70 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona com laterais trabalhadas e proporções robustas.' },
  { pagina: 13, nome: 'Armani',       descricao: 'Mesa',      dimensoes: '120 x 70 x 35 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa baixa que repete a linguagem estrutural da coleção.' },
  { pagina: 14, nome: 'Marbella',     descricao: 'Sofá',      dimensoes: '220 x 89 x 83 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Design contemporâneo com braços revestidos por elemento trançado.' },
  { pagina: 14, nome: 'Marbella',     descricao: 'Poltrona',  dimensoes: '90 x 89 x 83 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona compacta com braços volumosos e identidade artesanal.' },
  { pagina: 15, nome: 'Vitta',        descricao: 'Sofá',      dimensoes: '200 x 82 x 85 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Estrutura linear combinada a laterais trabalhadas e visual sofisticado.' },
  { pagina: 15, nome: 'Vitta',        descricao: 'Poltrona',  dimensoes: '110 x 82 x 85 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona com laterais trançadas e estrutura metálica contínua.' },
  { pagina: 16, nome: 'Victus',       descricao: 'Sofá',      dimensoes: '240 x 90 x 78 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Sistema modular de linhas retas pensado para composições flexíveis.' },
  { pagina: 17, nome: 'Lunar',        descricao: 'Sofá',      dimensoes: '100 x 100 x 80 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Módulos compactos com base destacada e linguagem contemporânea.' },
  { pagina: 18, nome: 'Ayron',        descricao: 'Sofá',      dimensoes: '200 x 90 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Sofá modular de formas limpas e base estruturada.' },
  { pagina: 19, nome: 'Inhotim',      descricao: 'Sofá',      dimensoes: '200 x 82 x 85 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Sistema modular com visual contemporâneo e composição ampla.' },
  // Mesas de centro / laterais
  { pagina: 22, nome: 'Cayman',       descricao: 'Mesa',      dimensoes: '100 x 100 x 40 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa de centro circular com tampo em destaque sobre base geométrica.' },
  { pagina: 23, nome: 'Vision',       descricao: 'Mesa',      dimensoes: '110 x 110 x 35 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Volume arredondado com base vazada de desenho escultórico.' },
  { pagina: 24, nome: 'Lunar',        descricao: 'Mesa',      dimensoes: '120 x 60 x 35 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa baixa retangular de linhas firmes e aparência sofisticada.' },
  { pagina: 25, nome: 'Catteli',      descricao: 'Mesa',      dimensoes: '120 x 60 x 35 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Tampo linear apoiado sobre base lateral de desenho minimalista.' },
  { pagina: 26, nome: 'Orione',       descricao: 'Mesa',      dimensoes: '100 x 100 x 35 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa baixa de presença leve e desenho contemporâneo.' },
  { pagina: 27, nome: 'Veredas',      descricao: 'Mesa',      dimensoes: '150 x 60 x 35 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa retangular de linhas simples integrada à coleção Veredas.' },
  { pagina: 28, nome: 'Marbella',     descricao: 'Mesa',      dimensoes: '45 x 45 x 35 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa lateral compacta com proporções delicadas.' },
  { pagina: 29, nome: 'Luci',         descricao: 'Mesa',      dimensoes: '60 x 60 x 40 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa lateral redonda de desenho limpo e leve.' },
  { pagina: 30, nome: 'Lua',          descricao: 'Mesa',      dimensoes: '60 x 60 x 40 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa lateral circular com base visualmente delicada.' },
  { pagina: 31, nome: 'Indianápolis', descricao: 'Mesa',      dimensoes: '50 x 50 x 40 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa lateral compacta de desenho contemporâneo.' },
  { pagina: 32, nome: 'Vitta',        descricao: 'Mesa',      dimensoes: '49 x 45 x 40 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa lateral que combina tampo compacto com base estruturada.' },
  // Mesas de jantar
  { pagina: 34, nome: 'Jade',         descricao: 'Mesa de Jantar', dimensoes: '200 x 120 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa de jantar retangular de proporções elegantes e linhas retas.' },
  { pagina: 34, nome: 'Sky',          descricao: 'Mesa de Jantar', dimensoes: '200 x 120 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa de jantar de desenho minimalista e presença leve.' },
  { pagina: 35, nome: 'Cayman',       descricao: 'Mesa de Jantar', dimensoes: '120 x 120 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa redonda com linguagem orgânica e base central trabalhada.' },
  { pagina: 35, nome: 'Lapa',         descricao: 'Mesa de Jantar', dimensoes: '120 x 120 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa circular de desenho leve apoiada sobre estrutura geométrica.' },
  { pagina: 36, nome: 'Palermo',      descricao: 'Mesa de Jantar', dimensoes: '120 x 120 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa redonda de aparência leve com base de linhas cruzadas.' },
  { pagina: 36, nome: 'Diamantina',   descricao: 'Mesa de Jantar', dimensoes: '230 x 120 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa de jantar com base geométrica de forte presença escultural.' },
  { pagina: 37, nome: 'Ettore',       descricao: 'Mesa de Jantar', dimensoes: '220 x 100 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa de jantar retangular com visual robusto e contemporâneo.' },
  { pagina: 37, nome: 'Duda',         descricao: 'Poltrona',  dimensoes: '60 x 63 x 80 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de jantar compacta com desenho delicado e braços discretos.' },
  { pagina: 38, nome: 'Chicago',      descricao: 'Mesa de Jantar', dimensoes: '220 x 100 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa retangular de base arquitetônica e linhas precisas.' },
  { pagina: 38, nome: 'Amélia',       descricao: 'Mesa de Jantar', dimensoes: '220 x 100 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa de jantar de visual leve sustentada por estrutura elegante.' },
  { pagina: 39, nome: 'Gramado',      descricao: 'Mesa de Jantar', dimensoes: '150 x 150 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa redonda de grande presença, adequada a composições amplas.' },
  { pagina: 39, nome: 'Fox',          descricao: 'Poltrona',  dimensoes: '55 x 60 x 85 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de jantar compacta com desenho contemporâneo.' },
  { pagina: 40, nome: 'Nacional',     descricao: 'Mesa de Jantar', dimensoes: '100 x 100 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa redonda com base central de linguagem orgânica.' },
  { pagina: 40, nome: 'Corbelle',     descricao: 'Mesa de Jantar', dimensoes: '70 x 70 x 75 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Base de mesa com desenho trançado e aparência escultórica.' },
  { pagina: 41, nome: 'Victus',       descricao: 'Mesa de Jantar', dimensoes: '220 x 100 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa de jantar de linhas retas integrada à linguagem Victus.' },
  { pagina: 41, nome: 'Itapuã',       descricao: 'Poltrona',  dimensoes: '60 x 60 x 83 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de jantar com encosto estruturado e proporções leves.' },
  { pagina: 42, nome: 'Fox',          descricao: 'Mesa',      dimensoes: '95 x 95 x 75 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa compacta de desenho contemporâneo e estrutura aparente.' },
  { pagina: 42, nome: 'Labirinto',    descricao: 'Mesa',      dimensoes: '95 x 95 x 75 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Base cruzada cria uma identidade geométrica marcante.' },
  { pagina: 43, nome: 'Turin',        descricao: 'Mesa de Jantar', dimensoes: '160 x 160 x 75 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa redonda ampla com presença elegante e desenho contemporâneo.' },
  { pagina: 43, nome: 'Amélia',       descricao: 'Poltrona',  dimensoes: '57 x 60 x 85 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de jantar leve com encosto bem definido.' },
  // Cadeiras / Poltronas de jantar
  { pagina: 46, nome: 'Amélia',       descricao: 'Poltrona',  dimensoes: '57 x 59 x 84 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Design de linhas suaves e proporções compactas para jantar.' },
  { pagina: 47, nome: 'Itapuã',       descricao: 'Poltrona',  dimensoes: '57 x 71 x 83 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona com estrutura leve e assento visualmente acolhedor.' },
  { pagina: 48, nome: 'Itapuã',       descricao: 'Poltrona',  dimensoes: '57 x 71 x 83 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Desenho de jantar com braços marcantes e estrutura aparente.' },
  { pagina: 48, nome: 'Jade',         descricao: 'Poltrona',  dimensoes: '57 x 65 x 86 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de jantar com desenho elegante e encosto vertical.' },
  { pagina: 49, nome: 'Nacional',     descricao: 'Cadeira',   dimensoes: '55 x 58 x 83 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira de linhas retas com linguagem contemporânea.' },
  { pagina: 50, nome: 'Millá',        descricao: 'Cadeira',   dimensoes: '55 x 58 x 83 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Design leve com encosto envolvente e acabamento visual trançado.' },
  { pagina: 51, nome: 'Belt',         descricao: 'Cadeira',   dimensoes: '74 x 59 x 74 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Estrutura aberta com encosto trabalhado em trama.' },
  { pagina: 52, nome: 'Ocean',        descricao: 'Poltrona',  dimensoes: '66 x 66 x 86 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de linhas curvas e forte identidade contemporânea.' },
  { pagina: 52, nome: 'Queen',        descricao: 'Poltrona',  dimensoes: '77 x 68 x 77 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Encosto amplo e desenho arredondado conferem presença marcante.' },
  { pagina: 53, nome: 'Luna',         descricao: 'Poltrona',  dimensoes: '61 x 58 x 84 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de jantar compacta com formas envolventes.' },
  { pagina: 53, nome: 'Giorgio',      descricao: 'Poltrona',  dimensoes: '61 x 61 x 83 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Estrutura contemporânea com encosto envolvente e visual sofisticado.' },
  { pagina: 54, nome: 'Cayman',       descricao: 'Poltrona',  dimensoes: '55 x 58 x 84 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de jantar com braços aparentes e desenho leve.' },
  { pagina: 54, nome: 'Villas',       descricao: 'Poltrona',  dimensoes: '55 x 58 x 80 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Design acolhedor com encosto curvo e estrutura delicada.' },
  { pagina: 55, nome: 'Lapa',         descricao: 'Cadeira',   dimensoes: '61 x 53 x 80 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira de linhas retas com encosto e braços discretos.' },
  { pagina: 56, nome: 'Lass',         descricao: 'Cadeira',   dimensoes: '61 x 58 x 83 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira de desenho elegante com braços e estrutura contemporânea.' },
  { pagina: 56, nome: 'Plaza',        descricao: 'Cadeira',   dimensoes: '54 x 53 x 75 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira leve de encosto aberto e traços modernos.' },
  { pagina: 57, nome: 'Sorrento',     descricao: 'Poltrona',  dimensoes: '100 x 73 x 90 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço de linhas curvas que privilegia conforto e movimento.' },
  { pagina: 57, nome: 'Orleans',      descricao: 'Poltrona',  dimensoes: '95 x 54 x 101 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona acompanhada de puff, com desenho retrô-contemporâneo.' },
  { pagina: 58, nome: 'Martin',       descricao: 'Cadeira',   dimensoes: '61 x 59 x 76 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Assento arredondado e estrutura delicada formam uma peça de forte identidade.' },
  { pagina: 58, nome: 'Ibiza',        descricao: 'Poltrona',  dimensoes: '87 x 80 x 77 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona de formas suaves com encosto envolvente.' },
  { pagina: 59, nome: 'Queen',        descricao: 'Poltrona',  dimensoes: '110 x 68 x 140 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Poltrona alta com desenho escultural e encosto alongado.' },
  { pagina: 59, nome: 'Ambiance',     descricao: 'Poltrona',  dimensoes: '77 x 62 x 77 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Estrutura de trama ampla cria aparência leve e artesanal.' },
  { pagina: 60, nome: 'Duda',         descricao: 'Cadeira',   dimensoes: '82 x 55 x 87 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira de jantar com desenho elegante e braços discretos.' },
  { pagina: 60, nome: 'Panamá',       descricao: 'Cadeira',   dimensoes: '87 x 55 x 47 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira de linhas clássicas e encosto alto.' },
  { pagina: 61, nome: 'Jade',         descricao: 'Cadeira',   dimensoes: '82 x 57 x 86 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Estrutura leve com encosto aberto e desenho contemporâneo.' },
  { pagina: 61, nome: 'Búzios',       descricao: 'Cadeira',   dimensoes: '92 x 45 x 57 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira de visual delicado e estrutura aparente.' },
  { pagina: 62, nome: 'Malta',        descricao: 'Cadeira',   dimensoes: '84 x 45 x 64 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Perfil esguio com encosto reto e estética minimalista.' },
  { pagina: 62, nome: 'Nacional',     descricao: 'Cadeira',   dimensoes: '84 x 45 x 64 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira de desenho limpo e proporções compactas.' },
  { pagina: 63, nome: 'Amélia',       descricao: 'Cadeira',   dimensoes: '83 x 48 x 62 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cadeira leve com encosto alto e desenho elegante.' },
  { pagina: 63, nome: 'Angra',        descricao: 'Cadeira',   dimensoes: '83 x 48 x 62 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Estrutura esguia com encosto de trama e visual contemporâneo.' },
  // Banquetas
  { pagina: 66, nome: 'Amélia',       descricao: 'Banqueta',  dimensoes: '105 x 52 x 58 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta alta com estrutura elegante e encosto aberto.' },
  { pagina: 67, nome: 'Nacional',     descricao: 'Banqueta',  dimensoes: '100 x 52 x 57 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta de linhas retas e visual contemporâneo.' },
  { pagina: 68, nome: 'Duda',         descricao: 'Banqueta',  dimensoes: '97 x 57 x 60 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta com encosto alto e silhueta alongada.' },
  { pagina: 68, nome: 'Martin',       descricao: 'Banqueta',  dimensoes: '97 x 57 x 60 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta giratória de assento arredondado e estrutura leve.' },
  { pagina: 69, nome: 'Britto',       descricao: 'Banqueta',  dimensoes: '66 x 46 x 46 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta compacta de desenho leve e proporções descontraídas.' },
  { pagina: 69, nome: 'Sonic',        descricao: 'Banqueta',  dimensoes: '120 x 60 x 60 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banco alto de apoio para composições externas.' },
  { pagina: 69, nome: 'Ombrelone',    descricao: 'Ombrelone', dimensoes: '270 x 270 x 270 cm',  material: 'Alumínio',                  texto_livre: 'Ombrelone central de grande cobertura para áreas externas.' },
  { pagina: 70, nome: 'Panamá',       descricao: 'Banqueta',  dimensoes: '103 x 52 x 58 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta com encosto trançado e visual acolhedor.' },
  { pagina: 70, nome: 'Dafne',        descricao: 'Banqueta',  dimensoes: '95 x 53 x 55 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta de traços modernos e estrutura compacta.' },
  { pagina: 71, nome: 'Ocean',        descricao: 'Banqueta',  dimensoes: '100 x 46 x 46 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta com encosto de trama e presença marcante.' },
  { pagina: 71, nome: 'Indianápolis', descricao: 'Banqueta',  dimensoes: '105 x 70 x 120 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Conjunto alto com linhas retas e base visualmente leve.' },
  { pagina: 72, nome: 'Plaza',        descricao: 'Banqueta',  dimensoes: '100 x 54 x 53 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta de linhas abertas e desenho contemporâneo.' },
  { pagina: 72, nome: 'Eros',         descricao: 'Banqueta',  dimensoes: '100 x 52 x 59 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta com encosto trançado e aparência artesanal.' },
  { pagina: 73, nome: 'Maya',         descricao: 'Banqueta',  dimensoes: '66 x 50 x 50 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Banqueta giratória de formato compacto e visual texturizado.' },
  // Chaises / Espreguiçadeiras
  { pagina: 76, nome: 'Fox',          descricao: 'Chaise',    dimensoes: '80 x 197 x 37 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Espreguiçadeira de linhas retas com encosto reclinável.' },
  { pagina: 77, nome: 'Vitta',        descricao: 'Chaise',    dimensoes: '80 x 197 x 46 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Chaise ampla com estrutura externa trabalhada e conforto visual.' },
  { pagina: 78, nome: 'Nacional',     descricao: 'Chaise',    dimensoes: '67 x 204 x 35 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Espreguiçadeira de perfil baixo e desenho minimalista.' },
  { pagina: 78, nome: 'Marina',       descricao: 'Chaise',    dimensoes: '67 x 204 x 35 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Chaise de linhas limpas e estrutura contemporânea.' },
  { pagina: 80, nome: 'Living',       descricao: 'Chaise',    dimensoes: '84 x 182 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Espreguiçadeira com encosto reclinável e perfil elegante.' },
  { pagina: 80, nome: 'Carmona',      descricao: 'Chaise',    dimensoes: '84 x 182 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Chaise de linhas curvas e visual sofisticado para áreas externas.' },
  { pagina: 81, nome: 'Copacabana',   descricao: 'Chaise',    dimensoes: '180 x 65 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Chaise ampla com desenho externo trançado e presença marcante.' },
  { pagina: 81, nome: 'Copacabana',   descricao: 'Mesa',      dimensoes: '65 x 65 x 30 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa lateral compacta pensada para acompanhar a chaise.' },
  { pagina: 82, nome: 'Gaivota',      descricao: 'Chaise',    dimensoes: '200 x 60 x 38 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Espreguiçadeira de estrutura simples e encosto regulável.' },
  { pagina: 82, nome: 'Nilo',         descricao: 'Chaise',    dimensoes: '200 x 80 x 38 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Chaise de linhas retas com laterais estruturadas.' },
  { pagina: 83, nome: 'Afrodite',     descricao: 'Chaise',    dimensoes: '180 x 80 x 35 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Chaise de perfil baixo e desenho contemporâneo para piscina.' },
  // Balanços suspensos
  { pagina: 86, nome: 'Vitta',        descricao: 'Balanço',   dimensoes: '150 x 90 x 120 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço suspenso com assento amplo e estrutura envolvente.' },
  { pagina: 87, nome: 'Gota',         descricao: 'Balanço',   dimensoes: '120 x 95 x 160 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço em formato de gota com presença escultural.' },
  { pagina: 88, nome: 'Mayore',       descricao: 'Balanço',   dimensoes: '109 x 100 x 170 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço suspenso de formato oval e desenho acolhedor.' },
  { pagina: 89, nome: 'Ouro Preto',   descricao: 'Balanço',   dimensoes: '140 x 145 x 155 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço tipo casulo com trama envolvente e forte presença visual.' },
  { pagina: 90, nome: 'Fiorella',     descricao: 'Balanço',   dimensoes: '130 x 130 x 130 cm', material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço circular com desenho ornamental e aspecto leve.' },
  { pagina: 91, nome: 'Derby',        descricao: 'Balanço',   dimensoes: '120 x 95 x 152 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço tipo casulo com trama orgânica e estrutura independente.' },
  { pagina: 92, nome: 'Martin',       descricao: 'Balanço',   dimensoes: '68 x 68 x 58 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço suspenso de desenho aberto e linhas suaves.' },
  { pagina: 93, nome: 'York',         descricao: 'Balanço',   dimensoes: '68 x 63 x 150 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Balanço suspenso compacto com estrutura ornamental.' },
  // Daybeds / Concha
  { pagina: 96, nome: 'Ocean',        descricao: 'Daybed',    dimensoes: '180 x 180 x 80 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Daybed circular com borda trançada e visual envolvente.' },
  { pagina: 97, nome: 'Drummond',     descricao: 'Daybed',    dimensoes: '160 x 100 x 76 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Concha externa de grande presença combinada a formas arredondadas.' },
  { pagina: 97, nome: 'Drummond',     descricao: 'Mesa',      dimensoes: '53 x 53 x 58 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Mesa lateral compacta concebida para acompanhar a concha.' },
  { pagina: 98, nome: 'Vitta',        descricao: 'Daybed',    dimensoes: '180 x 180 x 80 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Daybed circular com composição macia e estrutura trançada.' },
  // Aparadores / Carrinho Bar
  { pagina: 99,  nome: 'Marbella',    descricao: 'Aparador',  dimensoes: '140 x 45 x 100 cm',  material: 'Alumínio e Fibra Sintética', texto_livre: 'Aparador de visual leve com estrutura elevada e linhas refinadas.' },
  { pagina: 100, nome: 'Sky',         descricao: 'Aparador',  dimensoes: '140 x 40 x 70 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Aparador compacto de desenho reto e estrutura elegante.' },
  // Gazebo / Tendas
  { pagina: 101, nome: 'Victus',      descricao: 'Gazebo',    dimensoes: '200 x 200 x 200 cm', material: 'Alumínio',                  texto_livre: 'Tenda externa com estrutura arquitetônica e duas áreas de descanso.' },
  { pagina: 102, nome: 'Monte Carlo', descricao: 'Gazebo',    dimensoes: '200 x 200 x 200 cm', material: 'Alumínio',                  texto_livre: 'Tenda de praia com cobertura integrada e visual sofisticado.' },
  { pagina: 103, nome: 'Barcelos',    descricao: 'Gazebo',    dimensoes: '200 x 200 x 200 cm', material: 'Alumínio',                  texto_livre: 'Estrutura externa tipo gazebo pensada para descanso ao ar livre.' },
  // Carrinho Bar
  { pagina: 106, nome: 'Tivoli',      descricao: 'Aparador',  dimensoes: '90 x 50 x 76 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Carrinho bar compacto com dois níveis e rodízios.' },
  { pagina: 107, nome: 'Angra',       descricao: 'Aparador',  dimensoes: '120 x 65 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Carrinho bar de linhas retas com grande capacidade de apoio.' },
  // Puffs
  { pagina: 108, nome: 'Corbelle',    descricao: 'Puff',      dimensoes: '38 x 38 x 40 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Puff compacto com topo destacável e desenho trançado.' },
  { pagina: 108, nome: 'Gardênia',    descricao: 'Puff',      dimensoes: '42 x 42 x 47 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Puff arredondado com textura artesanal e presença decorativa.' },
  { pagina: 109, nome: 'Drummond',    descricao: 'Puff',      dimensoes: '60 x 60 x 50 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Puff cilíndrico de grandes proporções e trama decorativa.' },
  { pagina: 109, nome: 'Square',      descricao: 'Puff',      dimensoes: '42 x 42 x 40 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Puff quadrado com trama volumosa e desenho contemporâneo.' },
  // Banco / Recamier
  { pagina: 110, nome: 'Lunar',       descricao: 'Banqueta',  dimensoes: '120 x 67 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banco longo de desenho linear para áreas externas.' },
  { pagina: 110, nome: 'Porto',       descricao: 'Banqueta',  dimensoes: '120 x 67 x 80 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Banco de inspiração clássica com estrutura marcante.' },
  { pagina: 111, nome: 'Lass',        descricao: 'Recamier',  dimensoes: '130 x 60 x 83 cm',   material: 'Alumínio e Fibra Sintética', texto_livre: 'Namoradeira de duas frentes com braços trabalhados e visual leve.' },
  // Cama pet / Acessórios
  { pagina: 112, nome: 'Vitta',       descricao: 'Puff',      dimensoes: '65 x 65 x 45 cm',    material: 'Alumínio e Fibra Sintética', texto_livre: 'Cama pet circular com acabamento externo trabalhado.' },
  { pagina: 113, nome: 'Cesto',       descricao: 'Acessório', dimensoes: null,                  material: 'Fibra Sintética',           texto_livre: 'Cesto de grande formato pensado para organização e apoio decorativo.' },
  { pagina: 114, nome: 'Cachepô',     descricao: 'Acessório', dimensoes: null,                  material: 'Fibra Sintética',           texto_livre: 'Cachepô decorativo com estrutura alta e linguagem artesanal.' },
  { pagina: 115, nome: 'Copacabana',  descricao: 'Luminária', dimensoes: null,                  material: 'Fibra Sintética',           texto_livre: 'Conjunto de luminárias com trama aparente e desenho inspirado em fibras naturais.' },
  // Ombrelones
  { pagina: 118, nome: 'Central',     descricao: 'Ombrelone', dimensoes: null,                  material: 'Alumínio',                  texto_livre: 'Ombrelone central com coluna vertical e mecanismo de abertura manual.' },
  { pagina: 119, nome: 'Lateral',     descricao: 'Ombrelone', dimensoes: '300 x 300 cm',        material: 'Alumínio',                  texto_livre: 'Ombrelone lateral com braço deslocado e ampla cobertura.' },
]

// ── Inserção em massa ────────────────────────────────────────────────────────
const insert = db.prepare(`
  INSERT INTO produtos (catalogo_id, nome, descricao, material, dimensoes, texto_livre, pagina, imagens)
  VALUES (?, ?, ?, ?, ?, ?, ?, '[]')
`)
const insertAll = db.transaction((prods) => {
  for (const p of prods) {
    insert.run(catId, p.nome, p.descricao, p.material, p.dimensoes, p.texto_livre, p.pagina)
  }
})
insertAll(produtos)
console.log(`✓ ${produtos.length} produtos inseridos.`)

// ── Pastas pag XX ────────────────────────────────────────────────────────────
const { BASE_CATALOGOS: BASE } = require('./config.cjs')
const paginasUnicas = [...new Set(produtos.map(p => p.pagina))].sort((a, b) => a - b)
const imgBase = path.join(BASE, CATALOG_PASTA, 'imagens dos produtos')
fs.mkdirSync(imgBase, { recursive: true })
for (const pg of paginasUnicas) {
  fs.mkdirSync(path.join(imgBase, `pag ${String(pg).padStart(2, '0')}`), { recursive: true })
}
console.log(`✓ ${paginasUnicas.length} pastas pag XX criadas em "imagens dos produtos".`)

db.close()
console.log('\nPróximo passo: adicione as fotos e rode scripts/importar-ALUMINAS-2024.cjs')
