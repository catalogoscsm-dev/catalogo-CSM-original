"""
CSM Decor — Gerador de Proposta em PDF
Entrada : JSON em stdin  { produtoIds, vendedor, cliente?, condicoes? }
Saída   : bytes PDF em stdout
"""

import sys, json, io, os, re, math
from pathlib import Path
from urllib.parse import unquote, quote

import numpy as np
from PIL import Image as _PI
import qrcode

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader, simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── Fontes ────────────────────────────────────────────────────────────────────
_FONT_DIR = Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts"
_FONTS = {
    "Serif":  ("georgia.ttf",  "times.ttf"),
    "SerifB": ("georgiab.ttf", "timesbd.ttf"),
}
for alias, candidates in _FONTS.items():
    for name in candidates:
        p = _FONT_DIR / name
        if p.exists():
            pdfmetrics.registerFont(TTFont(alias, str(p)))
            break

# ── Paleta ────────────────────────────────────────────────────────────────────
W, H       = A4
BG_DARK    = HexColor("#0F0D0A")
GOLD       = HexColor("#B8892B")
GOLD_LIGHT = HexColor("#D4A94A")
GOLD_DARK  = HexColor("#8A6516")
PAPER      = HexColor("#F9F7F2")
INK        = HexColor("#1C1A17")
MUTED      = HexColor("#7A756C")
M          = 18 * mm

# ── Caminhos ─────────────────────────────────────────────────────────────────
ROOT   = Path(__file__).parent.parent          # catalogo-digital/
PUBLIC = ROOT / "public"
DATA   = ROOT / "data" / "static-data.json"
LOGO   = PUBLIC / "logo-csm.png"
TMP    = ROOT / "scripts" / "_tmp"
TMP.mkdir(exist_ok=True)

# ── Utilitários ───────────────────────────────────────────────────────────────

def img_path(url: str) -> Path | None:
    """Converte URL /imagens/... → Path absoluto em public/."""
    if not url:
        return None
    decoded  = unquote(url)
    relative = decoded.lstrip("/")
    p = PUBLIC / relative
    return p if p.exists() else None


def glow_bg(out: Path, cy_frac: float, rx: float, ry: float, peak: float,
            base=(15, 13, 10), tint=(212, 169, 74), scale=1.5) -> str:
    """Gera fundo escuro com luz radial suave (raster + dither)."""
    w, h = int(W * scale), int(H * scale)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    cx = w / 2
    cy = h * cy_frac
    d  = np.sqrt(((xx - cx) / (rx * scale)) ** 2 + ((yy - cy) / (ry * scale)) ** 2)
    k  = np.clip(1 - d, 0, 1)
    k  = k * k * (3 - 2 * k)   # smoothstep
    k  = (k ** 1.35) * peak
    img = np.zeros((h, w, 3), np.float32)
    for i in range(3):
        img[..., i] = base[i] + (tint[i] - base[i]) * k
    rng = np.random.default_rng(7)
    img += rng.normal(0, 0.9, img.shape)
    _PI.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(out, quality=92)
    return str(out)


def spaced(c, x, y, text, font, size, space, color, align="left"):
    """Desenha texto com espaçamento de caractere personalizado."""
    c.saveState()
    c.setFillColor(color)
    tw = pdfmetrics.stringWidth(text, font, size) + space * max(len(text) - 1, 0)
    if align == "center":
        x = x - tw / 2
    elif align == "right":
        x = x - tw
    t = c.beginText(x, y)
    t.setFont(font, size)
    t.setCharSpace(space)
    t.textLine(text)
    c.drawText(t)
    c.restoreState()


def hline(c, y, x1=None, x2=None, color=None, width=0.6):
    color = color or GOLD
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.line(x1 if x1 is not None else M, y, x2 if x2 is not None else W - M, y)


def label(c, x, y, text):
    spaced(c, x, y, text, "Helvetica-Bold", 6.8, 2.4, GOLD_DARK)


def footer(c, n: int, total: int, vendedor_nome: str, vend_tel: str):
    c.setStrokeColor(HexColor("#E4DFD3"))
    c.setLineWidth(0.5)
    c.line(M, 17 * mm, W - M, 17 * mm)
    spaced(c, M, 11 * mm, "CATÁLOGO CSM", "Helvetica", 7, 2, MUTED)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(W - M - 22, 11 * mm, f"{vendedor_nome} · {vend_tel}" if vend_tel else vendedor_nome)
    c.setFillColor(GOLD_DARK)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawRightString(W - M, 11 * mm, f"{n}/{total}")


def safe_draw_image(c, img_src, x, y, w, h, preserve=True):
    """Desenha imagem ignorando erros silenciosamente."""
    try:
        if img_src is None:
            raise ValueError("no src")
        reader = ImageReader(str(img_src))
        if preserve:
            c.drawImage(reader, x, y, w, h, preserveAspectRatio=True, anchor="c", mask="auto")
        else:
            c.drawImage(reader, x, y, w, h, mask="auto")
    except Exception:
        c.setFillColor(HexColor("#DDDDDD"))
        c.rect(x, y, w, h, stroke=0, fill=1)


# ── Páginas ───────────────────────────────────────────────────────────────────

def _fit_name_cover(c, text: str, max_w: float, font: str,
                    size_max: int = 50, size_min: int = 30) -> tuple[str, int]:
    """Reduz fonte de size_max até size_min para caber em max_w.
    Retorna (texto_linha1, tamanho) — se ainda não couber, quebra em 2 linhas."""
    for size in range(size_max, size_min - 1, -1):
        if pdfmetrics.stringWidth(text, font, size) <= max_w:
            return text, size
    # ainda não coube no mínimo → quebra em 2 palavras
    words = text.split()
    mid   = len(words) // 2
    line1 = " ".join(words[:mid])
    line2 = " ".join(words[mid:])
    return f"{line1}\n{line2}", size_min


def _title_case(nome: str) -> str:
    """'ALEXA BRUCHELAS' → 'Alexa Bruchelas' (preserva partículas minúsculas)."""
    particulas = {"de", "da", "do", "das", "dos", "e", "em", "a", "o"}
    words = nome.strip().split()
    result = []
    for i, w in enumerate(words):
        result.append(w.capitalize() if (i == 0 or w.lower() not in particulas) else w.lower())
    return " ".join(result)


def page_cover(c, v: dict, cliente_nome: str, n_produtos: int, data: str, glow_path: str):
    glow_bg(Path(glow_path), 0.50, 330, 470, 0.34)
    c.drawImage(glow_path, 0, 0, W, H)

    # ── Logo: lê dimensões reais para preservar proporção ────────────────────
    if LOGO.exists():
        logo_img  = _PI.open(str(LOGO))
        logo_w_px, logo_h_px = logo_img.size
        lw = 62 * mm
        lh = lw * logo_h_px / logo_w_px          # proporção exata do arquivo
        lx = (W - lw) / 2
        ly = H - 50 * mm - lh
        c.drawImage(str(LOGO), lx, ly, lw, lh, mask="auto")
        spaced(c, W / 2, ly - 9 * mm, "CAMPINAS SHOPPING MÓVEIS",
               "Helvetica", 7.6, 3.2, HexColor("#CFC8BA"), "center")
        line_y = ly - 18 * mm
    else:
        line_y = H - 100 * mm

    hline(c, line_y, color=GOLD, width=0.5)

    # ── Título central ───────────────────────────────────────────────────────
    tem_cliente = bool(cliente_nome and cliente_nome.strip())
    if tem_cliente:
        rotulo = "PROPOSTA EXCLUSIVA PARA"
        titulo = cliente_nome.strip()
    else:
        rotulo = "SELEÇÃO EXCLUSIVA"
        titulo = "Para você"

    max_name_w = W * 0.80
    titulo_fit, font_size = _fit_name_cover(c, titulo, max_name_w, "Serif")
    linhas = titulo_fit.split("\n")

    cy = H * 0.50
    spaced(c, W / 2, cy + 34, rotulo, "Helvetica-Bold", 8, 4.5, GOLD_LIGHT, "center")

    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Serif", font_size)
    line_h = font_size * 1.1
    total_h = len(linhas) * line_h
    for i, ln in enumerate(linhas):
        y_ln = cy - 10 - i * line_h + (total_h - line_h) / 2
        c.drawCentredString(W / 2, y_ln, ln)

    # Linha ornamental abaixo do nome
    name_bottom = cy - 10 - (len(linhas) - 1) * line_h - 18
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(W / 2 - 16 * mm, name_bottom, W / 2 + 16 * mm, name_bottom)

    piece_label = f"{n_produtos} PEÇA{'S' if n_produtos != 1 else ''} SELECIONADA{'S' if n_produtos != 1 else ''}"
    spaced(c, W / 2, name_bottom - 18, piece_label, "Helvetica", 9, 3.5, HexColor("#A59E90"), "center")

    # ── Data ─────────────────────────────────────────────────────────────────
    c.setFillColor(HexColor("#8E887B"))
    c.setFont("Helvetica", 9)
    c.drawCentredString(W / 2, 62 * mm, data)

    # ── Rodapé da capa ───────────────────────────────────────────────────────
    vendedor_nome_tc = _title_case(v["nome"])
    hline(c, 40 * mm, color=GOLD, width=0.5)
    spaced(c, M, 33 * mm, "PREPARADO POR", "Helvetica", 6.8, 2.2, HexColor("#7D776B"))
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("SerifB", 15)
    c.drawString(M, 26 * mm, vendedor_nome_tc)
    c.setFillColor(HexColor("#8E887B"))
    c.setFont("Helvetica", 7.5)
    c.drawString(M, 21.5 * mm, v.get("cargo") or "Consultor(a) de vendas")

    if v.get("telefone"):
        c.setFillColor(GOLD_LIGHT)
        c.setFont("Helvetica", 9)
        c.drawRightString(W - M, 28 * mm, v["telefone"])
    c.setFillColor(GOLD_LIGHT)
    c.setFont("Helvetica", 9)
    c.drawRightString(W - M, 23 * mm, "csmdecor.com.br")
    c.showPage()


def page_client(c, v: dict, cl: dict | None, produtos: list, total: int, data: str):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.rect(0, H - 4, W, 4, stroke=0, fill=1)

    nome_completo = cl.get("nome", "") if cl else ""
    spaced(c, M, H - 30 * mm, "PROPOSTA PARA", "Helvetica", 8, 4, MUTED)
    c.setFillColor(INK)
    c.setFont("SerifB", 34)
    c.drawString(M, H - 44 * mm, nome_completo or "—")
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(M, H - 50 * mm, M + 22 * mm, H - 50 * mm)

    y = H - 66 * mm
    cols = [M, W / 2 + 4 * mm]
    items = []
    if cl:
        if cl.get("telefone"):  items.append(("TELEFONE",  cl["telefone"]))
        if cl.get("email"):     items.append(("E-MAIL",    cl["email"]))
        if cl.get("empresa"):   items.append(("EMPRESA",   cl["empresa"]))
        if cl.get("notas"):     items.append(("OBSERVAÇÕES", cl["notas"]))
    items.append(("DATA", data))
    items.append(("VENDEDOR RESPONSÁVEL", f"{v['nome']}" + (f" · {v['telefone']}" if v.get("telefone") else "")))

    for i, (l, val) in enumerate(items):
        x  = cols[i % 2]
        yy = y - (i // 2) * 20 * mm
        label(c, x, yy, l)
        c.setFillColor(INK)
        c.setFont("Helvetica", 10.5)
        for k, line in enumerate(simpleSplit(val, "Helvetica", 10.5, 80 * mm)):
            c.drawString(x, yy - 6 * mm - k * 5 * mm, line)

    # Índice das peças
    y0 = H - 148 * mm
    hline(c, y0 + 8 * mm, color=GOLD, width=0.5)
    label(c, M, y0, "PEÇAS SELECIONADAS")
    row_h = 32 * mm
    for i, p in enumerate(produtos):
        top  = y0 - 8 * mm - i * row_h
        thumb = img_path(p.get("imagens", [None])[0]) if p.get("imagens") else None
        c.setFillColor(HexColor("#EEEEEE"))
        c.rect(M, top - 24 * mm, 44 * mm, 24 * mm, stroke=0, fill=1)
        safe_draw_image(c, thumb, M, top - 24 * mm, 44 * mm, 24 * mm)
        c.setFillColor(GOLD_DARK)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(M + 50 * mm, top - 7 * mm, f"0{i + 1}")
        c.setFillColor(INK)
        c.setFont("SerifB", 14)
        c.drawString(M + 60 * mm, top - 7 * mm, p["nome"].upper())
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8.5)
        dim_mat = ""
        if p.get("dimensoes"): dim_mat += p["dimensoes"]
        mat = _filter_material(p.get("material"))
        if mat: dim_mat += ("  ·  " if dim_mat else "") + mat
        c.drawString(M + 60 * mm, top - 14 * mm, dim_mat)
        c.drawString(M + 60 * mm, top - 20 * mm, f"Página {i + 3}")

    footer(c, 2, total, v["nome"], v.get("telefone", ""))
    c.showPage()


def _filter_material(val: str | None) -> str | None:
    """Remove materiais que são apenas códigos de tamanho (P, M, G)."""
    if not val:
        return None
    v = val.strip()
    if re.fullmatch(r"[A-Za-z]", v):
        return None
    return v


def _fmt_preco(preco_str: str | None, preco_min, preco_max) -> str:
    """Formata preço para exibição."""
    if preco_str:
        return preco_str
    def fmt(v): return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    if preco_min and preco_max and preco_min != preco_max:
        return f"{fmt(preco_min)} – {fmt(preco_max)}"
    if preco_min or preco_max:
        return fmt(preco_min or preco_max)
    return "Sob consulta"


def page_product(c, p: dict, idx: int, n: int, total: int, v: dict, cond: dict | None):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # ── Painel da foto ────────────────────────────────────────────────────────
    imgs = p.get("imagens") or []
    img1 = img_path(imgs[0]) if len(imgs) > 0 else None
    img2 = img_path(imgs[1]) if len(imgs) > 1 else None

    ph = 115 * mm
    py = H - 22 * mm - ph

    if img2:
        # Layout duplo lado a lado
        gap = 3 * mm
        iw  = (W - 2 * M - gap) / 2
        c.setFillColor(HexColor("#EEEEEE"))
        c.rect(M,          py, iw, ph, stroke=0, fill=1)
        c.rect(M + iw + gap, py, iw, ph, stroke=0, fill=1)
        safe_draw_image(c, img1, M + 2,           py + 2, iw - 4, ph - 4)
        safe_draw_image(c, img2, M + iw + gap + 2, py + 2, iw - 4, ph - 4)
    else:
        c.setFillColor(HexColor("#EEEEEE"))
        c.rect(M, py, W - 2 * M, ph, stroke=0, fill=1)
        safe_draw_image(c, img1, M + 4 * mm, py + 4 * mm, W - 2 * M - 8 * mm, ph - 8 * mm)

    spaced(c, M, H - 14 * mm, f"PEÇA {idx:02d} DE {total - 2:02d}", "Helvetica", 7, 2.4, MUTED)

    hline(c, py - 8 * mm, x1=0, x2=W, width=0.8)

    # ── Título ────────────────────────────────────────────────────────────────
    ty = py - 24 * mm
    c.setFillColor(INK)
    c.setFont("SerifB", 26)
    c.drawString(M, ty, p["nome"].upper())

    # Chip da linha
    chip = p.get("catalogo_nome") or ""
    if chip:
        cw = pdfmetrics.stringWidth(chip, "Helvetica", 8) + 14
        c.setFillColor(HexColor("#E7E0D2"))
        c.roundRect(W - M - cw, ty - 1, cw, 15, 3, stroke=0, fill=1)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 8)
        c.drawString(W - M - cw + 7, ty + 3.5, chip)

    # ── Campos técnicos ───────────────────────────────────────────────────────
    fy   = ty - 14 * mm
    mat  = _filter_material(p.get("material"))
    dim  = p.get("dimensoes")
    acab = p.get("acabamento")
    cod  = p.get("codigo")

    tech_items = []
    if dim:  tech_items.append(("DIMENSÕES", dim))
    if mat:  tech_items.append(("MATERIAL",  mat))
    if acab: tech_items.append(("ACABAMENTO", acab))
    if cod:  tech_items.append(("CÓDIGO",    cod))

    col_w = (W - 2 * M) / max(len(tech_items), 1)
    for i, (lbl, val) in enumerate(tech_items):
        x = M + i * col_w
        label(c, x, fy, lbl)
        c.setFillColor(INK)
        c.setFont("Helvetica", 10)
        for k, line in enumerate(simpleSplit(val, "Helvetica", 10, col_w - 2 * mm)):
            c.drawString(x, fy - 6 * mm - k * 4.8 * mm, line)

    # ── Descrição livre ───────────────────────────────────────────────────────
    desc = (p.get("texto_livre") or "").strip()
    if not desc:
        desc = (p.get("descricao") or "").strip()
        # Oculta se for apenas categoria (1-2 palavras sem espaço ou texto genérico)
        if len(desc.split()) <= 2 and not any(c in desc for c in ",.;"):
            desc = ""

    dy = fy - 20 * mm
    if desc:
        label(c, M, dy, "DESCRIÇÃO")
        c.setFillColor(HexColor("#3E3A34"))
        c.setFont("Helvetica", 10)
        for k, line in enumerate(simpleSplit(desc, "Helvetica", 10, W - 2 * M)):
            c.drawString(M, dy - 6 * mm - k * 5.2 * mm, line)

    # ── Caixa comercial ───────────────────────────────────────────────────────
    by  = 30 * mm
    bh  = 26 * mm
    c.setFillColor(HexColor("#FFFFFF"))
    c.setStrokeColor(HexColor("#E4DFD3"))
    c.setLineWidth(0.6)
    c.roundRect(M, by, W - 2 * M, bh, 3, stroke=1, fill=1)

    preco_str = _fmt_preco(
        (cond or {}).get("preco"),
        p.get("preco_min"),
        p.get("preco_max"),
    )
    pagamento = (cond or {}).get("pagamento") or "A combinar"
    prazo     = (cond or {}).get("prazo")     or "A confirmar"

    cells = [
        ("VALOR",      preco_str),
        ("PAGAMENTO",  pagamento),
        ("PRAZO",      prazo),
        ("QUANTIDADE", "1 unidade"),
    ]
    cellw = (W - 2 * M) / 4
    for i, (lbl, val) in enumerate(cells):
        x = M + i * cellw + 6 * mm
        label(c, x, by + bh - 8 * mm, lbl)
        c.setFillColor(INK)
        c.setFont("SerifB", 11.5)
        c.drawString(x, by + bh - 16 * mm, val)
        if i:
            c.setStrokeColor(HexColor("#E4DFD3"))
            c.line(M + i * cellw, by + 5 * mm, M + i * cellw, by + bh - 5 * mm)

    footer(c, n, total, v["nome"], v.get("telefone", ""))
    c.showPage()


def page_final(c, v: dict, cliente_nome: str, produtos: list, total: int, validade: str, glow_path: str):
    glow_bg(Path(glow_path), 0.42, 320, 430, 0.26)
    c.drawImage(glow_path, 0, 0, W, H)

    spaced(c, W / 2, H - 38 * mm, "PRÓXIMOS PASSOS", "Helvetica-Bold", 8, 4.5, GOLD_LIGHT, "center")
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Serif", 34)
    c.drawCentredString(W / 2, H - 54 * mm, "Gostou? Vamos fechar.")
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.line(W / 2 - 16 * mm, H - 61 * mm, W / 2 + 16 * mm, H - 61 * mm)

    conds_txt = [
        ("VALIDADE DA PROPOSTA", validade or "7 dias corridos a partir da data de emissão"),
        ("PRAZO DE ENTREGA", "Informado na confirmação do pedido, conforme disponibilidade da peça"),
        ("FORMAS DE PAGAMENTO", "À vista ou parcelado, a combinar com o consultor"),
        ("GARANTIA", "Conforme política do fabricante e da CSM"),
    ]
    y = H - 82 * mm
    for lbl, val in conds_txt:
        spaced(c, M + 10 * mm, y, lbl, "Helvetica-Bold", 7, 2.4, GOLD_LIGHT)
        c.setFillColor(HexColor("#D8D2C4"))
        c.setFont("Helvetica", 10)
        for k, line in enumerate(simpleSplit(val, "Helvetica", 10, W - 2 * M - 20 * mm)):
            c.drawString(M + 10 * mm, y - 6 * mm - k * 5 * mm, line)
        y -= 20 * mm

    # QR code WhatsApp
    tel_raw = re.sub(r"\D", "", v.get("telefone") or "")
    wa_num  = f"55{tel_raw}" if tel_raw and not tel_raw.startswith("55") else tel_raw
    nomes_peças = ", ".join(p["nome"].title() for p in produtos)
    msg = f"Olá {v['nome']}! Vi a proposta de {cliente_nome} com {nomes_peças} e quero seguir."
    url = f"https://wa.me/{wa_num}?text={quote(msg)}" if wa_num else "https://csmdecor.com.br"

    qr = qrcode.QRCode(border=1, box_size=10)
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#0F0D0A", back_color="#FFFFFF").convert("RGB")
    buf = io.BytesIO()
    qr_img.save(buf, "PNG")
    buf.seek(0)

    q  = 46 * mm
    qx = (W - q) / 2
    qy = 62 * mm
    c.setFillColor(HexColor("#FFFFFF"))
    c.roundRect(qx - 4 * mm, qy - 4 * mm, q + 8 * mm, q + 8 * mm, 4, stroke=0, fill=1)
    c.drawImage(ImageReader(buf), qx, qy, q, q)
    c.linkURL(url, (qx - 4 * mm, qy - 4 * mm, qx + q + 4 * mm, qy + q + 4 * mm))

    primeiro_nome = _title_case(v["nome"]).split()[0]
    spaced(c, W / 2, qy - 11 * mm,
           f"FALE COM {primeiro_nome.upper()} NO WHATSAPP",
           "Helvetica-Bold", 8, 3, GOLD_LIGHT, "center")
    c.setFillColor(HexColor("#A59E90"))
    c.setFont("Helvetica", 9)
    c.drawCentredString(W / 2, qy - 17 * mm,
                        (v.get("telefone") or "") + "  ·  csmdecor.com.br")

    c.setFillColor(HexColor("#6F6A5F"))
    c.setFont("Helvetica", 7)
    c.drawCentredString(W / 2, 12 * mm,
                        "Valores e prazos sujeitos à confirmação. Imagens meramente ilustrativas.")
    c.showPage()


# ── Entry-point ───────────────────────────────────────────────────────────────

def build(payload: dict) -> bytes:
    produto_ids: list[int] = payload["produtoIds"]
    v:  dict       = payload["vendedor"]
    cl: dict | None = payload.get("cliente")
    cond: dict | None = payload.get("condicoes")
    data_str: str  = payload.get("data", "")
    validade: str  = payload.get("validade", "7 dias corridos a partir da data de emissão")

    with open(DATA, encoding="utf-8") as f:
        raw = json.load(f)

    id_map  = {p["id"]: p for p in raw["produtos"]}
    produtos = [id_map[i] for i in produto_ids if i in id_map]
    if not produtos:
        raise ValueError("Nenhum produto encontrado para os IDs fornecidos.")

    cliente_nome = (cl.get("nome") or "") if cl else v.get("nome", "Cliente")

    n_pages = 1 + (1 if cl else 0) + len(produtos) + 1   # capa + cliente? + produtos + final
    total   = n_pages

    buf = io.BytesIO()
    c   = canvas.Canvas(buf, pagesize=A4)
    c.setTitle(f"Proposta CSM · {cliente_nome}")
    c.setAuthor(f"{v['nome']} · Campinas Shopping Móveis")

    glow1 = str(TMP / "glow_cover.jpg")
    glow2 = str(TMP / "glow_final.jpg")

    page_cover(c, v, cliente_nome, len(produtos), data_str, glow1)

    if cl and cl.get("nome"):
        page_client(c, v, cl, produtos, total, data_str)

    base_n = 2 + (1 if cl and cl.get("nome") else 0)
    for i, p in enumerate(produtos):
        page_product(c, p, i + 1, base_n + i, total, v, cond)

    page_final(c, v, cliente_nome, produtos, total, validade, glow2)

    c.save()
    return buf.getvalue()


if __name__ == "__main__":
    # Aceita JSON via: (1) arquivo passado como argumento ou (2) stdin
    if len(sys.argv) > 1:
        with open(sys.argv[1], encoding="utf-8-sig") as f:
            raw = f.read()
    else:
        raw = sys.stdin.buffer.read().decode("utf-8-sig")
    payload = json.loads(raw)
    pdf_bytes = build(payload)
    sys.stdout.buffer.write(pdf_bytes)
