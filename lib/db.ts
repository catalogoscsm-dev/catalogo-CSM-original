import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'database', 'catalogo.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
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
    CREATE INDEX IF NOT EXISTS idx_favoritos_produto ON favoritos(produto_id);
  `)
}
