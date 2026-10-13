'use strict';
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database', 'catalogo.db');
const db = new Database(DB_PATH);

// ─── Limpar dados ruins e atualizar catálogo 96 ───────────────────────────────
db.prepare('DELETE FROM produtos WHERE catalogo_id = 96').run();
db.prepare("UPDATE catalogos SET nome = 'Artecouro 2026', pasta = 'Artecouro 2026', ano = 2026 WHERE id = 96").run();
const catId2026 = 96;

// ─── Criar catálogo Artecouro Concept 2026 ───────────────────────────────────
db.prepare("DELETE FROM produtos WHERE catalogo_id IN (SELECT id FROM catalogos WHERE nome = 'Artecouro Concept 2026')").run();
db.prepare("DELETE FROM catalogos WHERE nome = 'Artecouro Concept 2026'").run();
const conceptResult = db.prepare(
  "INSERT INTO catalogos (nome, pasta, ano) VALUES ('Artecouro Concept 2026', 'Artecouro Concept 2026', 2026)"
).run();
const catIdConcept = conceptResult.lastInsertRowid;

console.log(`Catálogo Artecouro 2026 → ID ${catId2026}`);
console.log(`Catálogo Artecouro Concept 2026 → ID ${catIdConcept}`);

// ─── Função de inserção ───────────────────────────────────────────────────────
const insert = db.prepare(`
  INSERT INTO produtos (catalogo_id, nome, descricao, material, dimensoes, texto_livre, pagina)
  VALUES (@catalogo_id, @nome, @descricao, @material, @dimensoes, @texto_livre, @pagina)
`);

const MAD_MDF = 'Estrutura madeira eucalipto de reflorestamento e chapa MDF';

// ─── ARTECOURO 2026 — 42 produtos ────────────────────────────────────────────
const produtos2026 = [
  {
    nome: 'Apgar',
    descricao: 'Poltrona com encosto de fibra siliconada e assento em espuma de alta resiliência.',
    material: `${MAD_MDF}; assento espuma D26 soft; pés ferro`,
    dimensoes: '90x83CM',
    texto_livre: 'Poltrona',
    pagina: 2,
  },
  {
    nome: 'Arezzo',
    descricao: 'Sofá com linhas contemporâneas, encosto de fibra e pés em madeira.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D26 soft; pés madeira`,
    dimensoes: '1Lugar-110x90CM | 2Lugares-160x90CM | 3Lugares-210x90CM',
    texto_livre: 'Sofá',
    pagina: 4,
  },
  {
    nome: 'ATARI',
    descricao: 'Sofá reclinável com assento em espuma D26HR e pés combinando ferro e madeira.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26HR+D29+plumante; pés ferro+madeira`,
    dimensoes: '1LugCBraço-109x99CM | 1LugSsBraço-83x99CM',
    texto_livre: 'Sofá reclinável',
    pagina: 6,
  },
  {
    nome: 'Bora',
    descricao: 'Sofá de linhas retas com assento generoso em espuma D23 e fibra siliconada.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D23+D28+fibra; pés madeira`,
    dimensoes: '1Lugar-88x90CM | 2Lugares-155x90CM | 3Lugares-205x90CM',
    texto_livre: 'Sofá',
    pagina: 8,
  },
  {
    nome: 'BOREAL',
    descricao: 'Poltrona reclinável com rodízios, assento em espuma D26HR e pés em madeira.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26HR+D29+plumante; pés madeira+rodízios`,
    dimensoes: 'Fechado-106x99CM | Aberto-106x159CM',
    texto_livre: 'Poltrona reclinável',
    pagina: 10,
  },
  {
    nome: 'California',
    descricao: 'Sofá com encosto de fibra siliconada e assento em espuma D26 soft com plumante.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D26 soft+plumante; pés madeira`,
    dimensoes: '1Lugar-80x85CM | 2Lugares-149x85CM | 3Lugares-210x85CM',
    texto_livre: 'Sofá',
    pagina: 12,
  },
  {
    nome: 'Colorado',
    descricao: 'Sofá com assento em espuma D26 soft e D26HR com plumante e mola ensacada.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26 soft+D26HR+plumante; pés madeira`,
    dimensoes: '1Lugar-110x93CM | 2Lugares-165x93CM | 3Lugares-215x93CM',
    texto_livre: 'Sofá',
    pagina: 22,
  },
  {
    nome: 'Como',
    descricao: 'Sofá de design elegante com assento em espuma D26HR e plumante.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26HR+plumante; pés madeira`,
    dimensoes: '1Lugar-94x92CM | 2Lugares-167x92CM | 3Lugares-222x92CM',
    texto_livre: 'Sofá',
    pagina: 24,
  },
  {
    nome: 'Cubo',
    descricao: 'Puff quadrado com estrutura em madeira e espuma D25 soft.',
    material: `${MAD_MDF}; assento espuma D25 soft; pés madeira`,
    dimensoes: '50x42CM',
    texto_livre: 'Puff',
    pagina: 26,
  },
  {
    nome: 'EPOQUE',
    descricao: 'Sofá com braços em espuma D26HR com plumante e pés em madeira maciça.',
    material: `${MAD_MDF}; encosto espuma D23+cinta, assento espuma D29+plumante; pés madeira`,
    dimensoes: '1Lugar-92x96CM | 2Lugares-155x96CM | 3Lugares-220x96CM',
    texto_livre: 'Sofá',
    pagina: 28,
  },
  {
    nome: 'Gap',
    descricao: 'Poltrona giratória com assento em espuma D26HR e base giratória metálica.',
    material: `${MAD_MDF}; encosto espuma D23+cinta, assento espuma D26HR+plumante; base giratória`,
    dimensoes: '84x84CM',
    texto_livre: 'Poltrona giratória',
    pagina: 30,
  },
  {
    nome: 'Genius',
    descricao: 'Sofá reclinável modular com encosto de fibra e pés em ferro e madeira.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26HR+D29+plumante; pés ferro+madeira`,
    dimensoes: '1LugCBraço-103x99CM | 1LugSsBraço-83x99CM',
    texto_livre: 'Sofá reclinável',
    pagina: 32,
  },
  {
    nome: 'GENOVA',
    descricao: 'Sofá clássico com encosto de fibra e assento em espuma D26 com plumante.',
    material: `${MAD_MDF}; encosto fibra+D23, assento espuma D26+D29+plumante; pés madeira`,
    dimensoes: '1Lugar-85x88CM | 2Lugares-160x88CM | 3Lugares-210x88CM',
    texto_livre: 'Sofá',
    pagina: 34,
  },
  {
    nome: 'Gold',
    descricao: 'Sofá reclinável com assento em espuma D26HR e braços em D26 dura com plumante.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26HR+D29+plumante; pés ferro+madeira`,
    dimensoes: '1LugCBraço-103x99CM | 1LugSsBraço-83x99CM',
    texto_livre: 'Sofá reclinável',
    pagina: 36,
  },
  {
    nome: 'Gucci',
    descricao: 'Poltrona com assento em espuma D26HR e plumante, pés em ferro pintado.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26HR+D29+plumante; pés ferro`,
    dimensoes: '86x88CM',
    texto_livre: 'Poltrona',
    pagina: 38,
  },
  {
    nome: 'Haero',
    descricao: 'Poltrona giratória reclinável com assento em espuma D26HR e base metálica.',
    material: `${MAD_MDF}; encosto espuma D23+plumante+cinta, assento espuma D26HR+D29+plumante; base ferro`,
    dimensoes: 'Fechado-80x85CM | Aberto-80x148CM',
    texto_livre: 'Poltrona giratória reclinável',
    pagina: 40,
  },
  {
    nome: 'Hollywood',
    descricao: 'Sofá amplo com encosto de fibra siliconada e assento em espuma D26HR.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D26HR+plumante+fibra; pés madeira`,
    dimensoes: '1Lugar-80x90CM | 2Lugares-152x90CM | 3Lugares-204x90CM',
    texto_livre: 'Sofá',
    pagina: 42,
  },
  {
    nome: 'Ibiza',
    descricao: 'Sofá com assento em espuma D26HR e plumante, pés em madeira.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26HR+plumante+fibra; pés madeira`,
    dimensoes: '1Lugar-84x88CM | 2Lugares-165x88CM | 3Lugares-220x88CM',
    texto_livre: 'Sofá',
    pagina: 44,
  },
  {
    nome: 'LOMA',
    descricao: 'Poltrona com encosto e assento de fibra siliconada e espuma D26 soft.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D26 soft+fibra; pés madeira`,
    dimensoes: '80x85CM',
    texto_livre: 'Poltrona',
    pagina: 46,
  },
  {
    nome: 'Madri',
    descricao: 'Sofá com encosto de fibra siliconada e assento em espuma D26 soft com plumante.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D26 soft+plumante; pés madeira`,
    dimensoes: '1Lugar-108x92CM | 2Lugares-160x92CM | 3Lugares-215x92CM',
    texto_livre: 'Sofá',
    pagina: 48,
  },
  {
    nome: 'Madson',
    descricao: 'Poltrona estilo clássico com sustentação por molas zig zag e rodízios.',
    material: `${MAD_MDF}; encosto+assento espuma D26 soft+fibra+molas zig zag; pés madeira+rodízios`,
    dimensoes: '90x80CM',
    texto_livre: 'Poltrona',
    pagina: 50,
  },
  {
    nome: 'Messina',
    descricao: 'Sofá com encosto e assento de fibra siliconada e cinta elástica.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26 soft+fibra+cinta; pés madeira`,
    dimensoes: '1Lugar-86x86CM | 2Lugares-152x86CM | 3Lugares-210x86CM',
    texto_livre: 'Sofá',
    pagina: 52,
  },
  {
    nome: 'MINORI',
    descricao: 'Poltrona reclinável com assento em espuma D23 soft e D35, pés em ferro.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D23 soft+D35+plumante; pés ferro`,
    dimensoes: 'Fechado-102x100x103CM | Aberto-102x161CM',
    texto_livre: 'Poltrona reclinável',
    pagina: 54,
  },
  {
    nome: 'MOOD',
    descricao: 'Poltrona giratória reclinável com assento em tecnoforme e espuma D26HR.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26HR+D29+tecnoforme; pés ferro`,
    dimensoes: 'Fechado-76x100x102CM | Aberto-76x153CM',
    texto_livre: 'Poltrona giratória reclinável',
    pagina: 56,
  },
  {
    nome: 'Napoli',
    descricao: 'Sofá com encosto de fibra e assento em espuma D26 com plumante e mola.',
    material: `${MAD_MDF}; encosto fibra siliconada+cinta, assento espuma D26+plumante; pés madeira`,
    dimensoes: '1Lugar-88x85CM | 2Lugares-155x85CM | 3Lugares-205x85CM',
    texto_livre: 'Sofá',
    pagina: 60,
  },
  {
    nome: 'Oxford',
    descricao: 'Sofá de linhas clássicas com assento em espuma D26 e pés em madeira.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D26+plumante; pés madeira`,
    dimensoes: '1Lugar-90x98CM | 2Lugares-180x90CM | 3Lugares-220x90CM',
    texto_livre: 'Sofá',
    pagina: 62,
  },
  {
    nome: 'PAUSE',
    descricao: 'Sofá reclinável com assento em espuma D29 e tecnoforme, pés em madeira.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D29+tecnoforme+mola; pés madeira`,
    dimensoes: '1LugCBraço-106x104CM | 1LugSsBraço-83x104CM | 2Lugares-156x103CM',
    texto_livre: 'Sofá reclinável',
    pagina: 64,
  },
  {
    nome: 'Poli',
    descricao: 'Poltrona giratória com assento em espuma D30 soft e base giratória.',
    material: `${MAD_MDF}; encosto espuma D23 soft+fibra+cinta, assento espuma D30 soft+fibra; base giratória`,
    dimensoes: '90x90CM',
    texto_livre: 'Poltrona giratória',
    pagina: 66,
  },
  {
    nome: 'POSITANO',
    descricao: 'Sofá com assento em espuma D29 e plumante com mola aspiral, pés em madeira.',
    material: `${MAD_MDF}; encosto espuma D23+plumante+fibra, assento espuma D29+plumante+mola; pés madeira`,
    dimensoes: '1Lugar-94x88CM | 2Lugares-150x94CM | 3Lugares-210x94CM',
    texto_livre: 'Sofá',
    pagina: 68,
  },
  {
    nome: 'Premium',
    descricao: 'Sofá modular com encosto de fibra siliconada e assento em espuma D26 soft com mola.',
    material: `${MAD_MDF}; encosto fibra siliconada+mola, assento espuma D26 soft+pillow+mola; pés madeira`,
    dimensoes: '1LugCBraço-110x100CM | 1LugSsBraço-90x100CM | Canto-100x100CM',
    texto_livre: 'Sofá modular',
    pagina: 70,
  },
  {
    nome: 'QATAR',
    descricao: 'Sofá reclinável com encosto de fibra siliconada e assento em espuma D26HR.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D26HR+D29+plumante; pés sapata plástica`,
    dimensoes: '1LugCBraço-108x105CM | 1LugSsBraço-88x105CM',
    texto_livre: 'Sofá reclinável',
    pagina: 72,
  },
  {
    nome: 'REC',
    descricao: 'Sofá com assento em espuma D23 e D26HR com plumante e mola zig zag, pés em madeira.',
    material: `${MAD_MDF}; encosto fibra siliconada, assento espuma D23+D26HR+plumante+mola; pés madeira`,
    dimensoes: '2Lugares-220x99CM | 1Lugar-100x99CM',
    texto_livre: 'Sofá',
    pagina: 74,
  },
  {
    nome: 'RECAMIER',
    descricao: 'Recamier estofado com assento em espuma D23 e D30 e pés em alumínio.',
    material: `${MAD_MDF}; assento espuma D23+D23 soft+D30+plumante; pés alumínio`,
    dimensoes: '180x60x40CM',
    texto_livre: 'Recamier',
    pagina: 76,
  },
  {
    nome: 'Renoir',
    descricao: 'Sofá com encosto de fibra siliconada e assento em espuma D26 soft de alta resiliência.',
    material: `${MAD_MDF}; encosto fibra+cinta, assento espuma D26 soft AR+fibra+mola zig zag; pés aço`,
    dimensoes: '2Lugares-160x92CM | 3Lugares-218x92CM',
    texto_livre: 'Sofá',
    pagina: 78,
  },
  {
    nome: 'Rubi',
    descricao: 'Sofá reclinável com assento em espuma D32 de alta resiliência e plumante.',
    material: `${MAD_MDF}; encosto espuma D23+plumante+fibra+cinta, assento espuma D32+plumante+mola; pés MDF`,
    dimensoes: '1LugCBraço-95x107CM | 1LugSsBraço-136x107CM',
    texto_livre: 'Sofá reclinável',
    pagina: 80,
  },
  {
    nome: 'SANTORINI',
    descricao: 'Sofá reclinável modular com puff integrado e espuma D29 com mola aspiral.',
    material: `${MAD_MDF}; encosto espuma D23+plumante+fibra, assento espuma D29+plumante+mola aspiral; pés madeira`,
    dimensoes: '1LugCBraço-122x165CM | 1LugSsBraço-100x165CM | Puff-60x165x84CM',
    texto_livre: 'Sofá reclinável modular',
    pagina: 82,
  },
  {
    nome: 'Seul',
    descricao: 'Sofá canto com chaise, encosto reclinável e assento em espuma D26HR.',
    material: `${MAD_MDF}; encosto espuma D25+cinta, assento espuma D26HR+plumante+mola espiral; pés MDF`,
    dimensoes: 'Chaise-100x132CM | Canto-100x100CM | 1LugCBraço-116x100CM | 1LugSsBraço-90x100CM',
    texto_livre: 'Sofá canto',
    pagina: 84,
  },
  {
    nome: 'Sintra',
    descricao: 'Sofá reclinável bipartido com assento em espuma D23 e D32 de alta resiliência.',
    material: `${MAD_MDF}; encosto espuma D23 soft+fibra+cinta, assento espuma D23+D32 soft+plumante; pés MDF`,
    dimensoes: '2LugCBraço-212x105CM | 1LugCBraço-91x105CM | 1LugSsBraço-94x105CM',
    texto_livre: 'Sofá reclinável',
    pagina: 86,
  },
  {
    nome: 'TRIP',
    descricao: 'Sofá reclinável com braços em espuma D26HR e plumante, pés em ferro e madeira.',
    material: `${MAD_MDF}; encosto espuma D23+cinta+fibra, assento espuma D29+plumante+mola; pés ferro+madeira`,
    dimensoes: '1LugCBraço-103x100CM | 1LugSsBraço-83x100CM | Aberto-156x100CM',
    texto_livre: 'Sofá reclinável',
    pagina: 88,
  },
  {
    nome: 'URBE',
    descricao: 'Sofá em múltiplos tamanhos com encosto de plumante e assento em espuma D26.',
    material: `${MAD_MDF}; encosto plumante+fibra, assento espuma D26+plumante+mola zig zag; pés aço`,
    dimensoes: '160x90CM | 200x90CM | 240x90CM | 280x90CM',
    texto_livre: 'Sofá',
    pagina: 90,
  },
  {
    nome: 'Wind',
    descricao: 'Poltrona reclinável com assento em espuma D26HR e D19 soft com plumante, pés em aço.',
    material: `${MAD_MDF}; encosto fibra+mola zig zag, assento espuma D26HR+D19 soft+plumante; pés aço`,
    dimensoes: 'Fechado-90x104CM | Aberto-90x165CM',
    texto_livre: 'Poltrona reclinável',
    pagina: 92,
  },
];

// ─── ARTECOURO CONCEPT 2026 — 36 produtos ────────────────────────────────────
const produtosConcept = [
  {
    nome: 'AIR',
    descricao: 'Sofá reclinável modular com design contemporâneo e alto nível de conforto.',
    material: `${MAD_MDF}; espumas de alta resiliência; acabamento premium`,
    dimensoes: null,
    texto_livre: 'Sofá reclinável modular',
    pagina: 2,
  },
  {
    nome: 'Aqua',
    descricao: 'Sofá com linhas fluidas e assento generoso de alto conforto.',
    material: `${MAD_MDF}; espumas de alta resiliência; pés madeira`,
    dimensoes: null,
    texto_livre: 'Sofá',
    pagina: 4,
  },
  {
    nome: 'ARRAIA Sofá',
    descricao: 'Sofá 3 lugares com design arrojado e assento profundo.',
    material: `${MAD_MDF}; espumas de alta resiliência; pés madeira`,
    dimensoes: '223x96x75CM',
    texto_livre: 'Sofá',
    pagina: 6,
  },
  {
    nome: 'ARRAIA Poltrona',
    descricao: 'Poltrona da linha ARRAIA com design arrojado e assento profundo.',
    material: `${MAD_MDF}; espumas de alta resiliência; pés madeira`,
    dimensoes: null,
    texto_livre: 'Poltrona',
    pagina: 8,
  },
  {
    nome: 'Bauhaus',
    descricao: 'Sofá modular inspirado no design Bauhaus com linhas retas e funcionais.',
    material: `${MAD_MDF}; espumas de alta resiliência; pés madeira`,
    dimensoes: null,
    texto_livre: 'Sofá modular',
    pagina: 10,
  },
  {
    nome: 'ELOAH',
    descricao: 'Poltrona com design feminino e assento envolvente de alto conforto.',
    material: `${MAD_MDF}; espumas de alta resiliência; pés madeira`,
    dimensoes: null,
    texto_livre: 'Poltrona',
    pagina: 12,
  },
  {
    nome: 'FONTANA',
    descricao: 'Sofá com assento amplo e encosto de alto conforto, design italiano.',
    material: `${MAD_MDF}; espumas de alta resiliência; pés aço`,
    dimensoes: null,
    texto_livre: 'Sofá',
    pagina: 14,
  },
  {
    nome: 'GENEROSA',
    descricao: 'Poltrona reclinável com assento generoso e sistema de reclinação suave.',
    material: `${MAD_MDF}; espumas de alta resiliência; pés madeira`,
    dimensoes: null,
    texto_livre: 'Poltrona reclinável',
    pagina: 16,
  },
  {
    nome: 'IRON',
    descricao: 'Sofá com estrutura robusta e linhas geométricas modernas.',
    material: `${MAD_MDF}; espumas de alta resiliência; pés ferro`,
    dimensoes: null,
    texto_livre: 'Sofá',
    pagina: 18,
  },
  {
    nome: 'Jade',
    descricao: 'Poltrona giratória com design elegante e base metálica.',
    material: `${MAD_MDF}; espumas de alta resiliência; base giratória`,
    dimensoes: null,
    texto_livre: 'Poltrona giratória',
    pagina: 20,
  },
  {
    nome: 'LIGHT',
    descricao: 'Sofá reclinável com encosto em espuma D25 soft e assento em tecnoforme.',
    material: `${MAD_MDF}; encosto espuma D25+D26+plumante+cinta, assento espuma D23+D26+D30+tecnoforme; pés ferro`,
    dimensoes: '1LugCBraço-113x104CM | 1LugSsBraço-85x104CM',
    texto_livre: 'Sofá reclinável',
    pagina: 22,
  },
  {
    nome: 'LINATE',
    descricao: 'Poltrona reclinável giratória com assento em espuma D35 e plumante.',
    material: `${MAD_MDF}; encosto hyper soft+tecnoforme, assento espuma D35+plumante+mola zig zag; base ferro`,
    dimensoes: 'Fechado-92x95x100CM | Aberto-92x155CM',
    texto_livre: 'Poltrona reclinável giratória',
    pagina: 24,
  },
  {
    nome: 'MARSALA',
    descricao: 'Sofá modular com encosto em espuma D23 soft e assento em mola aspiral.',
    material: `${MAD_MDF}; encosto espuma D23 soft+plumante, assento espuma D29+tecnoforme+cinta+mola; pés madeira`,
    dimensoes: '1LugCBraço-125x103CM | 1LugSsBraço-85x103CM | Terminal-140x103CM',
    texto_livre: 'Sofá modular',
    pagina: 26,
  },
  {
    nome: 'MIRA',
    descricao: 'Poltrona com puff opcional, encosto em espuma D25 soft e plumante.',
    material: `${MAD_MDF}; encosto espuma D25 soft+plumante, assento espuma D35+plumante+cinta; pés madeira`,
    dimensoes: 'Poltrona-92x99CM | Puff-60x60x40CM',
    texto_livre: 'Poltrona',
    pagina: 28,
  },
  {
    nome: 'Noah',
    descricao: 'Poltrona alta com puff opcional, encosto em espuma D23 soft e pés em aço.',
    material: `${MAD_MDF}; encosto espuma D23 soft+plumante, assento espuma D26HR+plumante+cinta; pés aço`,
    dimensoes: 'Poltrona-77x91CM | Puff-60x50x41CM',
    texto_livre: 'Poltrona',
    pagina: 30,
  },
  {
    nome: 'Nube',
    descricao: 'Poltrona com estrutura em madeira aparente e encosto em espuma D25 soft.',
    material: `${MAD_MDF}; encosto espuma D25 soft+plumante, assento espuma D26HR+plumante+cinta; pés madeira`,
    dimensoes: '77x78CM',
    texto_livre: 'Poltrona',
    pagina: 32,
  },
  {
    nome: 'OASIS',
    descricao: 'Poltrona giratória envolvente com assento em espuma D35 e plumante.',
    material: `${MAD_MDF}; encosto espuma D23+hypersoft+plumante, assento espuma D35+plumante+cinta; pés madeira`,
    dimensoes: '90x93CM',
    texto_livre: 'Poltrona',
    pagina: 34,
  },
  {
    nome: 'OCA',
    descricao: 'Poltrona giratória estilo bolha com assento em espuma D35 e pés em aço.',
    material: `${MAD_MDF}; encosto espuma D25 soft+plumante, assento espuma D35+plumante+cinta; pés aço`,
    dimensoes: '98x91x80CM',
    texto_livre: 'Poltrona giratória',
    pagina: 36,
  },
  {
    nome: 'PADOVA',
    descricao: 'Poltrona giratória com base disco em alumínio e encosto em espuma D26HR.',
    material: `${MAD_MDF}; encosto espuma D23+D25 soft+D26HR+plumante, assento espuma D26+D35+plumante; pés alumínio`,
    dimensoes: '82x90CM',
    texto_livre: 'Poltrona giratória',
    pagina: 38,
  },
  {
    nome: 'POTENZA',
    descricao: 'Sofá canto com chaise arredondada e assento em espuma D26HR e tecnoforme.',
    material: `${MAD_MDF}; encosto espuma D25 soft+D26HR+tecnoforme, assento espuma D26HR+tecnoforme+cinta; pés madeira`,
    dimensoes: '1LugSsBraço-106x102CM | 1LugCBraço-138x102CM | Chaise-138x172CM',
    texto_livre: 'Sofá canto',
    pagina: 40,
  },
  {
    nome: 'PUGLIA',
    descricao: 'Sofá com formato curvo e assento amplo em espuma D26HR e D35 com plumante.',
    material: `${MAD_MDF}; encosto espuma D2HR+plumante+fibra, assento espuma D26HR+D35+plumante+cinta; pés madeira`,
    dimensoes: '1LugCBraço-109x105x80CM | 2LugC1Braço-190x145x80CM',
    texto_livre: 'Sofá',
    pagina: 42,
  },
  {
    nome: 'Roche',
    descricao: 'Sofá modular com encosto de fibra siliconada com toque de pena de ganso.',
    material: `${MAD_MDF}; encosto fibra siliconada+pena de ganso, assento espuma D30 soft+cinta; pés alumínio`,
    dimensoes: '1Braço-160x100CM | 2Braços-205x100CM | Chaise-115x165CM | Puff-98x80CM',
    texto_livre: 'Sofá modular',
    pagina: 46,
  },
  {
    nome: 'SKY',
    descricao: 'Poltrona minimalista com pés em ferro preto e encosto em espuma D25 soft.',
    material: `${MAD_MDF}; encosto espuma D25 soft+plumante+cinta, assento espuma D23+D30+plumante; pés ferro`,
    dimensoes: '74x79x82CM',
    texto_livre: 'Poltrona',
    pagina: 48,
  },
  {
    nome: 'SPRING',
    descricao: 'Sofá reclinável com braços em madeira aparente e encosto em espuma D23 soft.',
    material: `${MAD_MDF}; encosto espuma D23 soft+plumante+tecnoforme, assento espuma D29+plumante+mola aspiral; pés madeira`,
    dimensoes: '1LugCBraço-109x169CM | 1LugSsBraço-100x169CM',
    texto_livre: 'Sofá reclinável',
    pagina: 50,
  },
  {
    nome: 'Sunny',
    descricao: 'Poltrona giratória com balanço, puff opcional e assento em espuma D29 soft.',
    material: `${MAD_MDF}; encosto espuma D25 soft+plumante, assento espuma D29 soft+plumante; pés MDF`,
    dimensoes: 'Poltrona-93x98x43CM | Puff-60x60x43CM',
    texto_livre: 'Poltrona giratória',
    pagina: 52,
  },
  {
    nome: 'Tali',
    descricao: 'Sofá modular com encosto deslizante em espuma D25 soft e pés em aço.',
    material: `${MAD_MDF}; encosto espuma D25 soft+plumante+cinta+mecanismo deslizante, assento espuma D30 soft+plumante; pés aço`,
    dimensoes: '1LugCBraço-104x112CM | Terminal-124x112CM | Canto-112x112CM',
    texto_livre: 'Sofá modular',
    pagina: 54,
  },
  {
    nome: 'TREVISO',
    descricao: 'Sofá reclinável com encosto em espuma D23 e D25 soft, pés em ferro.',
    material: `${MAD_MDF}; encosto espuma D23+D25 soft+plumante+cinta, assento espuma D23+D29+plumante; pés ferro`,
    dimensoes: '1LugCBraço-130x130CM | 1LugSsBraço-120x110CM',
    texto_livre: 'Sofá reclinável',
    pagina: 56,
  },
  {
    nome: 'TRIANON',
    descricao: 'Sofá 3 lugares com braços extensíveis em espuma D29 e pés em madeira.',
    material: `${MAD_MDF}; encosto espuma D25 soft+tecnoforme+cinta, assento espuma D29+plumante+cinta; pés madeira`,
    dimensoes: '3Lugares-222x102x84CM | Aberto-273x102CM',
    texto_livre: 'Sofá',
    pagina: 58,
  },
  {
    nome: 'Venturi',
    descricao: 'Sofá modular com encosto de fibra com toque de pena de ganso, pés em aço.',
    material: `${MAD_MDF}; encosto fibra siliconada+pena de ganso+plumante, assento espuma D30 soft+fibra+cinta; pés aço`,
    dimensoes: '1Braço-145x98CM | 2Braços-205x98CM | Chaise-115x165CM | Puff-80x98CM',
    texto_livre: 'Sofá modular',
    pagina: 60,
  },
  {
    nome: 'VERGARA',
    descricao: 'Sofá com encosto de plumante e assento em espuma D23 e D26HR com cinta.',
    material: `${MAD_MDF}; encosto plumante+cinta+fibra, assento espuma D23+D26HR+plumante+cinta; pés ferro`,
    dimensoes: '2Lugares-180x92CM | 3Lugares-240x92x86CM',
    texto_livre: 'Sofá',
    pagina: 62,
  },
  {
    nome: 'VERT',
    descricao: 'Poltrona giratória estilo lounge com assento em espuma D35 e tecnoforme.',
    material: `${MAD_MDF}; encosto espuma D25 soft+tecnoforme, assento espuma D35+tecnoforme+cinta; pés ferro`,
    dimensoes: '104x99x82CM',
    texto_livre: 'Poltrona giratória',
    pagina: 64,
  },
  {
    nome: 'Volpi',
    descricao: 'Poltrona giratória sem braços com assento em espuma D25 e D32 soft.',
    material: `${MAD_MDF}; encosto espuma D25 soft+plumante, assento espuma D25+D32 soft+plumante+cinta; pés aço`,
    dimensoes: '91x82CM',
    texto_livre: 'Poltrona giratória',
    pagina: 66,
  },
  {
    nome: 'WAVE',
    descricao: 'Sofá modular de formato curvo com assento em espuma D29 e mola aspiral.',
    material: `${MAD_MDF}; encosto espuma D25 soft+tecnoforme, assento espuma D29+plumante+mola aspiral; pés madeira`,
    dimensoes: '1LugCBraço-125x115CM | 1LugSsBraço-115x115CM',
    texto_livre: 'Sofá modular',
    pagina: 68,
  },
  {
    nome: 'WINTER',
    descricao: 'Poltrona reclinável elétrica com mola zig zag e assento em espuma D35.',
    material: `${MAD_MDF}; encosto mola zig zag+fibra, assento espuma D35+plumante+mola zig zag; pés ferro+mecanismo elétrico`,
    dimensoes: 'Fechado-99x102x107CM | Aberto-99x163CM',
    texto_livre: 'Poltrona reclinável',
    pagina: 70,
  },
  {
    nome: 'YVES',
    descricao: 'Sofá com chaise, assento em espuma D23 e D26HR com mola aspiral, pés em aço.',
    material: `${MAD_MDF}; encosto espuma D23+D25 soft+plumante, assento espuma D23+D26HR+plumante+mola aspiral; pés aço`,
    dimensoes: '2LugC1Braço-198x91CM | 1LugC1Braço-102x91CM | Chaise-105x161CM',
    texto_livre: 'Sofá',
    pagina: 72,
  },
  {
    nome: 'Zurique',
    descricao: 'Sofá canto com encostos de cabeça ajustáveis por catraca e pés em aço anti-ferrugem.',
    material: `${MAD_MDF}; encosto espuma D25 soft+tecnoform+D23+plumante, assento espuma D26+D28 soft+cinta; pés aço pintado`,
    dimensoes: '1Lugar-104x136CM | Chaise-120x171CM',
    texto_livre: 'Sofá canto',
    pagina: 74,
  },
];

// ─── Inserir tudo em uma transação ───────────────────────────────────────────
const insertAll = db.transaction(() => {
  let count2026 = 0;
  for (const p of produtos2026) {
    insert.run({ catalogo_id: catId2026, ...p });
    count2026++;
  }
  let countConcept = 0;
  for (const p of produtosConcept) {
    insert.run({ catalogo_id: catIdConcept, ...p });
    countConcept++;
  }
  console.log(`\n✓ Artecouro 2026: ${count2026} produtos inseridos`);
  console.log(`✓ Artecouro Concept 2026: ${countConcept} produtos inseridos`);
  console.log(`✓ Total: ${count2026 + countConcept} produtos`);
});

insertAll();

// Verificação rápida
const check2026 = db.prepare('SELECT COUNT(*) as n FROM produtos WHERE catalogo_id = ?').get(catId2026);
const checkConcept = db.prepare('SELECT COUNT(*) as n FROM produtos WHERE catalogo_id = ?').get(catIdConcept);
console.log(`\nVerificação — Artecouro 2026: ${check2026.n} | Concept: ${checkConcept.n}`);
