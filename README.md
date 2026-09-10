# Catálogo Digital CSM

Catálogo digital interno da **CSM — Campinas Shopping Móveis**.
Permite consultar produtos de móveis e decoração extraídos dos PDFs de fornecedores, com fotos, ficha técnica, dimensões, acabamentos e favoritos.

---

## Tecnologias

- **Next.js 16** (App Router)
- **better-sqlite3** — banco local em `database/catalogo.db`
- **Tailwind CSS v4**
- **framer-motion** — transições de página
- **lucide-react** — ícones

---

## Rodar o projeto

```bash
npm run dev
```

Acesse em: http://localhost:3000

---

## Estrutura de pastas relevante

```
catalogo-digital/
├── app/                    → páginas e rotas (Next.js App Router)
├── components/             → componentes React reutilizáveis
├── database/
│   └── catalogo.db         → banco SQLite com produtos, catálogos e favoritos
├── scripts/                → scripts de manutenção e importação
│   ├── seed.js             → popula o banco com catálogos e produtos
│   ├── importar-imagens.js → importa fotos novas para um catálogo
│   └── resinkar-catalogo.js→ religar imagens já na pasta ao banco
└── lib/                    → utilitários, auth, db

Imagens ficam em:
C:\Users\joao.miguel\Documents\catalogos\catalogos separados\
  └── {NOME DO CATÁLOGO}\
        └── imagens dos produtos\
              └── pag 17.png, pag recorte 18.png ...
```

---

## Catalogação de imagens

### Como nomear os arquivos

Ao baixar imagens do PDF de um fornecedor, salve com os nomes:

| Nome do arquivo | Significado |
|---|---|
| `pag N.png` | Foto da página N (foto ambiente/completa do produto) |
| `pag recorte N.png` | Foto recortada/limpa da página N |

`N` = número da página no PDF. Extensões aceitas: `.jpg`, `.jpeg`, `.png`, `.webp`

---

### Regras de associação (aplicadas automaticamente pelo script)

1. `pag recorte N` → sempre a **capa** do produto cuja página no banco é N
2. `pag N` + `pag recorte N` juntos → recorte vira capa, pag vira galeria
3. Só `pag N` sem recorte → vira a **capa**
4. Página N sem produto no banco → o script busca o produto mais próximo (N+1, N-1, N+2…) e adiciona como **galeria**

---

### Script 1 — Importar imagens novas

Use quando você baixou arquivos novos e quer adicioná-los ao catálogo.

```bash
node scripts/importar-imagens.js "NOME DO CATÁLOGO" "PASTA COM AS FOTOS"
```

**Exemplo:**
```bash
node scripts/importar-imagens.js "ABV 2025" "C:\Users\joao\Desktop\fotos abv"
```

O que acontece:
- Lê os arquivos `pag N` e `pag recorte N` da pasta indicada
- Copia cada um para `catalogos separados\{CATÁLOGO}\imagens dos produtos\`
- Atualiza o campo `imagens` no banco de dados
- Rodar duas vezes com os mesmos arquivos não duplica nada

---

### Script 2 — Resinkar catálogo

Use quando as imagens já estão na pasta do catálogo mas ainda não estão ligadas ao banco (ou estão desatualizadas).

```bash
node scripts/resinkar-catalogo.js "NOME DO CATÁLOGO"
# com --force: reprocessa mesmo quem já tem foto
node scripts/resinkar-catalogo.js "NOME DO CATÁLOGO" --force
```

O que acontece:
- Lê diretamente a pasta `imagens dos produtos` do catálogo
- Reconhece qualquer convenção de nome (desde que o número da página apareça no filename)
- Por padrão só toca produtos que ainda não têm foto

---

### Fluxo completo de trabalho

```
1. Abrir o PDF do fornecedor

2. Para cada produto:
   → Salvar a foto da página como:      pag N.png
   → Salvar a foto recortada como:      pag recorte N.png
     (N = número da página no PDF)

3. Juntar tudo numa pasta (ex: Desktop\fotos abv)

4. Rodar o script:
   node scripts/importar-imagens.js "ABV 2025" "C:\Users\...\fotos abv"

5. Conferir no site — cada card já aparece com a foto correta e galeria
```

---

## Banco de dados — campos principais

**Tabela `produtos`:**

| Campo | Tipo | Descrição |
|---|---|---|
| `pagina` | INTEGER | Página do produto no PDF (chave de match para imagens) |
| `imagens` | TEXT | JSON array de paths `/api/imagem/{catalogo}/imagens%20dos%20produtos/{arquivo}` |
| `nome` | TEXT | Nome do produto |
| `material` | TEXT | Material principal |
| `dimensoes` | TEXT | Dimensões (ex: L 160 x P 90 x A 76 cm) |
| `acabamento` | TEXT | Acabamentos disponíveis |

---

## Popular o banco do zero

```bash
node scripts/seed.js
```
