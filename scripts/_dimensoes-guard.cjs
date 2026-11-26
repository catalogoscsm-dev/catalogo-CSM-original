// Guarda de dimensões — usa o MESMO parser do site (lib/dimensoes.ts). Requer Node 22.18+ (type-stripping nativo).
//
// Em scripts importar-*.cjs, ANTES de gravar no banco:
//   require('./_dimensoes-guard.cjs').assertDimensoes(rows.map(r => r.row))   // aborta (exit 1) se houver string inválida
const path = require('path')
const { statusDimensoes } = require(path.join(__dirname, '../lib/dimensoes.ts'))

// itens: [{ nome, dimensoes, ... }] → lista dos que NÃO serão exibidos como tabela
function invalidas(itens) {
  return itens
    .map(i => ({ ...i, _status: statusDimensoes(i.dimensoes) }))
    .filter(i => i._status === 'invalido')
}

function assertDimensoes(itens, quem = process.argv[1] ? path.basename(process.argv[1]) : 'script') {
  const ruins = invalidas(itens)
  if (!ruins.length) return
  console.error(`\n[${quem}] ABORTADO: ${ruins.length} produto(s) com "dimensoes" fora do formato aceito (nada foi gravado):`)
  for (const r of ruins) console.error(`  - ${r.nome}: ${r.dimensoes}`)
  console.error('\nFormato oficial: docs/FORMATO-DIMENSOES.md\n')
  process.exit(1)
}

module.exports = { invalidas, assertDimensoes, statusDimensoes }
