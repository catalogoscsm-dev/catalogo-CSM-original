/**
 * batch-auto-catalogo.js
 * Processa em lote todos os PDFs ricos (texto extraível).
 * Para cada catálogo:
 *   1. Cria entrada na tabela catalogos
 *   2. Detecta produtos página a página
 *   3. Cria entradas na tabela produtos
 *   4. Cria pastas "pag XX" na pasta de imagens de cada catálogo
 *   5. Salva texto extraído para referência
 *
 * Uso: node scripts/batch-auto-catalogo.js [--dry-run] [--catalogo "NOME"]
 */

const fs       = require('fs')
const path     = require('path')
const pdf      = require('pdf-parse')
const Database = require('better-sqlite3')

const { BASE_CATALOGOS } = require('./config.cjs')
const SCAN_FILE = path.join(__dirname, 'scan-resultado.json')
const DB_PATH   = path.join(__dirname, '..', 'database', 'catalogo.db')

const isDryRun = process.argv.includes('--dry-run')
const soloFlag = process.argv.indexOf('--catalogo')
const soloCatalogo = soloFlag !== -1 ? process.argv[soloFlag + 1] : null

// ── Encoding fix ──────────────────────────────────────────────────────────────
// PDFs com fontes especiais às vezes geram texto UTF-8 decodificado como Latin-1.
// Tentamos corrigir: pegamos os bytes brutos e interpretamos como UTF-8.
function fixEncoding(text) {
  try {
    const buf = Buffer.from(text, 'binary')
    const fixed = buf.toString('utf8')
    const badOriginal  = (text.match(/Ã./g) || []).length
    const badFixed     = (fixed.match(/�/g) || []).length
    return badFixed < badOriginal ? fixed : text
  } catch { return text }
}

// ── Extração página a página ───────────────────────────────────────────────
async function extractPages(filePath) {
  const buffer = fs.readFileSync(filePath)
  const pages = []
  try {
    await pdf(buffer, {
      pagerender: async (pageData) => {
        const tc = await pageData.getTextContent()
        const raw = tc.items.map(i => i.str).join('\n')
        pages.push(fixEncoding(raw))
        return raw
      }
    })
  } catch {
    // fallback: extrai tudo junto
    try {
      const data = await pdf(buffer)
      const full = fixEncoding(data.text)
      const lines = full.split('\n')
      let cur = []
      let pageNum = 1
      for (const line of lines) {
        if (/^\s*\d{1,3}\s*$/.test(line) && cur.length > 2) {
          pages.push(cur.join('\n'))
          cur = []
          pageNum++
        } else {
          cur.push(line)
        }
      }
      if (cur.length) pages.push(cur.join('\n'))
    } catch {}
  }
  return pages
}

// ── Detecção de produto numa página ───────────────────────────────────────
const CAT_KEYWORDS = [
  ['aparador',          'Aparador'],
  ['buffet',            'Buffet'],
  ['cristaleira',       'Cristaleira'],
  ['estante',           'Estante'],
  ['mesa de jantar',    'Mesa de Jantar'],
  ['mesa de centro',    'Mesa de Centro'],
  ['mesa lateral',      'Mesa Lateral'],
  ['mesa auxiliar',     'Mesa Auxiliar'],
  ['mesa de cabeceira', 'Mesa de Cabeceira'],
  ['mesa de canto',     'Mesa de Canto'],
  ['mesa',              'Mesa'],
  ['poltrona',          'Poltrona'],
  ['cadeira',           'Cadeira'],
  ['sofa',              'Sofá'],
  ['sofá',              'Sofá'],
  ['cama',              'Cama'],
  ['cabeceira',         'Cabeceira'],
  ['cômod',             'Cômoda'],
  ['comoda',            'Cômoda'],
  ['cômoda',            'Cômoda'],
  ['banco',             'Banco'],
  ['banqueta',          'Banqueta'],
  ['puff',              'Puff'],
  ['pufe',              'Puff'],
  ['recamier',          'Recamier'],
  ['chaise',            'Chaise'],
  ['luminária',         'Luminária'],
  ['pendente',          'Pendente'],
  ['espelho',           'Espelho'],
  ['armário',           'Armário'],
  ['roupeiro',          'Roupeiro'],
  ['guarda-roupa',      'Guarda-Roupa'],
  ['escrivaninha',      'Escrivaninha'],
  ['cabideiro',         'Cabideiro'],
  ['colchão',           'Colchão'],
  ['berço',             'Berço'],
  ['rack',              'Rack'],
  ['painel',            'Painel TV'],
  ['home',              'Home Theater'],
  ['tapete',            'Tapete'],
  ['pendente',          'Pendente'],
]

function detectCategory(text) {
  const lower = text.toLowerCase()
  for (const [key, label] of CAT_KEYWORDS) {
    if (lower.includes(key)) return label
  }
  return 'Mobiliário'
}

function detectDimensions(text) {
  const pats = [
    /L\s*(\d{2,3})\s*[xX]\s*A?\s*(\d{2,3})\s*[xX]\s*P?\s*(\d{2,3})\s*cm/i,
    /(\d{2,3})\s*[xX]\s*(\d{2,3})\s*[xX]\s*(\d{2,3})\s*cm/i,
    /(\d{2,3})\s*x\s*(\d{2,3})\s*x\s*(\d{2,3})/i,
    /(\d{2,3})\s*X\s*(\d{2,3})\s*X\s*(\d{2,3})/,
    /Ø?\s*(\d{2,3})\s*[xX×]\s*(\d{2,3})/,
  ]
  for (const p of pats) {
    const m = text.match(p)
    if (m) return m[0].replace(/\s+/g, ' ').trim()
  }
  return null
}

function detectMaterial(text) {
  const lower = text.toLowerCase()
  const found = []
  if (lower.match(/mdf|mdp/))                      found.push('MDF')
  if (lower.match(/madeira\s+mac/))                 found.push('Madeira Maciça')
  if (lower.match(/madeira/))                       found.push('Madeira')
  if (lower.match(/eucalipto/))                     found.push('Eucalipto')
  if (lower.match(/jequitib/))                      found.push('Jequitibá')
  if (lower.match(/cinamomo/))                      found.push('Cinamomo')
  if (lower.match(/carvalho/))                      found.push('Carvalho')
  if (lower.match(/nogueir/))                       found.push('Nogueira')
  if (lower.match(/cedro/))                         found.push('Cedro')
  if (lower.match(/pínus|pinus/))                   found.push('Pínus')
  if (lower.match(/met[aá]l|aco\s*carbon|aço\s*carbon|ferro/)) found.push('Metal')
  if (lower.match(/veludo|velvet/))                 found.push('Veludo')
  if (lower.match(/couro\s+natural/))               found.push('Couro Natural')
  if (lower.match(/couro/))                         found.push('Couro')
  if (lower.match(/tecido|linho|poliéster/))        found.push('Tecido')
  if (lower.match(/espuma/))                        found.push('Espuma de Alta Densidade')
  if (lower.match(/vidro/))                         found.push('Vidro')
  if (lower.match(/m[aá]rmore|m[aá]rmorei/))       found.push('Mármore')
  if (lower.match(/granito/))                       found.push('Granito')
  if (lower.match(/cerâmica|cer[aâ]mica/))          found.push('Cerâmica')
  return found.length ? found.slice(0, 2).join(' e ') : null
}

function detectAcabamento(text) {
  const lower = text.toLowerCase()
  const found = []
  if (lower.match(/carvalho/))                     found.push('Carvalho')
  if (lower.match(/ebanizado/))                    found.push('Ebanizado')
  if (lower.match(/naturalle|natural lacado/))     found.push('Naturalle')
  if (lower.match(/laca|lacado/))                  found.push('Lacado')
  if (lower.match(/envelhecido/))                  found.push('Envelhecido')
  if (lower.match(/matte?/))                       found.push('Matte')
  if (lower.match(/acetinado/))                    found.push('Acetinado')
  if (lower.match(/espelhado/))                    found.push('Espelhado')
  return found.length ? found.slice(0, 3).join(', ') : null
}

// Lista de palavras genéricas que NÃO são nomes de produtos
const SKIP_WORDS = new Set([
  'INDEX','ÍNDICE','DESIGN','CATÁLOGO','CATALOG','SUMÁRIO','SUMARIO','PÁGINA','PAGE',
  'COLLECTION','COLEÇÃO','COLECAO','ACABAMENTOS','FINISHES','DESIGNERS','DESIGNER',
  'DETALHE','DETALHES','ATEMPORAIS','CONTEMPORÂNEOS','CONTEMPORÂNEAS','CONTEMPORÂNEA',
  'CONTEMPORÂNEO','CONTEMPORANEO','CLÁSSICOS','CLASSICOS','MODERNOS','NACIONAIS',
  'EXCLUSIVOS','EXCLUSIVO','ESPECIAL','PREMIUM','LUXURY','LUXO',
  'VISÃO','MISSÃO','HISTÓRIA','NOSSO','NOSSA','NOSSOS',
  'SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO','JANEIRO','FEVEREIRO',
  'MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO',
  'DORMITÓRIO','JANTAR','ESTAR','COMPLEMENTOS','COMPLEMENTO',
  'APARADORES','BANQUETAS','CADEIRAS','CAMAS','MESAS','POLTRONAS',
  'ESPELHOS','ESTANTES','CÔMODAS','CÓMODAS','COMODOS','BUFFETS','LUMINÁRIAS','LUMINARIAS',
  'MÓVEIS','MOVEIS','AMBIENTES','AMBIENTE','PRODUTOS','PRODUTO',
  'CONFORTO','QUALIDADE','TECNOLOGIA','INOVAÇÃO',
  'SOFAS','SOFÁS','COLCHÕES','COLCHOES','BERÇOS','BERCOS',
  'ESTOFADOS','RECAMIERS','CABIDEIROS','ESCRIVANINHAS','POLTRONAS',
  // Materiais/acabamentos que aparecem em páginas de amostra
  'NATURALLE','MARRONE','ENVELHECIDO','CASTANHO','AMAZÔNIA','AMAZONIA',
  'LAMINAÇÃO','LÂMINAÇÃO','LAMINAÇÃO','EBANIZADO','CARVALHO','CINAMOMO',
  'JEQUITIBÁ','EUCALIPTO','NOGUEIRA','MATTE','ACETINADO','PAPIRO','MOCCA',
  // Outros genéricos
  'ACABAMENTO','LACA','LACADO','NATURAIS','ESPECIFICAÇÕES','SPECS',
  'CUSTOMIZAÇÃO','CUSTOMIZACAO','PERSONALIZAÇÃO',
  'INFORMAÇÕES','INFORMACOES','TÉCNICAS','TECNICAS',
])

// Tenta encontrar nome de produto: linha toda em maiúsculas (com 4-60 chars)
function detectProductName(pageText) {
  const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length >= 4 && l.length <= 60)
  for (const line of lines) {
    // Pula linhas com anos ou números de edição
    if (/20\d{2}|#\d+|EDIÇÃO|EDITION|LANÇAMENTO/.test(line)) continue
    // Pula linhas só com números/símbolos
    if (/^[\d\s\.\-\/\|]+$/.test(line)) continue
    // Pula URLs, emails
    if (/https?:|www\.|\.com|\.br/.test(line)) continue
    const alpha = line.replace(/[^a-zA-ZÀ-ÿ]/g, '')
    if (!alpha || alpha.length < 4) continue
    // Deve ser todo maiúsculo
    if (alpha !== alpha.toUpperCase()) continue
    // Palavra única do dicionário de skip?
    const palavras = line.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').trim().split(/\s+/)
    if (palavras.length === 1 && SKIP_WORDS.has(palavras[0])) continue
    // Nome composto: se a primeira palavra é uma categoria E não tem segunda palavra, skip
    if (palavras.length >= 1 && SKIP_WORDS.has(palavras[0]) && palavras.length === 1) continue
    // Nome válido de produto requer que não seja só da lista de skip
    const todosSkip = palavras.every(p => SKIP_WORDS.has(p))
    if (todosSkip) continue
    return line
  }
  return null
}

// ── Analisa uma página e retorna dados do produto (ou null) ──────────────────
function analyzePage(pageText, pageNum) {
  if (!pageText || pageText.trim().length < 20) return null

  const name = detectProductName(pageText)
  if (!name) return null

  // Garante que o nome não é só palavras genéricas de catálogo
  const SKIP_NAMES = ['INDEX', 'ÍNDICE', 'DESIGN', 'COLEÇÃO', 'COLLECTION',
    'SUMÁRIO', 'CATÁLOGO', 'CATALOG', 'ACABAMENTOS', 'FINISHES', 'DESIGNERS']
  if (SKIP_NAMES.some(s => name.toUpperCase().includes(s))) return null

  const dims    = detectDimensions(pageText)
  const mat     = detectMaterial(pageText)
  const acab    = detectAcabamento(pageText)
  const cat     = detectCategory(pageText)

  return { nome: name, pagina: pageNum, descricao: cat, dimensoes: dims, material: mat, acabamento: acab }
}

// ── Extrai ano do nome da pasta ────────────────────────────────────────────
function extractYear(folderName) {
  const m = folderName.match(/20\d{2}/)
  return m ? parseInt(m[0]) : new Date().getFullYear()
}

// ── Cria pastas pag XX ────────────────────────────────────────────────────
function criarPastas(catalogoPasta, paginas) {
  const base = path.join(BASE_CATALOGOS, catalogoPasta, 'imagens dos produtos')
  if (!isDryRun) fs.mkdirSync(base, { recursive: true })
  const criadas = []
  for (const p of paginas) {
    const nome = `pag ${String(p).padStart(2, '0')}`
    const full = path.join(base, nome)
    if (!fs.existsSync(full) && !isDryRun) fs.mkdirSync(full, { recursive: true })
    criadas.push(nome)
  }
  return criadas
}

// ── Gera script importar-CATALOG.cjs ────────────────────────────────────────
function gerarScriptImportar(catalogoPasta) {
  const safeName = catalogoPasta.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')
  const scriptPath = path.join(__dirname, `importar-${safeName}.cjs`)
  if (fs.existsSync(scriptPath)) return

  const content = `/**
 * importar-${safeName}.cjs
 * Importa imagens de "${catalogoPasta}" para public/ e atualiza o banco.
 * Uso: node scripts/importar-${safeName}.cjs
 *
 * Estrutura esperada:
 *   catalogos separados/${catalogoPasta}/imagens dos produtos/pag XX/
 *     *.jpg / *.png  (arquivo de letra única = capa, número = galeria)
 */
const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')
const sharp    = require('sharp')

const { BASE_CATALOGOS } = require('./config.cjs')
const CATALOG_PASTA = '${catalogoPasta}'
const SRC_BASE      = path.join(BASE_CATALOGOS, CATALOG_PASTA, 'imagens dos produtos')
const PUBLIC_BASE   = path.join(__dirname, '..', 'public', 'imagens', CATALOG_PASTA)
const LOGO_PATH     = path.join(__dirname, '..', 'public', 'logo-csm.png')
const IMG_EXTS      = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jfif'])
const OPACITY       = 0.38
const LOGO_RATIO    = 0.14
const MARGIN_RATIO  = 0.025

const db  = new Database(path.join(__dirname, '..', 'database', 'catalogo.db'))
const cat = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(CATALOG_PASTA)
if (!cat) { console.error('Catálogo não encontrado no banco.'); process.exit(1) }

const logoBuffer = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null

async function aplicarWatermark(srcPath, destPath) {
  if (!logoBuffer) { fs.copyFileSync(srcPath, destPath); return }
  const img  = sharp(srcPath)
  const { width, height } = await img.metadata()
  const logoW  = Math.max(60, Math.round(width * LOGO_RATIO))
  const margin = Math.round(width * MARGIN_RATIO)
  const resized = await sharp(logoBuffer).resize({ width: logoW, fit: 'inside' }).png().toBuffer()
  const meta    = await sharp(resized).metadata()
  const { data, info } = await sharp(resized).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 3; i < data.length; i += 4) data[i] = Math.round(data[i] * OPACITY)
  const overlay = await sharp(Buffer.from(data), { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
  await sharp(srcPath)
    .composite([{ input: overlay, left: width - meta.width - margin, top: height - meta.height - margin, blend: 'over' }])
    .toFile(destPath)
}

function tipoImagem(filename) {
  const base = path.basename(filename, path.extname(filename)).trim()
  if (/^[a-zA-Z]+$/.test(base))  return 'capa'
  if (/^\\d+$/.test(base))        return 'galeria'
  const l = filename.toLowerCase()
  if (/^pag\\s*\\d+\\.[a-z]+$/.test(l)) return 'capa'
  if (l.includes('galeria'))      return 'galeria'
  return 'galeria'
}

function rankImagem(filename) {
  const t = tipoImagem(filename)
  return t === 'capa' ? 0 : 1
}

async function main() {
  fs.mkdirSync(PUBLIC_BASE, { recursive: true })
  const subpastas = fs.readdirSync(SRC_BASE, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^pag\\s*\\d+$/i.test(d.name))
    .map(d => d.name).sort()

  let total = 0
  for (const subpasta of subpastas) {
    const srcDir = path.join(SRC_BASE, subpasta)
    const pageNum = parseInt(subpasta.replace(/\\D/g, ''), 10)
    const arquivos = fs.readdirSync(srcDir)
      .filter(f => IMG_EXTS.has(path.extname(f).toLowerCase()))
      .sort((a, b) => rankImagem(a) - rankImagem(b) || a.localeCompare(b))
    if (!arquivos.length) continue

    const produtos = db.prepare('SELECT * FROM produtos WHERE catalogo_id = ? AND pagina = ?').all(cat.id, pageNum)
    if (!produtos.length) { console.warn(\`  [\${subpasta}] Sem produto na pág. \${pageNum}. Pulando.\`); continue }

    const urls = []
    for (const arquivo of arquivos) {
      const srcPath  = path.join(srcDir, arquivo)
      const destPath = path.join(PUBLIC_BASE, arquivo)
      if (!fs.existsSync(destPath)) {
        process.stdout.write(\`  Processando \${arquivo}...\`)
        await aplicarWatermark(srcPath, destPath)
        console.log(' ✓')
      }
      urls.push(\`/imagens/\${encodeURIComponent(CATALOG_PASTA)}/\${encodeURIComponent(arquivo)}\`)
    }
    for (const prod of produtos) {
      db.prepare('UPDATE produtos SET imagens = ? WHERE id = ?').run(JSON.stringify(urls), prod.id)
    }
    console.log(\`  ✓ [\${subpasta}] \${produtos.map(p=>p.nome).join(' + ')} — \${urls.length} imagem(ns)\`)
    total += produtos.length
  }
  console.log(\`\n\${total} produto(s) atualizados.\`)
  db.close()
}

main().catch(e => { console.error(e); process.exit(1) })
`
  if (!isDryRun) fs.writeFileSync(scriptPath, content, 'utf8')
  return scriptPath
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(SCAN_FILE)) {
    console.error('scan-resultado.json não encontrado. Rode scan-pdfs.js primeiro.')
    process.exit(1)
  }

  const db = isDryRun ? null : new Database(DB_PATH)
  if (db) {
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }

  const scan = JSON.parse(fs.readFileSync(SCAN_FILE, 'utf8'))
  const jaNoBanco = new Set(
    isDryRun ? [] : db.prepare('SELECT pasta FROM catalogos').all().map(r => r.pasta)
  )

  let candidatos = [...scan.ricos, ...scan.parciais]
  if (soloCatalogo) {
    candidatos = candidatos.filter(r => r.pasta === soloCatalogo)
    if (!candidatos.length) {
      console.error(`Catálogo "${soloCatalogo}" não encontrado na lista de ricos/parciais.`)
      process.exit(1)
    }
  }

  const relatorio = { processados: [], erros: [], ignorados: [] }

  for (const item of candidatos) {
    const { pasta } = item
    if (jaNoBanco.has(pasta)) {
      relatorio.ignorados.push({ pasta, motivo: 'já no banco' })
      console.log(`  ↷ [SKIP]       ${pasta} — já cadastrado`)
      continue
    }

    console.log(`\n${'─'.repeat(60)}`)
    console.log(`  ► ${pasta}`)

    // Encontra PDF
    const pastaPath = path.join(BASE_CATALOGOS, pasta)
    const pdfs = fs.readdirSync(pastaPath).filter(f => f.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) {
      relatorio.erros.push({ pasta, erro: 'sem PDF' })
      console.log('    ✗ Sem PDF na pasta')
      continue
    }
    const pdfPath = path.join(pastaPath, pdfs[0])

    let pages
    try {
      pages = await extractPages(pdfPath)
    } catch (e) {
      relatorio.erros.push({ pasta, erro: e.message })
      console.log(`    ✗ Erro ao extrair: ${e.message}`)
      continue
    }

    // Analisa páginas
    const produtos = []
    const paginasUsadas = new Set()
    for (let i = 0; i < pages.length; i++) {
      const pageNum = i + 1
      const result = analyzePage(pages[i], pageNum)
      if (result && !paginasUsadas.has(pageNum)) {
        produtos.push(result)
        paginasUsadas.add(pageNum)
      }
    }

    // Cria catálogo no DB
    let catId
    if (!isDryRun) {
      const ano = extractYear(pasta)
      catId = db.prepare(
        'INSERT OR IGNORE INTO catalogos (nome, pasta, ano) VALUES (?, ?, ?)'
      ).run(pasta, pasta, ano).lastInsertRowid
      if (!catId) {
        catId = db.prepare('SELECT id FROM catalogos WHERE pasta = ?').get(pasta)?.id
      }
    }

    // Salva texto extraído
    const textoDir = path.join(pastaPath, '_texto_extraido.txt')
    if (!isDryRun) {
      fs.writeFileSync(textoDir, pages.join('\n\n---PÁGINA---\n\n'), 'utf8')
    }

    // Insere produtos
    let inseridos = 0
    const paginasFolders = []
    if (produtos.length > 0) {
      for (const prod of produtos) {
        if (!isDryRun) {
          db.prepare(`
            INSERT INTO produtos (catalogo_id, nome, descricao, material, dimensoes, acabamento, pagina, imagens)
            VALUES (?, ?, ?, ?, ?, ?, ?, '[]')
          `).run(catId, prod.nome, prod.descricao, prod.material, prod.dimensoes, prod.acabamento, prod.pagina)
        }
        paginasFolders.push(prod.pagina)
        inseridos++
      }
      // Cria pastas
      const criadas = criarPastas(pasta, paginasFolders)
      console.log(`    ✓ ${inseridos} produto(s) detectados — ${criadas.length} pastas criadas`)
      produtos.forEach(p => {
        const dim = p.dimensoes ? ` | ${p.dimensoes}` : ''
        console.log(`      • pag ${String(p.pagina).padStart(2,'0')}: ${p.nome}${dim}`)
      })
    } else {
      // Sem produtos detectados — cria catálogo mas sem produtos
      console.log(`    ~ Catálogo criado mas nenhum produto detectado automaticamente`)
      console.log(`      → Texto salvo em _texto_extraido.txt para análise manual`)
    }

    // Gera script de importação
    const scriptPath = gerarScriptImportar(pasta)
    if (scriptPath) console.log(`    → Script: scripts/importar-${pasta.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')}.cjs`)

    relatorio.processados.push({
      pasta,
      totalPaginas: pages.length,
      produtos: produtos.length,
      pastas: paginasFolders.length,
      catId: isDryRun ? 'dry-run' : catId
    })
  }

  if (db) db.close()

  console.log('\n' + '═'.repeat(60))
  console.log('RELATÓRIO FINAL')
  console.log('═'.repeat(60))
  console.log(`  Processados: ${relatorio.processados.length}`)
  console.log(`  Ignorados:   ${relatorio.ignorados.length}`)
  console.log(`  Erros:       ${relatorio.erros.length}`)
  const totalProdutos = relatorio.processados.reduce((s, r) => s + r.produtos, 0)
  console.log(`  Total produtos inseridos: ${totalProdutos}`)
  if (relatorio.erros.length) {
    console.log('\n  Erros:')
    relatorio.erros.forEach(e => console.log(`    • ${e.pasta}: ${e.erro}`))
  }

  const relPath = path.join(__dirname, 'batch-relatorio.json')
  if (!isDryRun) {
    fs.writeFileSync(relPath, JSON.stringify(relatorio, null, 2), 'utf8')
    console.log(`\nRelatório salvo em scripts/batch-relatorio.json`)
  }

  if (isDryRun) console.log('\n[DRY-RUN] Nenhuma alteração foi feita.')
}

main().catch(e => { console.error(e); process.exit(1) })
