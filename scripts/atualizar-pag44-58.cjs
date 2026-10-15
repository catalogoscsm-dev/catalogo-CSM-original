const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, '../database/catalogo.db'))

const updates = [
  {
    id: 5495,
    nome: 'Ibiza',
    descricao: 'Sofá retrátil elétrico bipartido com acionamento touch e pés em aço.',
    material: 'Enc.: Espuma D30 soft c/ fibra siliconada | Ass.: Espuma D30 soft c/ fibra siliconada, acionamento elétrico touch | Est.: Madeira eucalipto e MDF | Braços: Espuma D26 dura | Pés: Aço',
    dimensoes: '103x104CM | 153x104CM | 83x103CM | 105x103CM',
    texto_livre: 'Sofá Retrátil Elétrico',
    pagina: 44,
  },
  {
    id: 5496,
    nome: 'LOMA',
    descricao: 'Sofá modular com assento em tecnoforme e mola zig zag e pés em madeira.',
    material: 'Enc.: Espuma D23, cinta elástica e fibra siliconada | Ass.: Espuma D29, tecnoforme e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D26H, plumante | Pés: Madeira',
    dimensoes: '106x101CM | 83x101CM | 160x101CM',
    texto_livre: 'Sofá',
    pagina: 46,
  },
  {
    id: 5497,
    nome: 'Madri',
    descricao: 'Sofá retrátil bipartido com encosto de almofadas e haste flexível em 4 estágios.',
    material: 'Enc.: Almofadas de fibra siliconada, cinta elástica e haste flexível 4 estágios | Ass.: Espuma D26 soft c/ fibra poliéster, cinta elástica e mola espiral, assentos retráteis | Est.: Madeira eucalipto e MDF | Braços: Espuma D26 dura | Pés: Madeira',
    dimensoes: '100x129CM | 176x129CM | 110x129CM | 129x096CM',
    texto_livre: 'Sofá Retrátil',
    pagina: 48,
  },
  {
    id: 5498,
    nome: 'Madson',
    descricao: 'Poltrona vintage com pés em madeira e rodízios.',
    material: 'Enc.: Espuma D26 soft, molas zig zag | Ass.: Espuma D26 soft c/ fibra poliéster | Est.: Madeira eucalipto e MDF | Braços: Espuma D26 | Pés: Madeira e rodízios',
    dimensoes: '90x80CM | 78x90CM',
    texto_livre: 'Poltrona',
    pagina: 50,
  },
  {
    id: 5499,
    nome: 'Messina',
    descricao: 'Sofá modular com encosto de almofadas de fibra siliconada e pés em madeira.',
    material: 'Enc.: Almofadas de fibra siliconada, cinta elástica | Ass.: Espuma D26 soft c/ fibra poliéster, cinta elástica | Est.: Madeira eucalipto e MDF | Braços: Fibra siliconada | Pés: Madeira',
    dimensoes: '89x93CM | 110x93CM | 95x93CM | 160x93CM | 106x90CM | 135x93CM | 215x93CM | 180x93CM | 120x93CM',
    texto_livre: 'Sofá',
    pagina: 52,
  },
  {
    id: 5500,
    nome: 'MINORI',
    descricao: 'Poltrona retrátil com assento em mola zig zag e plumante e pés em ferro.',
    material: 'Enc.: Espuma D23, cinta elástica e fibra siliconada | Ass.: Espuma D23 soft e D35, plumante e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D23, D26 HR | Pés: Ferro',
    dimensoes: '102x100CM | 161x103CM',
    texto_livre: 'Poltrona Retrátil',
    pagina: 54,
  },
  {
    id: 5501,
    nome: 'MOOD',
    descricao: 'Poltrona retrátil giratória com assento em tecnoforme e pés em ferro.',
    material: 'Enc.: Espuma D23, cinta elástica e fibra siliconada | Ass.: Espuma D26 HR, D29, tecnoforme e mola zig zag | Est.: Madeira eucalipto e MDF | Braços: Espuma D23 soft, D26 e tecnoforme | Pés: Ferro',
    dimensoes: '76x100CM | 153x102CM',
    texto_livre: 'Poltrona Retrátil',
    pagina: 56,
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

// Inserir Munique (pag 58) — novo produto
const insertStmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, nome, descricao, material, dimensoes, texto_livre, pagina, imagens, criado_em)
  VALUES (96, 'Munique', 'Poltrona clássica estilo Chesterfield com botões e revestimento em couro marrom.', 'Enc.: Espuma D26 soft, molas zig zag | Ass.: Espuma D26 soft, cinta elástica | Est.: Madeira eucalipto e MDF | Pés: Madeira', '82x71CM | 100x82CM', 'Poltrona', 58, '[]', datetime('now'))
`)

const insInfo = insertStmt.run()
console.log(`✅ Munique inserido com ID ${insInfo.lastInsertRowid}`)

db.close()
console.log('\nConcluído.')
