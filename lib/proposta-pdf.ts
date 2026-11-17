/**
 * Gerador de PROPOSTA em PDF — padrão CSM (v1).
 * Porta fiel do design aprovado (capa com luz dourada, página do cliente,
 * uma página por peça, página final com QR do WhatsApp do vendedor).
 *
 * Roda 100% no navegador (jsPDF) — não depende de servidor/Python.
 *
 * CONTRATO: o layout é "congelado". Para mudar o visual, mexa só neste arquivo;
 * os dados entram sempre pelo objeto `DadosProposta` (campos vazios somem).
 */
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

// ───────────────────────── Tipos (contrato de dados) ─────────────────────────

export interface Vendedor {
  nome: string;
  /** Telefone para exibir, ex.: "(19) 99293-6703" */
  telefone?: string;
  /** Só dígitos com DDI, ex.: "5519992936703". Vazio = usa o WhatsApp da loja. */
  whatsapp?: string;
  email?: string;
  /** Foto de perfil já recortada em círculo (PNG data URL). Opcional. */
  fotoDataUrl?: string;
}

export interface Cliente {
  nome?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
}

export interface Produto {
  nome: string;
  /** Imagem principal (data URL JPEG/PNG) + dimensões naturais para não distorcer */
  imgDataUrl?: string;
  imgW?: number;
  imgH?: number;
  dimensoes?: string;
  material?: string;
  descricao?: string;
  linha?: string;
  quantidade?: number;
  /** Texto pronto, ex.: "R$ 4.990,00". Vazio = "Sob consulta". */
  preco?: string;
  pagamento?: string;
  prazo?: string;
}

export interface Assets {
  glowCover: string; // data URL JPEG
  glowFinal: string; // data URL JPEG
  /** Logo laranja com fundo transparente (PNG data URL) + proporção */
  logoDataUrl?: string;
  logoW?: number;
  logoH?: number;
}

export interface Loja {
  nome: string;
  site: string;
  whatsapp: string; // fallback quando o vendedor não tem número
  telefone?: string;
}

/**
 * "selecao"  = gerado pelo CLIENTE (sem preço): lista de peças de interesse, "não é orçamento".
 * "orcamento" = gerado pelo VENDEDOR (com preço, prazo e validade): o documento comercial.
 */
export type TipoDocumento = "selecao" | "orcamento";

export interface DadosProposta {
  /** Padrão: "selecao". */
  tipo?: TipoDocumento;
  vendedor: Vendedor;
  cliente: Cliente;
  produtos: Produto[];
  /** "16 de novembro de 2026" */
  data: string;
  validade?: string;
  loja?: Partial<Loja>;
  assets: Assets;
}

export const LOJA_PADRAO: Loja = {
  nome: "Campinas Shopping Móveis",
  site: "csmdecor.com.br",
  whatsapp: "5519990034068",
};

// ───────────────────────── Constantes visuais ─────────────────────────

const MM = 72 / 25.4;
const W = 595.28;
const H = 841.89;
const M = 18 * MM;

const BG_DARK = "#0F0D0A";
const GOLD = "#B8892B";
const GOLD_LIGHT = "#D4A94A";
const GOLD_DARK = "#8A6516";
const PAPER = "#F9F7F2";
const INK = "#1C1A17";
const MUTED = "#7A756C";
const LINE = "#E4DFD3";

const MAX_PRODUTOS = 60;

// ───────────────────────── Helpers de desenho ─────────────────────────
// Coordenadas no estilo "origem embaixo" (como no ReportLab do design original).

type Doc = jsPDF;
const Y = (v: number) => H - v;

function rect(d: Doc, x: number, yBottom: number, w: number, h: number, color: string, round = 0) {
  d.setFillColor(color);
  if (round) d.roundedRect(x, Y(yBottom) - h, w, h, round, round, "F");
  else d.rect(x, Y(yBottom) - h, w, h, "F");
}

function line(d: Doc, x1: number, y: number, x2: number, color: string, width = 0.6) {
  d.setDrawColor(color);
  d.setLineWidth(width);
  d.line(x1, Y(y), x2, Y(y));
}

function setFont(d: Doc, family: "helvetica" | "times", bold: boolean, size: number) {
  d.setFont(family, bold ? "bold" : "normal");
  d.setFontSize(size);
}

function text(d: Doc, s: string, x: number, y: number, align: "left" | "center" | "right" = "left") {
  d.text(s, x, Y(y), { align });
}

/** Texto com espaçamento entre letras (ex.: títulos em caixa alta). */
function spaced(
  d: Doc, s: string, x: number, y: number, family: "helvetica" | "times", bold: boolean,
  size: number, space: number, color: string, align: "left" | "center" | "right" = "left",
) {
  setFont(d, family, bold, size);
  d.setTextColor(color);
  const w = d.getTextWidth(s) + space * (s.length - 1);
  let px = x;
  if (align === "center") px = x - w / 2;
  else if (align === "right") px = x - w;
  d.text(s, px, Y(y), { charSpace: space });
}

/** Reduz a fonte até o texto caber na largura máxima (evita estouro com nomes longos). */
function fitFont(d: Doc, s: string, family: "helvetica" | "times", bold: boolean, size: number, maxW: number, minSize = 14) {
  let sz = size;
  setFont(d, family, bold, sz);
  while (d.getTextWidth(s) > maxW && sz > minSize) {
    sz -= 1;
    d.setFontSize(sz);
  }
  return sz;
}

/** Garante que o texto caiba: reduz a fonte até o mínimo e, se preciso, corta com "…". */
function caber(d: Doc, s: string, family: "helvetica" | "times", bold: boolean, size: number, maxW: number, minSize = 14) {
  const sz = fitFont(d, s, family, bold, size, maxW, minSize);
  let t = s;
  while (t.length > 1 && d.getTextWidth(t) > maxW) t = t.slice(0, -1);
  return { sz, t: t === s ? s : t.trimEnd() + "…" };
}

function wrap(d: Doc, s: string, maxW: number): string[] {
  return d.splitTextToSize(s, maxW) as string[];
}

function drawImageFit(
  d: Doc, data: string, w0: number | undefined, h0: number | undefined,
  x: number, yBottom: number, w: number, h: number,
) {
  const ratio = w0 && h0 ? w0 / h0 : w / h;
  let dw = w;
  let dh = w / ratio;
  if (dh > h) {
    dh = h;
    dw = h * ratio;
  }
  const dx = x + (w - dw) / 2;
  const dyTop = Y(yBottom) - h + (h - dh) / 2;
  const fmt = data.startsWith("data:image/png") ? "PNG" : "JPEG";
  d.addImage(data, fmt, dx, dyTop, dw, dh, undefined, "FAST");
}

function primeiroNome(n?: string) {
  const s = (n || "").trim();
  return s ? s.split(/\s+/)[0] : "";
}

function limpar(s?: string) {
  return (s || "").replace(/[\u0000-\u001F\u007F]/g, " ").trim();
}

function titulo(s: string) {
  return s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function footer(d: Doc, vend: Vendedor, n: number, total: number) {
  line(d, M, 17 * MM, W - M, LINE, 0.5);
  spaced(d, "CATÁLOGO CSM", M, 11 * MM, "helvetica", false, 7, 2, MUTED);
  setFont(d, "helvetica", false, 7.5);
  d.setTextColor(MUTED);
  const contato = [vend.nome, vend.telefone].filter(Boolean).join(" · ");
  text(d, contato, W - M - 22, 11 * MM, "right");
  setFont(d, "helvetica", true, 7.5);
  d.setTextColor(GOLD_DARK);
  text(d, `${n}/${total}`, W - M, 11 * MM, "right");
}

function label(d: Doc, x: number, y: number, s: string) {
  spaced(d, s, x, y, "helvetica", true, 6.8, 2.4, GOLD_DARK);
}

// ───────────────────────── Páginas ─────────────────────────

function capa(d: Doc, p: DadosProposta, loja: Loja) {
  d.addImage(p.assets.glowCover, "JPEG", 0, 0, W, H, undefined, "FAST");

  if (p.assets.logoDataUrl) {
    const ratio = (p.assets.logoH || 725) / (p.assets.logoW || 2590);
    const lw = 62 * MM;
    const lh = lw * ratio;
    d.addImage(p.assets.logoDataUrl, "PNG", (W - lw) / 2, Y(H - 62 * MM), lw, lh, undefined, "FAST");
    // nome da loja omitido: a logo já traz o texto "Campinas Shopping Móveis"
  } else {
    spaced(d, loja.nome.toUpperCase(), W / 2, H - 70 * MM, "helvetica", false, 9, 3.2, "#CFC8BA", "center");
  }

  line(d, M, H - 100 * MM, W - M, GOLD, 0.5);

  const nome = primeiroNome(p.cliente.nome);
  const cy = H * 0.5;
  const rot = p.tipo === "orcamento" ? "ORÇAMENTO EXCLUSIVO" : "SELEÇÃO EXCLUSIVA";
  spaced(d, nome ? `${rot} PARA` : rot, W / 2, cy + 34, "helvetica", true, 8, 4.5, GOLD_LIGHT, "center");
  if (nome) {
    const { sz, t } = caber(d, nome, "times", false, 50, W - 2 * M - 10, 22);
    d.setFontSize(sz);
    d.setTextColor("#FFFFFF");
    text(d, t, W / 2, cy - 12, "center");
    line(d, W / 2 - 16 * MM, cy - 34, W / 2 + 16 * MM, GOLD, 0.8);
  }
  const n = p.produtos.length;
  spaced(d, `${n} ${n === 1 ? "PEÇA SELECIONADA" : "PEÇAS SELECIONADAS"}`, W / 2, cy - 56, "helvetica", false, 9, 3.5, "#A59E90", "center");

  setFont(d, "helvetica", false, 9);
  d.setTextColor("#8E887B");
  text(d, p.data, W / 2, 62 * MM, "center");

  line(d, M, 40 * MM, W - M, GOLD, 0.5);

  // Bloco "preparado por" (com foto de perfil, se houver)
  const v = p.vendedor;
  let tx = M;
  if (v.fotoDataUrl) {
    const s = 16 * MM;
    d.addImage(v.fotoDataUrl, "PNG", M, Y(40 * MM - 4 * MM), s, s, undefined, "FAST");
    tx = M + s + 5 * MM;
  }
  spaced(d, "PREPARADO POR", tx, 33 * MM, "helvetica", false, 6.8, 2.2, "#7D776B");
  const vv = caber(d, v.nome, "times", true, 15, 80 * MM, 10);
  d.setFontSize(vv.sz);
  d.setTextColor("#FFFFFF");
  text(d, vv.t, tx, 26 * MM);
  setFont(d, "helvetica", false, 7.5);
  d.setTextColor("#8E887B");
  text(d, "Consultor(a) de vendas", tx, 21.5 * MM);
  setFont(d, "helvetica", false, 9);
  d.setTextColor(GOLD_LIGHT);
  if (v.telefone) text(d, v.telefone, W - M, 28 * MM, "right");
  text(d, loja.site, W - M, 23 * MM, "right");
}

interface Linha { label: string; valor: string }

function paginaCliente(
  d: Doc, p: DadosProposta, total: number, indice: Produto[], paginaBase: number,
): number {
  rect(d, 0, 0, W, H, PAPER);
  rect(d, 0, H - 4, W, 4, GOLD);

  const c = p.cliente;
  const v = p.vendedor;
  const rotCli = p.tipo === "orcamento" ? "ORÇAMENTO" : "SELEÇÃO";
  spaced(d, c.nome ? `${rotCli} PARA` : rotCli, M, H - 30 * MM, "helvetica", false, 8, 4, MUTED);
  let y = H - 44 * MM;
  if (c.nome) {
    const { sz, t } = caber(d, c.nome, "times", true, 34, W - 2 * M, 18);
    d.setFontSize(sz);
    d.setTextColor(INK);
    text(d, t, M, H - 44 * MM);
    line(d, M, H - 50 * MM, M + 22 * MM, GOLD, 0.8);
  }

  const itens: Linha[] = [
    { label: "TELEFONE", valor: limpar(c.telefone) },
    { label: "E-MAIL", valor: limpar(c.email) },
    { label: "DATA", valor: p.data },
    { label: "VENDEDOR RESPONSÁVEL", valor: [v.nome, v.telefone].filter(Boolean).join(" · ") },
    { label: "VALIDADE", valor: p.tipo === "orcamento" ? p.validade || "7 dias corridos a partir da data de emissão" : "" },
    { label: "OBSERVAÇÕES", valor: limpar(c.observacoes) },
  ].filter((i) => i.valor);

  y = H - 66 * MM;
  const cols = [M, W / 2 + 4 * MM];
  let maxLinhas = 0;
  itens.forEach((it, i) => {
    const x = cols[i % 2];
    const yy = y - Math.floor(i / 2) * 20 * MM;
    label(d, x, yy, it.label);
    setFont(d, "helvetica", false, 10.5);
    d.setTextColor(INK);
    const ls = wrap(d, it.valor, 80 * MM).slice(0, 2);
    ls.forEach((l, k) => text(d, l, x, yy - 6 * MM - k * 5 * MM));
    maxLinhas = Math.max(maxLinhas, Math.floor(i / 2) + 1);
  });

  // Índice das peças
  const y0 = H - 140 * MM;
  line(d, M, y0 + 8 * MM, W - M, GOLD, 0.5);
  label(d, M, y0, "PEÇAS SELECIONADAS");
  desenharIndice(d, p, indice, y0 - 6 * MM, paginaBase);
  footer(d, p.vendedor, 2, total);
  return 2;
}

/** Linhas do índice: miniatura + nome + resumo + nº da página. */
function desenharIndice(d: Doc, p: DadosProposta, itens: Produto[], topo: number, paginaBase: number) {
  const compacto = p.produtos.length > 4;
  const row = (compacto ? 22 : 34) * MM;
  const tw = (compacto ? 30 : 46) * MM;
  const th = (compacto ? 17 : 26) * MM;
  itens.forEach((pr, i) => {
    const top = topo - 2 * MM - i * row;
    rect(d, M, top - th, tw, th, "#EEEEEE");
    if (pr.imgDataUrl) drawImageFit(d, pr.imgDataUrl, pr.imgW, pr.imgH, M, top - th, tw, th);
    const tx = M + tw + 8 * MM;
    setFont(d, "helvetica", true, 8);
    d.setTextColor(GOLD_DARK);
    text(d, String(p.produtos.indexOf(pr) + 1).padStart(2, "0"), tx, top - 8 * MM);
    const nn = caber(d, pr.nome, "times", true, compacto ? 12 : 15, W - M - tx - 10 * MM - 10 * MM, 9);
    d.setFontSize(nn.sz);
    d.setTextColor(INK);
    text(d, nn.t, tx + 10 * MM, top - 8 * MM);
    setFont(d, "helvetica", false, 9);
    d.setTextColor(MUTED);
    const resumo = [pr.dimensoes, pr.material].filter(Boolean).join("  ·  ");
    if (resumo) text(d, wrap(d, resumo, W - M - tx - 10 * MM)[0], tx + 10 * MM, top - 15 * MM);
  });
}

function paginaProduto(d: Doc, p: DadosProposta, pr: Produto, idx: number, n: number, total: number) {
  rect(d, 0, 0, W, H, PAPER);
  const ph = 118 * MM;
  const py = H - 22 * MM - ph;
  rect(d, M, py, W - 2 * M, ph, "#EEEEEE");
  if (pr.imgDataUrl) {
    drawImageFit(d, pr.imgDataUrl, pr.imgW, pr.imgH, M + 4 * MM, py + 4 * MM, W - 2 * M - 8 * MM, ph - 8 * MM);
  }
  const nTot = String(p.produtos.length).padStart(2, "0");
  spaced(d, `PEÇA ${String(idx).padStart(2, "0")} DE ${nTot}`, M, H - 14 * MM, "helvetica", false, 7, 2.4, MUTED);

  line(d, 0, py - 8 * MM, W, GOLD, 0.8);
  const ty = py - 24 * MM;
  const chip = limpar(pr.linha);
  let chipW = 0;
  if (chip) {
    setFont(d, "helvetica", false, 8);
    chipW = d.getTextWidth(chip) + 14;
  }
  const pn = caber(d, pr.nome, "times", true, 28, W - 2 * M - chipW - 12, 14);
  d.setFontSize(pn.sz);
  d.setTextColor(INK);
  text(d, pn.t, M, ty);
  if (chip) {
    rect(d, W - M - chipW, ty - 1, chipW, 15, "#E7E0D2", 3);
    setFont(d, "helvetica", false, 8);
    d.setTextColor(MUTED);
    text(d, chip, W - M - chipW + 7, ty + 3.5);
  }

  let fy = ty - 14 * MM;
  if (pr.dimensoes || pr.material) {
    label(d, M, fy, "DIMENSÕES (L × P × A)");
    label(d, W / 2 + 4 * MM, fy, "MATERIAL");
    setFont(d, "helvetica", false, 11);
    d.setTextColor(INK);
    text(d, limpar(pr.dimensoes) || "—", M, fy - 6 * MM);
    text(d, wrap(d, limpar(pr.material) || "—", W / 2 - M - 4 * MM)[0], W / 2 + 4 * MM, fy - 6 * MM);
  } else {
    fy += 18 * MM;
  }

  if (pr.descricao) {
    const dy = fy - 18 * MM;
    label(d, M, dy, "DESCRIÇÃO");
    setFont(d, "helvetica", false, 10.5);
    d.setTextColor("#3E3A34");
    wrap(d, limpar(pr.descricao), W - 2 * M).slice(0, 7).forEach((l, k) => text(d, l, M, dy - 6 * MM - k * 5.4 * MM));
  }

  // Caixa comercial
  const by = 30 * MM;
  const bh = 26 * MM;
  rect(d, M, by, W - 2 * M, bh, "#FFFFFF", 3);
  d.setDrawColor(LINE);
  d.setLineWidth(0.6);
  d.roundedRect(M, Y(by) - bh, W - 2 * M, bh, 3, 3, "S");
  const cw = (W - 2 * M) / 4;
  const cells: [string, string][] = [
    ["QUANTIDADE", `${pr.quantidade || 1} ${(pr.quantidade || 1) === 1 ? "unidade" : "unidades"}`],
    ["VALOR", p.tipo === "orcamento" ? limpar(pr.preco) || "Sob consulta" : "Sob orçamento"],
    ["PAGAMENTO", p.tipo === "orcamento" ? limpar(pr.pagamento) || "A combinar" : "A combinar"],
    ["PRAZO", p.tipo === "orcamento" ? limpar(pr.prazo) || "A confirmar" : "A confirmar"],
  ];
  cells.forEach(([l, val], i) => {
    const x = M + i * cw + 6 * MM;
    label(d, x, by + bh - 8 * MM, l);
    const sz = fitFont(d, val, "times", true, 12.5, cw - 9 * MM, 8);
    d.setFontSize(sz);
    d.setTextColor(INK);
    text(d, val, x, by + bh - 16 * MM);
    if (i) {
      d.setDrawColor(LINE);
      d.setLineWidth(0.6);
      d.line(M + i * cw, Y(by + 5 * MM), M + i * cw, Y(by + bh - 5 * MM));
    }
  });
  footer(d, p.vendedor, n, total);
}

async function paginaFinal(d: Doc, p: DadosProposta, loja: Loja) {
  d.addImage(p.assets.glowFinal, "JPEG", 0, 0, W, H, undefined, "FAST");
  const v = p.vendedor;
  const nomeCli = primeiroNome(p.cliente.nome);

  spaced(d, "PRÓXIMOS PASSOS", W / 2, H - 38 * MM, "helvetica", true, 8, 4.5, GOLD_LIGHT, "center");
  const orc = p.tipo === "orcamento";
  setFont(d, "times", false, 34);
  d.setTextColor("#FFFFFF");
  text(d, orc ? "Gostou? Vamos fechar." : "Vamos montar seu orçamento?", W / 2, H - 54 * MM, "center");
  line(d, W / 2 - 16 * MM, H - 61 * MM, W / 2 + 16 * MM, GOLD, 0.8);

  const conds: [string, string][] = orc
    ? [
        ["VALIDADE DO ORÇAMENTO", p.validade || "7 dias corridos a partir da data de emissão"],
        ["PRAZO DE ENTREGA", "Informado na confirmação do pedido, conforme disponibilidade da peça"],
        ["FORMAS DE PAGAMENTO", "À vista ou parcelado, conforme combinado com o consultor"],
        ["GARANTIA", "Conforme política do fabricante e da CSM"],
      ]
    : [
        ["O QUE É ESTE DOCUMENTO", "Uma seleção das peças que você escolheu. Ela ainda não é um orçamento."],
        ["PRÓXIMO PASSO", "Seu consultor prepara o orçamento com valores, prazo de entrega e condições de pagamento"],
        ["COMO ACELERAR", "Chame seu consultor no WhatsApp pelo QR code abaixo"],
      ];
  let y = H - 82 * MM;
  conds.forEach(([l, val]) => {
    spaced(d, l, M + 10 * MM, y, "helvetica", true, 7, 2.4, GOLD_LIGHT);
    setFont(d, "helvetica", false, 10.5);
    d.setTextColor("#D8D2C4");
    wrap(d, val, W - 2 * M - 20 * MM).forEach((ln, k) => text(d, ln, M + 10 * MM, y - 6 * MM - k * 5 * MM));
    y -= 21 * MM;
  });

  // QR → WhatsApp do vendedor (fallback: loja)
  const numero = (v.whatsapp || "").replace(/\D/g, "") || loja.whatsapp;
  const nomes = p.produtos.slice(0, 3).map((x) => titulo(x.nome));
  const resto = p.produtos.length - nomes.length;
  const lista = nomes.join(", ") + (resto > 0 ? ` e mais ${resto}` : "");
  const quem = v.whatsapp ? `Olá ${v.nome}!` : "Olá!";
  const msg = orc
    ? `${quem} Vi o orçamento${nomeCli ? " de " + nomeCli : ""} com ${lista} e quero seguir.`
    : `${quem} Montei uma seleção${nomeCli ? " (" + nomeCli + ")" : ""} com ${lista} e quero o orçamento.`;
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
  const qrData = await QRCode.toDataURL(url, { margin: 1, width: 600, color: { dark: BG_DARK, light: "#FFFFFF" } });

  const q = 46 * MM;
  const qx = (W - q) / 2;
  const qy = 62 * MM;
  rect(d, qx - 4 * MM, qy - 4 * MM, q + 8 * MM, q + 8 * MM, "#FFFFFF", 4);
  d.addImage(qrData, "PNG", qx, Y(qy) - q, q, q);
  d.link(qx - 4 * MM, Y(qy) - q - 4 * MM, q + 8 * MM, q + 8 * MM, { url });
  spaced(d, v.whatsapp ? `FALE COM ${v.nome.toUpperCase()} NO WHATSAPP` : "FALE COM A NOSSA EQUIPE NO WHATSAPP", W / 2, qy - 11 * MM, "helvetica", true, 8, 3, GOLD_LIGHT, "center");
  setFont(d, "helvetica", false, 9);
  d.setTextColor("#A59E90");
  const contato = [v.whatsapp ? v.telefone : "", loja.site].filter(Boolean).join("  ·  ");
  text(d, contato, W / 2, qy - 17 * MM, "center");

  setFont(d, "helvetica", false, 7);
  d.setTextColor("#6F6A5F");
  text(d, orc ? "Valores e prazos conforme este orçamento. Imagens ilustrativas." : "Seleção de peças, sem valores. O orçamento é preparado pelo consultor. Imagens ilustrativas.", W / 2, 12 * MM, "center");
  return url;
}

// ───────────────────────── API pública ─────────────────────────

/** Gera a proposta e devolve o PDF como Blob-like (ArrayBuffer) + metadados úteis. */
export async function gerarPropostaPdf(dados: DadosProposta): Promise<{ pdf: ArrayBuffer; paginas: number; whatsappUrl: string }> {
  if (!dados.produtos.length) throw new Error("Proposta sem produtos");
  const p: DadosProposta = { ...dados, tipo: dados.tipo || "selecao", produtos: dados.produtos.slice(0, MAX_PRODUTOS) };
  const loja: Loja = { ...LOJA_PADRAO, ...(dados.loja || {}) };

  const d = new jsPDF({ unit: "pt", format: "a4", compress: true });
  d.setProperties({
    title: `${p.tipo === "orcamento" ? "Orçamento" : "Seleção"} CSM${p.cliente.nome ? " · " + primeiroNome(p.cliente.nome) : ""}`,
    author: `${p.vendedor.nome} · ${loja.nome}`,
  });

  // Quantas peças cabem no índice da página do cliente? (o resto continua em páginas de índice)
  const compacto = p.produtos.length > 4;
  const rowH = (compacto ? 22 : 34) * MM;
  const espaco1 = H - 140 * MM - 6 * MM - 17 * MM - 4 * MM;
  const cap1 = Math.max(1, Math.floor(espaco1 / rowH));
  const espaco2 = H - 30 * MM - 17 * MM - 4 * MM;
  const cap2 = Math.max(1, Math.floor(espaco2 / rowH));
  const resto = Math.max(0, p.produtos.length - cap1);
  const paginasExtra = Math.ceil(resto / cap2);
  const total = 1 + 1 + paginasExtra + p.produtos.length + 1;

  capa(d, p, loja);
  d.addPage();
  paginaCliente(d, p, total, p.produtos.slice(0, cap1), 2);
  for (let e = 0; e < paginasExtra; e++) {
    d.addPage();
    rect(d, 0, 0, W, H, PAPER);
    rect(d, 0, H - 4, W, 4, GOLD);
    label(d, M, H - 24 * MM, "PEÇAS SELECIONADAS (CONTINUAÇÃO)");
    desenharIndiceContinuacao(d, p, p.produtos.slice(cap1 + e * cap2, cap1 + (e + 1) * cap2), cap1 + e * cap2);
    footer(d, p.vendedor, 3 + e, total);
  }
  p.produtos.forEach((pr, i) => {
    d.addPage();
    paginaProduto(d, p, pr, i + 1, 3 + paginasExtra + i, total);
  });
  d.addPage();
  const whatsappUrl = await paginaFinal(d, p, loja);

  return { pdf: d.output("arraybuffer"), paginas: total, whatsappUrl };
}

function desenharIndiceContinuacao(d: Doc, p: DadosProposta, itens: Produto[], offset: number) {
  const row = 22 * MM;
  const tw = 30 * MM;
  const th = 17 * MM;
  itens.forEach((pr, i) => {
    const top = H - 30 * MM - i * row;
    rect(d, M, top - th, tw, th, "#EEEEEE");
    if (pr.imgDataUrl) drawImageFit(d, pr.imgDataUrl, pr.imgW, pr.imgH, M, top - th, tw, th);
    const tx = M + tw + 8 * MM;
    setFont(d, "helvetica", true, 8);
    d.setTextColor(GOLD_DARK);
    text(d, String(offset + i + 1).padStart(2, "0"), tx, top - 8 * MM);
    const nn = caber(d, pr.nome, "times", true, 12, W - M - tx - 10 * MM - 10 * MM, 9);
    d.setFontSize(nn.sz);
    d.setTextColor(INK);
    text(d, nn.t, tx + 10 * MM, top - 8 * MM);
    setFont(d, "helvetica", false, 9);
    d.setTextColor(MUTED);
    const resumo = [pr.dimensoes, pr.material].filter(Boolean).join("  ·  ");
    if (resumo) text(d, wrap(d, resumo, W - M - tx - 10 * MM)[0], tx + 10 * MM, top - 15 * MM);
  });
}
