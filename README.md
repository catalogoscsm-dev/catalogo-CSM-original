# Catálogo Digital CSM

Catálogo digital da **CSM — Campinas Shopping Móveis**.
Consulta de produtos de móveis e decoração extraídos de PDFs de fornecedores.

**Site ao vivo:** https://catalogo-csm-original.vercel.app
**Repositório:** https://github.com/catalogoscsm-dev/catalogo-CSM-original

---

## Tecnologias

- **Next.js 16** (App Router, `output: 'export'` — geração estática)
- **better-sqlite3** — banco local SQLite (usado só em dev/scripts)
- **Vercel** — hospedagem gratuita, auto-deploy a cada `git push`
- **Tailwind CSS v4** + **lucide-react** + **framer-motion**

---

## Rodar localmente

```bash
git clone https://github.com/catalogoscsm-dev/catalogo-CSM-original.git
cd catalogo-CSM-original
npm install
npm run dev
```

Acesse em: http://localhost:3000

---

## Estrutura de pastas

```
catalogo-digital/
├── app/                      → páginas (Next.js App Router)
├── components/               → componentes React
│   ├── ProductCard.tsx       → card com hover slideshow
│   └── ProductsView.tsx      → grade (3 cols) e lista (horizontal)
├── database/
│   └── catalogo.db           → banco SQLite local
├── data/
│   └── static-data.json      → snapshot do banco para o build estático
├── lib/
│   ├── data.ts               → lê static-data.json (usado nas páginas)
│   └── db.ts                 → acesso SQLite (usado nos scripts/admin)
├── public/
│   └── imagens/              → fotos dos produtos (commitadas no repo)
│       ├── ABV 2025/
│       ├── Artano 2024/
│       └── Gold Line 2025/
└── scripts/
    ├── importar-imagens.js   → importa fotos novas de uma pasta
    ├── resinkar-catalogo.js  → religar imagens já na pasta ao banco
    └── export-data.js        → exporta banco → data/static-data.json
```

---

## ⚠️ Workflow obrigatório ao adicionar produtos ou fotos

```bash
# 1. Importar as fotos para o banco
node scripts/importar-imagens.js "NOME DO CATÁLOGO" "PASTA COM AS FOTOS"

# 2. OBRIGATÓRIO — atualizar o JSON que o site usa
npm run export-data

# 3. Commitar e subir (Vercel atualiza em ~1 minuto)
git add .
git commit -m "novos produtos"
git push
```

**Se pular o `npm run export-data`, o site não vai mostrar os novos produtos.**

---

## Catalogação de imagens

### Como nomear os arquivos

Ao extrair imagens do PDF de um fornecedor, salve com os nomes:

| Nome do arquivo | Significado |
|---|---|
| `pag N.png` | Foto da página N (foto ambiente/completa) |
| `pag recorte N.png` | Foto recortada/limpa da página N |

`N` = número da página no PDF. Extensões aceitas: `.jpg`, `.jpeg`, `.png`, `.webp`

### Regras de associação (automáticas)

1. `pag recorte N` → **capa** do produto cuja página no banco é N
2. `pag N` + `pag recorte N` juntos → recorte = capa, pag = galeria
3. Só `pag N` sem recorte → vira a **capa**
4. Página N sem produto no banco → vai para galeria do produto mais próximo

### Script 1 — Importar fotos novas

```bash
node scripts/importar-imagens.js "ABV 2025" "C:\Users\joao\Desktop\fotos abv"
```

- Lê os arquivos `pag N` e `pag recorte N` da pasta indicada
- Copia para `public/imagens/{catálogo}/`
- Atualiza o campo `imagens` no banco
- Idempotente (rodar duas vezes não duplica)

### Script 2 — Resinkar catálogo

```bash
node scripts/resinkar-catalogo.js "ABV 2025"
node scripts/resinkar-catalogo.js "ABV 2025" --force   # reprocessa todos
```

- Usa arquivos que já estão na pasta do catálogo
- `--force` reprocessa mesmo quem já tem foto

---

## Localização das imagens no disco

Os scripts buscam as imagens em:

```
C:\Users\joao.miguel\Documents\catalogos\catalogos separados\
  └── {NOME DO CATÁLOGO}\
        └── imagens dos produtos\
              └── pag 17.png
              └── pag recorte 18.png
              └── ...
```

---

## Estado atual (set/2026)

| Catálogo | Produtos | Imagens |
|---|---|---|
| ABV 2025 | catalogado págs 7–107 | ✅ importadas |
| Artano 2024 | no banco | ⏳ fotos pendentes |
| Gold Line 2025 | no banco | ⏳ fotos pendentes |

- **57 produtos** no banco, **51 com fotos**, **102 imagens** no repositório
- ~100 outros catálogos em disco ainda não importados

---

## Banco de dados — campos principais

**Tabela `produtos`:**

| Campo | Tipo | Descrição |
|---|---|---|
| `pagina` | INTEGER | Página do produto no PDF (chave de match para imagens) |
| `imagens` | TEXT | JSON array de paths `/imagens/{catalogo}/{arquivo}` |
| `nome` | TEXT | Nome do produto |
| `material` | TEXT | Material principal |
| `dimensoes` | TEXT | Dimensões |
| `acabamento` | TEXT | Acabamentos disponíveis |
| `codigo` | TEXT | Código do produto |
| `texto_livre` | TEXT | Observações |

---

## Popular o banco do zero

```bash
node scripts/seed.js
```
