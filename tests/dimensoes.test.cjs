// Teste de regressão do parser de dimensões. Rodar: npm test   (node --test tests/)
const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('path')
const { parseAll, statusDimensoes, formatarDimensoesCruas } = require(path.join(__dirname, '../lib/dimensoes.ts'))

const cells = t => t.rows.map(r => ({ size: r.size, ...Object.fromEntries(r.cells.map(c => [c.label, c.val])) }))

test('BOM: tabela P/M/G com L x P x A posicional', () => {
  const t = parseAll('P-100x50x75CM | M-120x60x75CM | G-140x70x75CM')
  assert.deepEqual(cells(t), [
    { size: 'P', Largura: '100', 'Prof.': '50', Altura: '75' },
    { size: 'M', Largura: '120', 'Prof.': '60', Altura: '75' },
    { size: 'G', Largura: '140', 'Prof.': '70', Altura: '75' },
  ])
})

test('BOM: rótulo COM NÚMERO e medidas coladas (Carppem: Ret300-L300A76P120CM)', () => {
  const t = parseAll('Ret300-L300A76P120CM | Quad150-L150A76P150CM')
  assert.deepEqual(cells(t)[0], { size: 'Ret300', Largura: '300', Altura: '76', 'Prof.': '120' })
  assert.equal(t.rows.length, 2)
})

test('BOM: rótulo com "x" dentro da palavra (Baixo200-…) não quebra', () => {
  const t = parseAll('Alto200-L200A90P45CM | Baixo200-L200A76P45CM')
  assert.deepEqual(t.rows.map(r => r.size), ['Alto200', 'Baixo200'])
  assert.deepEqual(cells(t)[1], { size: 'Baixo200', Largura: '200', Altura: '76', 'Prof.': '45' })
})

test('BOM: rótulo sem A/P, só L (Quad150-L150CM) e medidas só numéricas', () => {
  assert.deepEqual(cells(parseAll('Quad-L150CM')), [{ size: 'Quad', Largura: '150' }])
  assert.equal(statusDimensoes('220x90x75CM'), 'ok') // obs.: formato E ignora o valor do meio (limitação conhecida, não alterada)
})

test('BOM: letras com espaço e espaço antes de CM (Herval: "L 266xA 220xP 64cm")', () => {
  assert.deepEqual(cells(parseAll('L 266xA 220xP 64cm')), [{ size: null, Largura: '266', Altura: '220', 'Prof.': '64' }])
  assert.deepEqual(cells(parseAll('L 90 X 45 X 32 CM')), [{ size: null, Largura: '90', 'Prof.': '45', Altura: '32' }])
})

test('BOM: medidas decimais e faixas', () => {
  assert.deepEqual(cells(parseAll('L 1,20xP 0,60xA 0,75')), [{ size: null, Largura: '1,20', 'Prof.': '0,60', Altura: '0,75' }])
  assert.deepEqual(cells(parseAll('L 207-514 x P 105-168 x A 88cm')), [{ size: null, Largura: '207-514', 'Prof.': '105-168', Altura: '88' }])
})

test('BOM: formato E em metros vira cm (mesas)', () => {
  const t = parseAll('1,10x2,70m | 1,00x2,20m | A: 0,76m')
  assert.equal(t.rows[0].cells[0].val, '110')
  assert.equal(t.rows[0].cells[1].val, '270')
})

test('RUIM: lixo com dígitos é inválido; texto sem dígitos é descritivo; vazio é vazio', () => {
  assert.equal(statusDimensoes('abc 12 ??? zz'), 'invalido')
  assert.equal(statusDimensoes('Modular (múltiplos módulos)'), 'descritivo')
  assert.equal(statusDimensoes(''), 'vazio')
  assert.equal(statusDimensoes(null), 'vazio')
  assert.equal(statusDimensoes('Ret300-L300A76P120CM'), 'ok')
})

test('RUIM: uma variante inválida invalida a linha inteira (parseAll → null)', () => {
  assert.equal(parseAll('Ret300-L300A76P120CM | ???'), null)
})

test('fallback cru: "x" vira "×" só entre medidas, nunca dentro de "Baixo"', () => {
  assert.equal(formatarDimensoesCruas('Baixo200 e 12x34CM'), 'Baixo200 e 12 × 34cm')
  assert.ok(formatarDimensoesCruas('Baixo200-algo').includes('Baixo'))
})
