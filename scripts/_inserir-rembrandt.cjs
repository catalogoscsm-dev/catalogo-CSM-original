const db = require('better-sqlite3')('database/catalogo.db');

const produto = {
  catalogo_id: 101,
  nome: 'Rembrandt',
  pagina: 44,
  texto_livre: 'Sofá',
  material: 'Encosto: espuma D23 soft c/ mola zig zag; Assento: espuma D32 soft + tecnoform + cinta elástica; Estrutura: madeira eucalipto + chapa MDF; Pés: aço',
  dimensoes: '135x90CM | 235x90CM | 270x90CM | 300x90CM',
  descricao: 'Sofá Chesterfield com capitonê e base em aço.',
};

const stmt = db.prepare(`
  INSERT INTO produtos (catalogo_id, nome, pagina, texto_livre, material, dimensoes, descricao)
  VALUES (@catalogo_id, @nome, @pagina, @texto_livre, @material, @dimensoes, @descricao)
`);

const info = stmt.run(produto);
console.log('Inserido Rembrandt com ID:', info.lastInsertRowid);
