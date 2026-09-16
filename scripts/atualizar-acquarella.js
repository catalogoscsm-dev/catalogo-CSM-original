const Database = require("better-sqlite3");
const db = new Database("database/catalogo.db");

const cat = db.prepare("SELECT id FROM catalogos WHERE nome LIKE ?").get("%ACQUARELLA%");
if (!cat) { console.error("Catálogo ACQUARELLA não encontrado"); process.exit(1); }

const MATERIAL = "Estrutura interna em lyptus (eucalipto reflorestado), pés em madeira Tauarí ou alumínio";
const ACABAMENTO = "Bouclé, Chenille, Couríssimo, Jacquard, Linho, Rústicos em algodão, Veludos";

// categoria, descrição e dimensão por produto
const dados = [
  // pag, categoria, descrição, dimensão
  [2,   "Sofá",     "Sofá modular configurável com composições flexíveis para diferentes ambientes.", ""],
  [4,   "Sofá",     "Sofá modular de design contemporâneo com módulos que se adaptam ao espaço.", ""],
  [6,   "Sofá",     "Sofá modular versátil com acabamento refinado e ampla variedade de revestimentos.", ""],
  [8,   "Sofá",     "Sofá da linha ACQUA com estrutura robusta em lyptus e assento de alta densidade.", ""],
  [10,  "Poltrona", "Poltrona complementar da linha ACQUA 04 com assento acolchoado e design equilibrado.", ""],
  [12,  "Sofá",     "Sofá ACQUA de linhas elegantes com almofadas soltas e ampla gama de revestimentos.", ""],
  [14,  "Sofá",     "Sofá ACQUA Master com versão especial de maior porte, ideal para salas amplas.", ""],
  [16,  "Sofá",     "Sofá ACQUA com encosto fixo revestido com detalhes de costuras e frisos elásticos.", ""],
  [18,  "Sofá",     "Sofá ACQUA de perfil moderno com almofadas de encosto soltas e assento fixo confortável.", ""],
  [20,  "Sofá",     "Sofá ACQUA CP com módulo de canto integrado para composições em L.", ""],
  [22,  "Sofá",     "Sofá ACQUA com design limpo e almofadas decorativas intercambiáveis.", ""],
  [24,  "Sofá",     "Sofá ACQUA com acabamento premium e opções de pés em diferentes tonalidades.", ""],
  [26,  "Sofá",     "Sofá ACQUA de linhas contemporâneas com estrutura firme e revestimento variado.", ""],
  [28,  "Sofá",     "Sofá ACQUA 20 NEWS com renovação de design e conforto ampliado.", ""],
  [30,  "Poltrona", "Poltrona da linha ACQUA 20 NEWS com design atualizado e assento generoso.", ""],
  [32,  "Sofá",     "Sofá ACQUA com proporções equilibradas e opções modulares para personalização.", ""],
  [34,  "Sofá",     "Sofá ACQUA 25 NEWS com releitura moderna de linhas clássicas da marca.", ""],
  [36,  "Sofá",     "Sofá ACQUA com encosto de almofadas soltas para maior conforto e informalidade.", ""],
  [38,  "Sofá",     "Sofá ACQUA de grande porte com estrutura em lyptus e cintas elásticas de alta durabilidade.", ""],
  [40,  "Sofá",     "Sofá ACQUA na versão de 1 lugar, ideal para compor com outros módulos da linha.", ""],
  [42,  "Sofá",     "Sofá ACQUA de 1 lugar com design versátil e acabamento idêntico às versões maiores.", ""],
  [44,  "Sofá",     "Sofá ACQUA 39 com design contemporâneo e almofadas decorativas em formato generoso.", ""],
  [47,  "Sofá",     "Sofá ACQUA com estrutura modular e revestimento em Bouclé, veludo ou couro sintético.", ""],
  [49,  "Sofá",     "Sofá ACQUA de perfil sofisticado com costura aparente e pés em madeira envernizada.", ""],
  [51,  "Sofá",     "Sofá ACQUA com assento de molas Nosag para maior homogeneidade de sustentação.", ""],
  [53,  "Sofá",     "Sofá ACQUA 150 de grande porte com almofadas de encosto soltas e assento firme.", ""],
  [55,  "Sofá",     "Sofá ACQUA 190 com composição ampla e almofadas decorativas em acabamento de veludo ou couro.", ""],
  [57,  "Sofá",     "Sofá ACQUA 190 com pés em aço carbono para estética contemporânea e industrial.", ""],
  [59,  "Poltrona", "Poltrona ACQUA 190 complementar ao sofá da linha, com assento fundo e encosto alto.", ""],
  [59,  "Puff",     "Puff ACQUA 270 para composição com a poltrona da linha 190, em revestimento variado.", ""],
  [61,  "Sofá",     "Sofá ACQUA 900 NEWS com renovação completa de design e conforto ampliado.", ""],
  [63,  "Recamier", "Recamier LÓTUS com linhas fluidas e perfil baixo, ideal para espaços de leitura e relaxamento.", ""],
  [64,  "Sofá",     "Sofá LÓTUS com design orgânico e almofadas de encosto soltas em revestimento premium.", ""],
  [66,  "Chaise",   "Chaise longue com assento comprido e apoio lateral para máximo relaxamento.", ""],
  [68,  "Chaise",   "Chaise longue ACQUA 03 com design clássico e estrutura em lyptus de alta durabilidade.", ""],
  [69,  "Chaise",   "Chaise longue ACQUA 04 com perfil elegante e opções de revestimento em veludo ou couro.", ""],
  [71,  "Chaise",   "Chaise longue NEWS com renovação de linha e maior profundidade de assento.", ""],
  [72,  "Recamier", "Recamier NEWS com design atualizado e encosto inclinado para posicionamento confortável.", ""],
  [74,  "Recamier", "Recamier SLIM de perfil compacto e linhas retas, ideal para ambientes menores.", ""],
  [75,  "Puff",     "Puff SLIM para composição com o Recamier da linha, em revestimento variado.", ""],
  [77,  "Recamier", "Recamier SOFT com acabamento acolchoado extra e design contemporâneo.", ""],
  [78,  "Puff",     "Puff SOFT para composição com o Recamier da linha, com acolchoamento generoso.", ""],
  [80,  "Recamier", "Recamier PLUS de maior porte com assento profundo e encosto amplo.", ""],
  [82,  "Poltrona", "Poltrona ACQUA 280 com encosto em formato de concha e assento com pluma siliconada.", ""],
  [84,  "Poltrona", "Poltrona ACQUA 290 com design contemporâneo e pés em madeira Tauarí envernizada.", ""],
  [86,  "Poltrona", "Poltrona ACQUA 310 de maior porte com assento generoso e acabamento premium.", ""],
  [88,  "Poltrona", "Poltrona ACQUAPOLT 150 com estrutura compacta e revestimento em múltiplas tendências.", ""],
  [90,  "Puff",     "Puff ACQUA 260 de assento firme para composição com sofás e poltronas da linha.", ""],
  [92,  "Puff",     "Puff ACQUA 210 em formato quadrado com estrutura em lyptus e revestimento variado.", ""],
  [94,  "Puff",     "Puff ACQUA 270 de maior porte com assento de espuma de alta densidade.", ""],
  // produtos com texto extraível — dimensões reais
  [96,  "Sofá",     "Sofá ACQUA Slim 09 com encosto fixo, frisos elásticos e pés em madeira Tauarí em 4 tonalidades.", "240 x 80 x 85 cm"],
  [98,  "Sofá",     "Sofá ACQUA 40 com módulos unidos por mecanismo de metal e almofadas de encosto soltas.", "218 x 90 x 87 cm"],
  [100, "Poltrona", "Poltrona ACQUAPOLT 320 com base giratória em madeira maciça Tauarí e encosto em concha.", "90 x 90 x 88 cm"],
  [102, "Sofá",     "Sofá ACQUA 16 com braços em fibra de palhinha e almofadas de encosto soltas com pluma siliconada.", "190 x 92 x 86 cm"],
  [104, "Poltrona", "Poltrona ACQUAPOLT 16 com braços em fibra de palhinha, complementar ao sofá da linha 16.", "90 x 92 x 86 cm"],
  [106, "Sofá",     "Sofá ACQUA 22 com módulos orgânicos combináveis e pés reguladores discretos sob a base.", "176 x 130 x 85 cm"],
  [108, "Sofá",     "Sofá ACQUA 23 com módulos orgânicos e almofada circular decorativa de destaque.", "190 x 105 x 85 cm"],
  [110, "Poltrona", "Poltrona ACQUAPOLT 330 com detalhe de argola metálica e cinto atrás, disponível em dourado, prata ou preto.", "80 x 90 x 80 cm"],
];

// descricao = categoria (badge), texto_livre = descrição de 1 frase, material = estrutura, acabamento = revestimentos
const upsert = db.prepare(`
  UPDATE produtos
  SET descricao = ?, texto_livre = ?, material = ?, acabamento = ?, dimensoes = ?
  WHERE catalogo_id = ? AND pagina = ?
`);

// Para a pag 59 temos dois produtos — atualizar por nome
const upsertNome = db.prepare(`
  UPDATE produtos
  SET descricao = ?, texto_livre = ?, material = ?, acabamento = ?, dimensoes = ?
  WHERE catalogo_id = ? AND pagina = ? AND nome LIKE ?
`);

let ok = 0;
for (const [pag, cat2, desc, dim] of dados) {
  let r;
  if (pag === 59) {
    const nomeMatch = cat2 === "Poltrona" ? "%POLTRONA%" : "%PUFF%";
    r = upsertNome.run(cat2, desc, MATERIAL, ACABAMENTO, dim, cat.id, pag, nomeMatch);
  } else {
    r = upsert.run(cat2, desc, MATERIAL, ACABAMENTO, dim, cat.id, pag);
  }
  if (r.changes > 0) ok++;
  else console.warn("  Sem match: pag", pag, "|", cat2);
}

console.log(`Atualizado: ${ok}/${dados.length} produtos`);
db.close();
