"""
Renderiza só a capa em PNG para os 3 casos de validação.
Uso: py preview_capa.py
Saída: scripts/_tmp/capa_*.png
"""
import sys, io, os
from pathlib import Path

# Ajuste de path para importar gerar_pdf
sys.path.insert(0, str(Path(__file__).parent))

from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.pagesizes import A4
import gerar_pdf as G

OUT = Path(__file__).parent / "_tmp"
OUT.mkdir(exist_ok=True)

VENDEDOR = {
    "nome": "ALEXA BRUCHELAS",
    "cargo": "Consultora de Vendas",
    "telefone": "(19) 99293-6703",
    "email": "alexa@csm.com.br",
}

CASOS = [
    ("sem_cliente",   None,                                          3),
    ("debora",        "Debora",                                      3),
    ("nome_longo",    "Maria Fernanda de Albuquerque Souza",         3),
]

def render_capa_png(cliente_nome, n_produtos, out_path: Path):
    buf = io.BytesIO()
    c   = rl_canvas.Canvas(buf, pagesize=A4)
    G.page_cover(c, VENDEDOR, cliente_nome or "", n_produtos,
                 "05 de novembro de 2026", str(OUT / "glow_prev.jpg"))
    c.save()
    buf.seek(0)

    # Converte primeira página PDF → PNG via pypdf + pillow (ou reportlab's renderPM)
    try:
        from reportlab.graphics import renderPM
        # reportlab renderPM só faz drawings, não canvas pages → usa pdf2image fallback
        raise ImportError("use pdf2image")
    except Exception:
        pass

    try:
        from pdf2image import convert_from_bytes
        pages = convert_from_bytes(buf.getvalue(), dpi=120, first_page=1, last_page=1)
        pages[0].save(str(out_path), "PNG")
        return True
    except ImportError:
        pass

    # Fallback: pymupdf (fitz)
    try:
        import fitz
        doc  = fitz.open(stream=buf.getvalue(), filetype="pdf")
        page = doc[0]
        pix  = page.get_pixmap(dpi=120)
        pix.save(str(out_path))
        doc.close()
        return True
    except ImportError:
        pass

    return False


if __name__ == "__main__":
    ok_any = False
    for slug, nome, n in CASOS:
        dst = OUT / f"capa_{slug}.png"
        ok  = render_capa_png(nome, n, dst)
        if ok:
            print(f"OK  > {dst}")
            ok_any = True
        else:
            print(f"SKIP {slug} — instale pdf2image ou pymupdf")

    if not ok_any:
        print("\nNenhum conversor disponível. Instale: py -m pip install pymupdf")
