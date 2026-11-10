/**
 * GOOGLE APPS SCRIPT — Catálogo CSM
 * 1. Cole em: Extensões > Apps Script
 * 2. Salve (Ctrl+S)
 * 3. Selecione "iniciarPlanilha" e clique Executar ▶
 * 4. Implante: Implantar > Nova implantação > App da Web
 *    - Executar como: Eu
 *    - Acesso: Qualquer pessoa
 * 5. Cole a URL no .env como NEXT_PUBLIC_SHEETS_WEBHOOK=<url>
 */

var VENDEDORAS = [
  { nome: 'Ana',     codigo: 'ana',     whatsapp: '5519900000001' },
  { nome: 'Carla',   codigo: 'carla',   whatsapp: '5519900000002' },
  { nome: 'Julia',   codigo: 'julia',   whatsapp: '5519900000003' },
  { nome: 'Beatriz', codigo: 'beatriz', whatsapp: '5519900000004' },
  { nome: 'Mariana', codigo: 'mariana', whatsapp: '5519900000005' },
]

var URL_BASE = 'http://localhost:3000'
// Produção: 'https://catalogoscsm-dev.github.io/catalogo-digital'

var CABECALHO = ['Data', 'Nome do Cliente', 'Telefone', 'Empresa', 'E-mail', 'Observações', 'Produtos', 'Qtd']

// ── Recebe dados do catálogo ──────────────────────────────────────────────────
function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents)
    var ss     = SpreadsheetApp.getActiveSpreadsheet()
    var nome   = dados.vendedora || 'Sem vínculo'
    var aba    = ss.getSheetByName(nome)

    if (!aba) {
      aba = ss.insertSheet(nome)
      escreverCabecalho(aba)
    } else if (aba.getRange(1, 1).getValue() === '') {
      escreverCabecalho(aba)
    }

    aba.appendRow([
      dados.data        || Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss'),
      dados.nomeCliente || '',
      dados.telefone    || '',
      dados.empresa     || '',
      dados.email       || '',
      dados.observacoes || '',
      dados.produtos    || '',
      dados.quantidade  || 0,
    ])

    aba.setRowHeight(aba.getLastRow(), 40)

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// ── Escreve cabeçalho e formata a aba ────────────────────────────────────────
function escreverCabecalho(aba) {
  aba.getRange(1, 1, 1, 8).setValues([CABECALHO])
  aba.getRange(1, 1, 1, 8)
    .setFontWeight('bold')
    .setBackground('#2D2010')
    .setFontColor('#E8C87A')
  aba.setFrozenRows(1)
  aba.setColumnWidth(1, 150)
  aba.setColumnWidth(2, 160)
  aba.setColumnWidth(3, 130)
  aba.setColumnWidth(4, 150)
  aba.setColumnWidth(5, 180)
  aba.setColumnWidth(6, 200)
  aba.setColumnWidth(7, 300)
  aba.setColumnWidth(8, 50)
  aba.setRowHeight(1, 36)
  SpreadsheetApp.flush()
}

// ── Roda UMA VEZ para configurar a planilha ──────────────────────────────────
function iniciarPlanilha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  // Recria aba Vendedoras
  var abaV = ss.getSheetByName('Vendedoras')
  if (abaV) ss.deleteSheet(abaV)
  abaV = ss.insertSheet('Vendedoras', 0)

  abaV.getRange(1, 1, 1, 4).setValues([['Nome', 'WhatsApp', 'Link do Catálogo', 'Código']])
  abaV.getRange(1, 1, 1, 4)
    .setFontWeight('bold')
    .setBackground('#2D2010')
    .setFontColor('#E8C87A')
  abaV.setFrozenRows(1)
  abaV.setColumnWidth(1, 120)
  abaV.setColumnWidth(2, 160)
  abaV.setColumnWidth(3, 340)
  abaV.setColumnWidth(4, 90)

  for (var i = 0; i < VENDEDORAS.length; i++) {
    var v    = VENDEDORAS[i]
    var link = URL_BASE + '/?v=' + v.codigo
    abaV.getRange(i + 2, 1, 1, 4).setValues([[v.nome, v.whatsapp, link, v.codigo]])
    abaV.setRowHeight(i + 2, 36)
  }

  SpreadsheetApp.flush()

  // Cria abas individuais
  for (var j = 0; j < VENDEDORAS.length; j++) {
    var nome = VENDEDORAS[j].nome
    var aba  = ss.getSheetByName(nome)
    if (!aba) {
      aba = ss.insertSheet(nome)
      escreverCabecalho(aba)
    }
  }

  Logger.log('Planilha configurada com sucesso!')
}

// ── Teste ────────────────────────────────────────────────────────────────────
function doGet() {
  return ContentService
    .createTextOutput('Catálogo CSM — Apps Script ativo ✓')
    .setMimeType(ContentService.MimeType.TEXT)
}
