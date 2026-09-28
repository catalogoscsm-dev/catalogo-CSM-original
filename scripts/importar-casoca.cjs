/**
 * importar-casoca.cjs
 * Lê o JSON gerado pelo scraper-casoca.cjs e enriquece o banco de dados.
 *
 * Para cada produto do Casoca:
 *   1. Tenta fazer match com produtos existentes no catálogo do banco (por nome)
 *   2. Se encontrado: atualiza material, dimensoes, acabamento, descricao
 *   3. Se não encontrado: cria novo produto no catálogo
 *   4. Baixa a imagem do Casoca e salva em public/imagens/
 *
 * Uso:
 *   node scripts/importar-casoca.cjs <slug-da-marca> "<Nome do Catálogo no Banco>"
 *
 * Exemplos:
 *   node scripts/importar-casoca.cjs iummi "IUMMI 2025"
 *   node scripts/importar-casoca.cjs sier-moveis "SIER 2025"
 *   node scripts/importar-casoca.cjs madelustre "MADELUSTRE 2025"
 *
 * Flags:
 *   --dry-run   Simula sem gravar nada no banco
 *   --force     Sobrescreve dados mesmo que o produto já tenha material/dimensoes
 */

'use strict'

const fs   = require('fs')
const path = require('path')
const Database = require('better-sqlite3')

const DB_PATH  = path.join(__dirname, '..', 'database', 'catalogo.db')
const OUT_DIR  = __dirname
const PUB_BASE = path.join(__dirname, '..', 'public', 'imagens')

const DRY_RUN   = process.argv.includes('--dry-run')
const FORCE     = process.argv.includes('--force')
// --insert-only: ignora o match e insere todos como novos produtos
const INSERT_ONLY = process.argv.includes('--insert-only')

// ─── helpers ─────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms))

/** Remove acentos e normaliza para comparação de strings */
function norm(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calcula similaridade entre duas strings (0.0 a 1.0).
 * Usa proporção de bigramas compartilhados (coeficiente de Dice).
 */
function similaridade(a, b) {
  const na = norm(a), nb = norm(b)
  if (na === nb) return 1.0
  if (!na || !nb) return 0.0

  const bigramas = s => {
    const bg = new Set()
    for (let i = 0; i < s.length - 1; i++) bg.add(s[i] + s[i+1])
    return bg
  }
  const bgA = bigramas(na)
  const bgB = bigramas(nb)
  let inter = 0
  bgA.forEach(bg => { if (bgB.has(bg)) inter++ })
  return (2 * inter) / (bgA.size + bgB.size)
}

/** Encontra o melhor match no array de produtos do banco */
function melhorMatch(nomeCasoca, produtosBanco, limiar = 0.45) {
  let melhor = null, melhorScore = 0

  // Remove sufixos de tamanho do nome Casoca (ex: "Mesa Lateral Kit" ← sem "Sier")
  const nomeBase = norm(nomeCasoca)

  for (const prod of produtosBanco) {
    const s = similaridade(nomeBase, norm(prod.nome))
    if (s > melhorScore) {
      melhorScore = s
      melhor = prod
    }
  }

  return melhorScore >= limiar ? { prod: melhor, score: melhorScore } : null
}

/** Baixa uma imagem e salva em disk, retorna o path público */
async function baixarImagem(url, destDir, filename) {
  fs.mkdirSync(destDir, { recursive: true })
  const destPath = path.join(destDir, filename)
  if (fs.existsSync(destPath)) return destPath  // já existe

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(destPath, buf)
    return destPath
  } catch (err) {
    console.warn(`    ⚠ Imagem não baixada: ${err.message}`)
    return null
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const brandSlug  = process.argv[2]
  const catalogNome = process.argv[3]

  if (!brandSlug || !catalogNome) {
    console.error('Uso: node scripts/importar-casoca.cjs <slug> "<Nome do Catálogo>"')
    console.error('Ex:  node scripts/importar-casoca.cjs iummi "IUMMI 2025"')
    process.exit(1)
  }

  const jsonFile = path.join(OUT_DIR, `casoca-${brandSlug}.json`)
  if (!fs.existsSync(jsonFile)) {
    console.error(`Arquivo não encontrado: ${jsonFile}`)
    console.error(`Rode primeiro: node scripts/scraper-casoca.cjs ${brandSlug}`)
    process.exit(1)
  }

  const casocaProdutos = JSON.parse(fs.readFileSync(jsonFile, 'utf8'))
    .filter(p => !p.erro && p.nome)
  console.log(`\n📦 ${casocaProdutos.length} produtos Casoca lidos de ${path.basename(jsonFile)}`)
  if (DRY_RUN)     console.log('   ⚠ MODO DRY-RUN — nenhuma alteração será gravada')
  if (INSERT_ONLY) console.log('   ⚠ MODO INSERT-ONLY — todos os produtos serão inseridos como novos\n')

  // Abre banco
  const db = new Database(DB_PATH)

  // Encontra o catálogo
  const catalogo = db.prepare('SELECT id, nome FROM catalogos WHERE nome = ?').get(catalogNome)
  if (!catalogo) {
    const disponiveis = db.prepare('SELECT nome FROM catalogos ORDER BY nome').all().map(r => r.nome)
    console.error(`Catálogo não encontrado: "${catalogNome}"`)
    console.error('Disponíveis:', disponiveis.join(', '))
    db.close()
    process.exit(1)
  }
  console.log(`🗄  Catálogo: "${catalogo.nome}" (id=${catalogo.id})`)

  // Busca todos os produtos do catálogo
  const produtosBanco = db.prepare(
    'SELECT id, nome, material, dimensoes, acabamento, descricao, imagens FROM produtos WHERE catalogo_id = ?'
  ).all(catalogo.id)
  console.log(`   ${produtosBanco.length} produtos existentes no banco\n`)

  // Prepara pasta de imagens para este catálogo
  const imgDir    = path.join(PUB_BASE, catalogNome)
  const imgPrefix = `/imagens/${encodeURIComponent(catalogNome)}`

  // Statements de banco
  const stmtUpdate = db.prepare(`
    UPDATE produtos SET
      material   = COALESCE(CASE WHEN ? IS NOT NULL AND (material IS NULL OR material = '' OR ?) THEN ? ELSE material END, material),
      dimensoes  = COALESCE(CASE WHEN ? IS NOT NULL AND (dimensoes IS NULL OR dimensoes = '' OR ?) THEN ? ELSE dimensoes END, dimensoes),
      acabamento = COALESCE(CASE WHEN ? IS NOT NULL AND (acabamento IS NULL OR acabamento = '' OR ?) THEN ? ELSE acabamento END, acabamento),
      descricao  = COALESCE(CASE WHEN ? IS NOT NULL AND (descricao IS NULL OR descricao = '' OR ?) THEN ? ELSE descricao END, descricao),
      imagens    = ?
    WHERE id = ?
  `)

  const stmtInsert = db.prepare(`
    INSERT INTO produtos (catalogo_id, nome, material, dimensoes, acabamento, descricao, texto_livre, imagens, criado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `)

  // Relatório
  const relatorio = { atualizados: [], criados: [], sem_match: [], sem_imagem: [] }

  // Processa cada produto Casoca
  for (let i = 0; i < casocaProdutos.length; i++) {
    const cp = casocaProdutos[i]
    process.stdout.write(`[${i+1}/${casocaProdutos.length}] ${cp.nome}`.padEnd(70) + '\r')

    // Baixa imagem (ignorado em dry-run)
    let imagemUrl = null
    if (cp.imagem_url && !DRY_RUN) {
      await sleep(300)
      const ext      = cp.imagem_url.split('.').pop().split('?')[0] || 'jpg'
      const filename = `casoca-${cp.slug}.${ext}`
      const destPath = await baixarImagem(cp.imagem_url, imgDir, filename)
      if (destPath) imagemUrl = `${imgPrefix}/${encodeURIComponent(filename)}`
      else relatorio.sem_imagem.push(cp.nome)
    } else if (cp.imagem_url && DRY_RUN) {
      imagemUrl = cp.imagem_url  // no dry-run apenas registra a URL original
    }

    // Tenta fazer match com produto existente (exceto em modo --insert-only)
    const match = INSERT_ONLY ? null : melhorMatch(cp.nome, produtosBanco)

    if (match) {
      const prod   = match.prod
      const f      = FORCE ? 1 : 0
      const imagens = imagemUrl
        ? JSON.stringify(
            [...(JSON.parse(prod.imagens || '[]')).filter(u => !u.includes('casoca-')), imagemUrl]
          )
        : prod.imagens

      if (!DRY_RUN) {
        stmtUpdate.run(
          cp.material,   f, cp.material,
          cp.dimensoes,  f, cp.dimensoes,
          cp.acabamento, f, cp.acabamento,
          cp.nome && cp.nome !== prod.nome ? cp.nome : null, f, cp.nome,
          imagens,
          prod.id
        )
      }
      relatorio.atualizados.push({
        casoca: cp.nome,
        banco: prod.nome,
        score: match.score.toFixed(2),
        campos: [cp.material && 'material', cp.dimensoes && 'dimensoes', cp.acabamento && 'acabamento', imagemUrl && 'imagem'].filter(Boolean)
      })
    } else {
      // Cria novo produto
      const imagens = imagemUrl ? JSON.stringify([imagemUrl]) : null
      if (!DRY_RUN) {
        stmtInsert.run(
          catalogo.id, cp.nome,
          cp.material, cp.dimensoes, cp.acabamento,
          cp.nome,           // descricao = nome por ora
          cp.categoria,      // categoria guardada em texto_livre
          imagens
        )
      }
      relatorio.criados.push({ casoca: cp.nome, categoria: cp.categoria })
    }
  }

  db.close()

  // ─── Relatório final ─────────────────────────────────────────────────────

  console.log('\n\n' + '═'.repeat(60))
  console.log('📊 RELATÓRIO FINAL')
  console.log('═'.repeat(60))
  console.log(`✅ Produtos atualizados : ${relatorio.atualizados.length}`)
  console.log(`🆕 Produtos criados     : ${relatorio.criados.length}`)
  console.log(`⚠  Sem imagem           : ${relatorio.sem_imagem.length}`)

  if (relatorio.atualizados.length) {
    console.log('\n🔗 MATCHES ENCONTRADOS (top 20):')
    relatorio.atualizados.slice(0, 20).forEach(r => {
      console.log(`  [${r.score}] Casoca: "${r.casoca}" → Banco: "${r.banco}"`)
      if (r.campos.length) console.log(`         campos: ${r.campos.join(', ')}`)
    })
  }

  if (relatorio.criados.length) {
    console.log(`\n🆕 PRODUTOS CRIADOS (${relatorio.criados.length}):`)
    relatorio.criados.forEach(r => console.log(`  • ${r.casoca} [${r.categoria || '?'}]`))
  }

  // Salva relatório em JSON
  const relFile = path.join(OUT_DIR, `relatorio-casoca-${brandSlug}.json`)
  fs.writeFileSync(relFile, JSON.stringify(relatorio, null, 2), 'utf8')
  console.log(`\n📄 Relatório salvo: ${relFile}`)

  if (!DRY_RUN && (relatorio.atualizados.length + relatorio.criados.length) > 0) {
    console.log('\n💡 Rode agora: node scripts/export-data.js')
  }
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message)
  console.error(err.stack)
  process.exit(1)
})
