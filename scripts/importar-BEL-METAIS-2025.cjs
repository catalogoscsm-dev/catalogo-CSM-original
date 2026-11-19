'use strict';
/**
 * Importa BEL METAIS 2025 — páginas listadas em `produtos`.
 * Imagens vão para imagens-src/imagens/<CATALOGO>/ (export-data.js converte para WebP).
 * Uso: node scripts/importar-BEL-METAIS-2025.cjs [--dry-run]
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { BASE_CATALOGOS } = require('./config.cjs');

const DRY = process.argv.includes('--dry-run');
const CATALOGO_NOME = 'BEL METAIS 2025';
const SRC_DIR = path.join(BASE_CATALOGOS, CATALOGO_NOME, 'imagens dos produtos');
const DST_DIR = path.join(__dirname, '..', 'imagens-src', 'imagens', CATALOGO_NOME);
const db = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'));

const SKIP = new Set(['full.png', 'full.jpg', 'full2.png', 'full3.png', 'ficha tecn.png', 'ficha tecn.jpg']);

const produtos = [
    {
        pasta: 'pag 06', pagina: 6,
        nome: 'ELAN',
        categoria: 'Aparadores',
        texto_livre: 'Aparador',
        material: 'Estrutura metálica dourada; tampo e painéis com acabamento pétreo',
        dimensoes: '160x50x80CM | 180x50x80CM | 200x55x80CM | 220x60x80CM',
        acabamento: null,
        descricao: 'Aparador com pés em arcos metálicos dourados e painéis pétreos. Disponível em 4 comprimentos.',
    },
];

const sanitize = s => s.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
const cat = db.prepare('SELECT id FROM catalogos WHERE nome = ?').get(CATALOGO_NOME);
if (!cat) throw new Error('Catálogo não encontrado: ' + CATALOGO_NOME);
if (!DRY) fs.mkdirSync(DST_DIR, { recursive: true });

const ids = [];
for (const p of produtos) {
    const dir = path.join(SRC_DIR, p.pasta);
    if (!fs.existsSync(dir)) { console.warn('[skip] sem pasta', p.pasta); continue; }

    const files = fs.readdirSync(dir)
        .filter(f => !SKIP.has(f.toLowerCase()) && /\.(png|jpe?g|webp)$/i.test(f))
        .sort((a, b) => (a.toLowerCase().startsWith('capa') ? 0 : 1) - (b.toLowerCase().startsWith('capa') ? 0 : 1) || a.localeCompare(b));

    const suf = p.pasta.replace(/^pag\s*0*/, '');
    const urls = files.map(f => {
        const slug = sanitize(`${CATALOGO_NOME}_pag${suf}_${f}`);
        if (!DRY) fs.copyFileSync(path.join(dir, f), path.join(DST_DIR, slug));
        console.log('   →', slug);
        return `/imagens/${encodeURIComponent(CATALOGO_NOME)}/${encodeURIComponent(slug)}`;
    });

    const ex = db.prepare('SELECT id FROM produtos WHERE catalogo_id = ? AND pagina = ? AND nome = ?').get(cat.id, p.pagina, p.nome);
    const vals = [p.nome, p.categoria, p.texto_livre, p.material, p.dimensoes, p.acabamento, p.descricao, JSON.stringify(urls)];
    let id;
    if (DRY) { id = ex ? ex.id : '(novo)'; }
    else if (ex) {
        db.prepare('UPDATE produtos SET nome=?, categoria=?, texto_livre=?, material=?, dimensoes=?, acabamento=?, descricao=?, imagens=? WHERE id=?').run(...vals, ex.id);
        id = ex.id;
    } else {
        id = db.prepare('INSERT INTO produtos (nome, categoria, texto_livre, material, dimensoes, acabamento, descricao, imagens, catalogo_id, pagina) VALUES (?,?,?,?,?,?,?,?,?,?)')
            .run(...vals, cat.id, p.pagina).lastInsertRowid;
    }
    ids.push(id);
    console.log(`${ex ? '↻' : '✓'} ${p.nome} (id ${id}) — ${urls.length} imagem(ns)`);
}
console.log('IDS:', ids.join(' '));
