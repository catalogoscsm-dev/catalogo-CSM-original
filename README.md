# Catálogo Digital CSM

Catálogo digital da **CSM — Campinas Shopping Móveis**.
Consulta de produtos de móveis e decoração extraídos de PDFs de fornecedores.

**Site ao vivo:** https://catalogo-csm-original.vercel.app
**Repositório:** https://github.com/catalogoscsm-dev/catalogo-CSM-original

---

## LEIA PRIMEIRO — Estado atual e próximos passos (outubro/2025)

### O que está em andamento agora

Estamos catalogando o **ARMIL COMPLETO 2024** — catálogo com múltiplos produtos por página.

| Situação | Valor |
|---|---|
| Total de produtos no banco | 125 |
| Produtos com imagens | 70 |
| Placeholders pendentes | 0 |
| Última página com imagem | pag 114 |

**O que falta:** recortar e inserir as páginas que ainda estão com pastas vazias em:
```
C:\Users\joao.miguel\Documents\PROJETOS CSM\catalogos\catalogos separados\ARMIL COMPLETO 2024\imagens dos produtos\
```

---

### Fluxo atual — ARMIL (catálogos com múltiplos produtos por página)

#### Convenção de pastas e nomes de arquivo

Cada produto tem sua própria pasta. Para páginas com mais de um produto:

```
pag 9/    → produto principal    (pagina = 9)
pag 9b/   → segundo produto      (pagina = 9.1)
pag 9c/   → terceiro produto     (pagina = 9.2)
pag 9d/   → quarto produto       (pagina = 9.3)
```

Dentro de cada pasta, o nome do arquivo define o tipo:

| Nome do arquivo | O que vira no catálogo |
|---|---|
| Só **letras** (`abcdef.png`) | Imagem de capa/recorte do card |
| Só **números** (`45645.png`) | Foto de galeria do produto |
| Misto ou com espaços | Tratado como galeria (com aviso) |

#### Passo a passo para inserir novas imagens

1. Recortar os produtos com o software e salvar nas pastas com a convenção acima
2. Avisar Claude: *"subi mais imagens"*
3. Claude roda o import:
   ```
   node scripts/importar-armil.cjs "ARMIL COMPLETO 2024"
   ```
4. Claude lê as imagens de galeria para extrair nome, dimensões, material, acabamento
5. Claude atualiza o banco, roda o export, faz commit e push
6. Site atualiza no Vercel em ~1 minuto

**Script de import para catálogos multi-produto:** `scripts/importar-armil.cjs`
Serve para qualquer catálogo com essa estrutura de pastas — não é exclusivo do ARMIL.

---

### Fluxo NOVO — para todos os catálogos a partir do próximo (aprovado)

Este é o fluxo mais rápido, correto e sem erros. Elimina qualquer necessidade de extrair texto de PDF.

#### Por que PNG em vez de PDF?

PDFs de catálogos de móveis usam fontes com encoding customizado — o texto extraído sai como lixo ilegível (`BTL <ÅÄ Â 0a{...`). Claude é multimodal e lê texto em imagens PNG nativamente, sem nenhuma ferramenta externa. **O que está visível na tela, Claude lê com precisão total.**

#### As 3 fases do novo fluxo

**Fase 1 — Análise (você envia os PNGs, Claude lê tudo)**
1. Baixar todas as páginas do PDF como PNG
2. Enviar os PNGs no chat para o Claude
3. Claude analisa cada página e entrega um mapa completo:
   - Quais páginas têm 1 produto, quais têm 2 ou 3
   - Nome, dimensões, material, acabamento de cada produto
   - Quais sub-pastas precisam ser criadas (pag Nb, Nc...)
4. Você recebe o mapa completo **antes** de tocar em qualquer arquivo

**Fase 2 — Recortes (você usa seu software)**
Com o mapa em mãos:
- Você sabe exatamente o que recortar e em quantas partes
- Sabe em qual pasta salvar cada recorte
- Nomeia com letras (capa) ou números (galeria) conforme a convenção

**Fase 3 — Catalogação (Claude faz tudo)**
1. Você avisa que terminou os recortes
2. Claude roda o import, lê as imagens, preenche o banco, export, commit, push
3. Site atualizado em minutos, sem nenhum dado faltando

#### Lições aprendidas — erros para nunca repetir

- Nunca extrair texto diretamente do PDF — encoding customizado gera lixo
- Sempre ler as imagens de galeria para extrair dados — a informação está visível no PNG
- Se a galeria for só foto sem texto, ler a imagem de capa também
- Ao adicionar sub-páginas (9b, 9c...), sempre verificar se o produto da página principal também está com nome correto — pode ter sido importado errado via PDF anteriormente

---

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
