const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const APENAS_CATALOGO = process.argv.find(a => a.startsWith('--catalogo='))?.split('=')[1] ?? null;

const DB_PATH = path.join(__dirname, 'database', 'catalogo.db');
const IMAGENS_BASE = path.join(__dirname, 'public', 'imagens');
const SAIDA_BASE = path.join(__dirname, '..', 'exportacao-cliente');

function sanitizarNome(nome) {
  return nome
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolverImagemUrl(urlPath) {
  const decoded = decodeURIComponent(urlPath.replace(/^\/imagens\//, ''));
  return path.join(IMAGENS_BASE, decoded);
}

function buscarImagemPorPagina(pastaFornecedor, pagina) {
  const sufixos = ['-recorte_1.png', '-capa.png', '-recorte_2.png', '-recorte_3.png'];
  const offsets = [0, 1, -1, 2, -2];

  for (const offset of offsets) {
    const pag = pagina + offset;
    for (const suf of sufixos) {
      const full = path.join(pastaFornecedor, `pag${pag}${suf}`);
      if (fs.existsSync(full)) return full;
    }
  }
  try {
    const arquivos = fs.readdirSync(pastaFornecedor);
    for (const offset of offsets) {
      const prefixo = `pag${pagina + offset}`;
      const encontrado = arquivos.find(f => f.startsWith(prefixo) && /\.(png|jpg|jpeg|webp)$/i.test(f));
      if (encontrado) return path.join(pastaFornecedor, encontrado);
    }
  } catch {}
  return null;
}

function fornecedorTemImagens(pastaNome) {
  const pastaPath = path.join(IMAGENS_BASE, pastaNome);
  if (!fs.existsSync(pastaPath)) return false;
  try {
    const arquivos = fs.readdirSync(pastaPath);
    return arquivos.some(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
  } catch {
    return false;
  }
}

function main() {
  const db = new Database(DB_PATH, { readonly: true });

  let catalogos = db.prepare('SELECT id, nome, pasta FROM catalogos ORDER BY nome').all();
  if (APENAS_CATALOGO) {
    catalogos = catalogos.filter(c => c.nome === APENAS_CATALOGO || c.pasta === APENAS_CATALOGO);
  }

  const produtosPorCatalogo = {};
  for (const p of db.prepare('SELECT * FROM produtos ORDER BY catalogo_id, pagina').all()) {
    if (!produtosPorCatalogo[p.catalogo_id]) produtosPorCatalogo[p.catalogo_id] = [];
    produtosPorCatalogo[p.catalogo_id].push(p);
  }

  const stats = { processados: 0, copiados: 0, pulados: 0, ignorados: [] };

  if (!DRY_RUN) fs.mkdirSync(SAIDA_BASE, { recursive: true });

  for (const catalogo of catalogos) {
    const { id, nome, pasta } = catalogo;

    if (!fornecedorTemImagens(pasta)) {
      stats.ignorados.push(nome);
      continue;
    }

    const listaProdutos = produtosPorCatalogo[id] || [];
    if (listaProdutos.length === 0) {
      stats.ignorados.push(`${nome} (sem produtos)`);
      continue;
    }

    const pastaSaida = path.join(SAIDA_BASE, sanitizarNome(nome));
    const pastaFonte = path.join(IMAGENS_BASE, pasta);

    if (!DRY_RUN) fs.mkdirSync(pastaSaida, { recursive: true });

    const nomesUsados = {};

    for (const produto of listaProdutos) {
      let imagemFonte = null;

      if (produto.imagens && produto.imagens !== '[]') {
        try {
          const arr = JSON.parse(produto.imagens);
          if (arr.length > 0) {
            const recorte = arr.find(u => u.toLowerCase().includes('recorte'));
            const urlEscolhida = recorte || arr[0];
            const caminho = resolverImagemUrl(urlEscolhida);
            if (fs.existsSync(caminho)) imagemFonte = caminho;
          }
        } catch {}
      }

      if (!imagemFonte && produto.pagina) {
        imagemFonte = buscarImagemPorPagina(pastaFonte, produto.pagina);
      }

      if (!imagemFonte) {
        stats.pulados++;
        continue;
      }

      const ext = path.extname(imagemFonte) || '.png';
      let nomeBase = sanitizarNome(produto.nome || `produto_pag${produto.pagina}`);
      if (!nomeBase) nomeBase = `produto_pag${produto.pagina}`;

      let nomeFinal = nomeBase;
      if (nomesUsados[nomeBase.toLowerCase()]) {
        nomesUsados[nomeBase.toLowerCase()]++;
        nomeFinal = `${nomeBase}_${nomesUsados[nomeBase.toLowerCase()]}`;
      } else {
        nomesUsados[nomeBase.toLowerCase()] = 1;
      }

      const destino = path.join(pastaSaida, nomeFinal + ext);

      if (!DRY_RUN) fs.copyFileSync(imagemFonte, destino);
      stats.copiados++;
    }

    stats.processados++;
    console.log(`[OK] ${nome}: ${listaProdutos.length} produtos`);
  }

  db.close();

  console.log('\n========== RESUMO ==========');
  console.log(`Fornecedores processados : ${stats.processados}`);
  console.log(`Imagens copiadas         : ${stats.copiados}`);
  console.log(`Produtos sem imagem      : ${stats.pulados}`);
}

main();
