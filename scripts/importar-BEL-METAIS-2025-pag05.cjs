'use strict';
/**
 * Importa BEL METAIS 2025 — pag 05 (DUBAI)
 * Cria o catálogo no banco se não existir, insere o produto e copia imagens.
 */

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const { BASE_CATALOGOS } = require('./config.cjs');

const CATALOGO_NOME = 'BEL METAIS 2025';
const CATALOGO_PASTA = 'BEL METAIS 2025';

const SRC_DIR   = path.join(BASE_CATALOGOS, 'BEL METAIS 2025', 'imagens dos produtos');
const DB_PATH   = path.join(__dirname, '..', 'database', 'catalogo.db');
const db        = new Database(DB_PATH);

const SKIP_FILES = new Set(['full.png','full.jpg','full2.png','full3.png','ficha tecn.png','ficha tecn.jpg']);

function sanitize(name) {
    return name.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
}

// ── 1. Garante que o catálogo existe ─────────────────────────────────────────
let cat = db.prepare('SELECT id FROM catalogos WHERE nome = ?').get(CATALOGO_NOME);
if (!cat) {
    const r = db.prepare('INSERT INTO catalogos (nome, pasta, ano) VALUES (?,?,?)').run(CATALOGO_NOME, CATALOGO_PASTA, 2025);
    cat = { id: r.lastInsertRowid };
    console.log(`✓ Catálogo criado: ${CATALOGO_NOME} (id ${cat.id})`);
} else {
    console.log(`▶ Catálogo já existe: ${CATALOGO_NOME} (id ${cat.id})`);
}

// ── 2. Produtos a importar ────────────────────────────────────────────────────
const produtos = [
    {
        pagina:    5,
        nome:      'DUBAI',
        categoria: 'Aparadores',
        material:  'Madeira / Inox',
        dimensoes: '1,20m-L120xA80xP40CM|1,40m-L140xA80xP40CM|1,60m-L160xA80xP50CM|1,80m-L180xA80xP50CM',
        acabamento:'Natural (madeira + inox polido) / Preto + inox dourado',
        descricao: 'Aparador de madeira com estrutura em inox. Disponível em 4 comprimentos e dois acabamentos.',
    },
];

// ── 3. Insere ou actualiza cada produto ──────────────────────────────────────
const publicBase = path.join(__dirname, '..', 'public', 'imagens', CATALOGO_NOME);
fs.mkdirSync(publicBase, { recursive: true });

for (const prod of produtos) {
    const pagDir = path.join(SRC_DIR, `pag ${String(prod.pagina).padStart(2, '0')}`);
    if (!fs.existsSync(pagDir)) {
        console.warn(`  [skip] pag ${prod.pagina} — pasta não encontrada: ${pagDir}`);
        continue;
    }

    // Verifica se produto já existe
    let existing = db.prepare('SELECT id FROM produtos WHERE catalogo_id = ? AND pagina = ?').get(cat.id, prod.pagina);
    let prodId;
    if (!existing) {
        const r = db.prepare(`
            INSERT INTO produtos (catalogo_id, nome, categoria, material, dimensoes, acabamento, descricao, pagina, imagens)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, '[]')
        `).run(cat.id, prod.nome, prod.categoria, prod.material, prod.dimensoes, prod.acabamento, prod.descricao, prod.pagina);
        prodId = r.lastInsertRowid;
        console.log(`  ✓ Produto inserido: ${prod.nome} (id ${prodId})`);
    } else {
        prodId = existing.id;
        db.prepare(`
            UPDATE produtos SET nome=?, categoria=?, material=?, dimensoes=?, acabamento=?, descricao=? WHERE id=?
        `).run(prod.nome, prod.categoria, prod.material, prod.dimensoes, prod.acabamento, prod.descricao, prodId);
        console.log(`  ↻ Produto atualizado: ${prod.nome} (id ${prodId})`);
    }

    // Copia imagens
    const files = fs.readdirSync(pagDir)
        .filter(f => !SKIP_FILES.has(f.toLowerCase()) && /\.(png|jpg|jpeg|webp)$/i.test(f))
        .sort((a, b) => {
            const ca = a.toLowerCase() === 'capa.png' ? 0 : 1;
            const cb = b.toLowerCase() === 'capa.png' ? 0 : 1;
            return ca - cb || a.localeCompare(b);
        });

    const urls = [];
    for (const file of files) {
        const slug    = sanitize(`${CATALOGO_NOME}_pag${prod.pagina}_${file}`);
        const srcPath = path.join(pagDir, file);
        const dstPath = path.join(publicBase, slug);
        fs.copyFileSync(srcPath, dstPath);
        console.log(`    → ${slug}`);
        urls.push(`/imagens/${encodeURIComponent(CATALOGO_NOME)}/${encodeURIComponent(slug)}`);
    }

    db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(urls), prodId);
    console.log(`    imagens: ${urls.length} arquivo(s)`);
}

console.log('\n✓ Importação concluída.');
