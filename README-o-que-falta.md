# O Que Ainda Falta

Catálogos com problemas na extração — deixados para o final.
Os demais estão sendo catalogados normalmente.

---

## Tipo 1 — PDF escaneado (sem texto)

O PDF é uma imagem escaneada. Nenhum texto pode ser extraído automaticamente.
Precisará de OCR ou de digitação manual dos produtos.

| Catálogo | Pasta | Observação |
|---|---|---|
| ALVES 2023 | `ALVES 2023 CORRETO` | 46 páginas, 100% imagem — zero texto extraível |

---

## Tipo 2 — Texto quebrado (letra por letra)

O PDF tem texto, mas a extração retorna cada caractere em uma linha separada.
O conteúdo existe mas é inviável de parsear automaticamente.

| Catálogo | Pasta | Observação |
|---|---|---|
| AMERIBOX 2025 | `AMERIBOX 2025` | Texto fragmentado letra a letra — 7 produtos já no banco mas extração incompleta |

---

## Como resolver (quando chegar a hora)

**PDF escaneado:**
1. Abrir o PDF e fotografar/exportar cada página como imagem
2. Mandar para GPT-4o Vision pedindo: nome do produto, dimensões, material, página
3. Criar script de inserção com os dados retornados

**Texto quebrado:**
1. Juntar as letras do `_texto_extraido.txt` com um script de normalização
2. Ou abrir o PDF manualmente e copiar o texto visualmente
3. Inserir no banco via script

---

## Catálogos no disco ainda não importados

Pastas existentes em `catalogos separados\` que ainda não têm entrada no banco:

- BEL METAIS 2025
- CYRNE 2025
- Faenza 2025
- Ferguile 2025
- Inovar 2025
- IRIMAR 2025
- Kasaleve 2025
- LID Outubro 2025
- Marcobin 2025
- Matrezan 2025_NOV
- NUBE 2025
- Prisma 2025
- Quality Qualita 2025
- SAMEC 2025
- Tapetes SC 2025
- TESSUTI UNIQ 2025
- TESSUTTI 2025
- UBÊ 2025
- Universum Lançamentos 2025
- UNIVERSUN 2025
- UNIVERSUN BASIC 2025
