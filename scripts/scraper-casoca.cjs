/**
 * scraper-casoca.cjs
 * Raspa todos os produtos de uma marca no Casoca e salva em JSON.
 *
 * Uso:
 *   node scripts/scraper-casoca.cjs <slug-da-marca>
 *
 * Exemplos:
 *   node scripts/scraper-casoca.cjs sier-moveis
 *   node scripts/scraper-casoca.cjs iummi
 *   node scripts/scraper-casoca.cjs madelustre
 *
 * Saída: scripts/casoca-<slug>.json
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const BASE_URL  = 'https://casoca.com.br'
const DELAY_MS  = 800
const OUT_DIR   = __dirname

// ─── helpers ─────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CatalogCSM/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} → ${url}`)
  return res.text()
}

// ─── extração da listagem ─────────────────────────────────────────────────────

/**
 * Extrai slugs de produto de uma página de listagem.
 * Links no formato: https://casoca.com.br/{slug}-{marca}.html
 * O brandKey é a parte que identifica a marca no slug (ex: "iummi", "sier").
 */
function extrairSlugsDaListagem(html, brandKey) {
  const re = new RegExp(
    `https://casoca\\.com\\.br/([a-z0-9][a-z0-9-]+-${brandKey})\\.html`,
    'g'
  )
  const slugs = new Set()
  let m
  while ((m = re.exec(html)) !== null) {
    slugs.add(m[1])
  }
  return [...slugs]
}

// ─── extração da página de produto ───────────────────────────────────────────

function extrairNome(html) {
  const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
  if (!m) return null
  // Remove sufixo " - Marca" (ex: "Mesa Lateral Moet - IUMMI" → "Mesa Lateral Moet")
  return m[1].trim().replace(/\s*-\s*[A-ZÁÉÍÓÚÂÊÔÀÃÕÇÜÑ][^-]*$/, '').trim()
}

function extrairCategoria(html) {
  // <dt>Tipo do produto</dt> → <dd title="Categoria">Categoria</dd>
  const m = html.match(/Tipo\s+do\s+produto<\/dt>\s*<dd[^>]+title="([^"]{2,80})"/i)
  if (m) return m[1].trim()
  return null
}

function extrairDimensoes(html) {
  // <dt>Dimensões</dt> → <dd title="L Xcm x P Xcm x A Xcm">
  const m1 = html.match(/Dimens[õo]es<\/dt>\s*<dd[^>]+title="([^"]{5,120})"/i)
  if (m1) return m1[1].trim()

  // Fallback: padrão "NxNxN cm" no texto
  const m2 = html.match(/([\d,.]+\s*[xX×]\s*[\d,.]+\s*[xX×]\s*[\d,.]+\s*cm)/i)
  if (m2) return m2[1].trim()

  return null
}

function extrairMaterial(html) {
  // Extrai o bloco pdp-spec__description-text
  const descBlock = html.match(/pdp-spec__description-text[^>]*>([\s\S]{0,3000}?)<\/div>/i)
  if (!descBlock) return null
  const bloco = descBlock[1]

  // Primeiro <p> sem tag <b> dentro (é a descrição/material do produto)
  const firstP = bloco.match(/<p>\s*(?!<b>)([^<]{10,400})<\/p>/i)
  if (firstP) return firstP[1].trim()
  return null
}

function extrairAcabamento(html) {
  // <b>Acabamentos existentes:</b> texto
  const m = html.match(/<b>Acabamentos?\s+existentes?:?<\/b>\s*([^<]{5,250})/i)
  if (m) return m[1].trim().replace(/\.$/, '')
  return null
}

function extrairImagemUrl(html) {
  // Imagem principal do produto no cache do Casoca
  const m = html.match(/(https:\/\/casoca\.com\.br\/media\/catalog\/product\/[^\s"'<>]+)/i)
  return m ? m[0] : null
}

// ─── scraping de um produto ───────────────────────────────────────────────────

async function scraparProduto(slug) {
  const url = `${BASE_URL}/${slug}.html`
  try {
    const html = await fetchHtml(url)
    return {
      slug,
      url,
      nome:       extrairNome(html),
      categoria:  extrairCategoria(html),
      dimensoes:  extrairDimensoes(html),
      material:   extrairMaterial(html),
      acabamento: extrairAcabamento(html),
      imagem_url: extrairImagemUrl(html),
    }
  } catch (err) {
    console.warn(`  ⚠ ${slug}: ${err.message}`)
    return { slug, url, erro: err.message }
  }
}

// ─── coleta de slugs de todas as páginas ─────────────────────────────────────

async function coletarTodosOsSlugs(brandSlug, brandKey) {
  const todosOsSlugs = new Set()
  let pagina = 1

  while (true) {
    const url = pagina === 1
      ? `${BASE_URL}/${brandSlug}.html`
      : `${BASE_URL}/${brandSlug}.html?p=${pagina}`

    const html   = await fetchHtml(url)
    const slugs  = extrairSlugsDaListagem(html, brandKey)
    const novos  = slugs.filter(s => !todosOsSlugs.has(s))

    if (novos.length === 0) {
      // Página sem slugs novos = chegamos ao fim
      break
    }

    novos.forEach(s => todosOsSlugs.add(s))
    console.log(`   Página ${pagina}: +${novos.length} slugs (total: ${todosOsSlugs.size})`)
    pagina++
    await sleep(DELAY_MS)
  }

  return [...todosOsSlugs]
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const brandSlug = process.argv[2]
  if (!brandSlug) {
    console.error('Uso: node scripts/scraper-casoca.cjs <slug-da-marca>')
    console.error('Exemplos:')
    console.error('  node scripts/scraper-casoca.cjs iummi')
    console.error('  node scripts/scraper-casoca.cjs sier-moveis')
    console.error('  node scripts/scraper-casoca.cjs madelustre')
    process.exit(1)
  }

  // brandKey = parte que identifica a marca nos slugs de produto
  // Ex: "sier-moveis" → "sier"
  const brandKey = brandSlug.replace('-moveis', '').replace('-', '')
  console.log(`\n🔍 Casoca scraper → marca: ${brandSlug} (key: ${brandKey})`)

  // 1. Coleta todos os slugs
  console.log('\n📄 Coletando slugs das páginas de listagem...')
  const slugs = await coletarTodosOsSlugs(brandSlug, brandKey)
  console.log(`   ✓ ${slugs.length} produtos encontrados\n`)

  if (slugs.length === 0) {
    console.error('Nenhum produto encontrado. Verifique o slug da marca.')
    console.error(`Tente acessar: ${BASE_URL}/${brandSlug}.html`)
    process.exit(1)
  }

  // 2. Scrapa cada produto
  console.log('🛒 Baixando dados de cada produto...')
  const produtos = []
  for (let i = 0; i < slugs.length; i++) {
    process.stdout.write(`   [${i + 1}/${slugs.length}] ${slugs[i]}`.padEnd(80) + '\r')
    await sleep(DELAY_MS)
    const prod = await scraparProduto(slugs[i])
    produtos.push(prod)
  }

  const ok     = produtos.filter(p => !p.erro)
  const erros  = produtos.filter(p => p.erro)
  console.log(`\n   ✓ ${ok.length} OK | ✗ ${erros.length} com erro`)

  // 3. Salva JSON
  const outFile = path.join(OUT_DIR, `casoca-${brandSlug}.json`)
  fs.writeFileSync(outFile, JSON.stringify(produtos, null, 2), 'utf8')
  console.log(`\n✅ Salvo em: ${outFile}`)

  // 4. Resumo dos campos
  if (ok.length) {
    console.log('\n📊 Campos preenchidos:')
    const campos = ['nome','categoria','dimensoes','material','acabamento','imagem_url']
    campos.forEach(c => {
      const n = ok.filter(p => p[c]).length
      const pct = Math.round(n / ok.length * 100)
      const bar = '█'.repeat(Math.round(pct / 5)).padEnd(20)
      console.log(`   ${c.padEnd(15)} ${bar} ${n}/${ok.length} (${pct}%)`)
    })
  }
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message)
  process.exit(1)
})
