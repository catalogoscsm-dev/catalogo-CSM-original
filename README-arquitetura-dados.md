# Como os dados do catálogo estão armazenados

## Resposta curta

> É um banco SQLite local que serve como fonte de verdade. A cada atualização, exportamos para um JSON estático que é hospedado junto com o código no GitHub e servido pelo GitHub Pages.

---

## As duas camadas

### 1. Banco de dados SQLite — no seu computador

**Arquivo:** `database/catalogo.db`

Banco SQL local com as tabelas principais:

| Tabela | O que guarda |
|---|---|
| `catalogos` | Nome, pasta e ano de cada fornecedor |
| `produtos` | Nome, material, dimensões, acabamento, imagens, página, etc. |

Este banco é a **fonte de verdade** — é onde os dados são inseridos, corrigidos e enriquecidos via scripts.

Ele **não vai para o site diretamente**. Fica só no computador.

---

### 2. JSON estático — no GitHub

**Arquivo:** `data/static-data.json` (~2MB)

Gerado pelo comando:
```bash
npm run export-data
```

Este script lê o SQLite e exporta tudo para um único arquivo JSON, que é **commitado no GitHub junto com o código**.

É esse JSON que o site usa. O GitHub Pages não tem servidor nem banco de dados — ele apenas lê esse arquivo estático.

---

## O fluxo completo

```
Banco SQLite        →   export-data.js   →   static-data.json   →   GitHub   →   Site no ar
(seu computador)        (script local)        (commitado)            Pages
```

### Passo a passo ao adicionar produtos:

```bash
# 1. Inserir produtos no banco via script
node scripts/importar-FORNECEDOR.cjs

# 2. Exportar banco → JSON
npm run export-data

# 3. Commitar e subir (site atualiza em ~2 min)
git add .
git commit -m "adiciona fornecedor X"
git push
```

---

## Por que essa arquitetura?

- **GitHub Pages é gratuito** mas só serve arquivos estáticos — sem servidor, sem banco em runtime
- **SQLite local** permite trabalhar os dados com scripts flexíveis antes de publicar
- **JSON commitado** garante que o site nunca depende de conexão com banco externo
