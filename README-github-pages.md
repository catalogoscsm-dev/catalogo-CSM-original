# Catálogo CSM — GitHub Pages

Site estático hospedado em: https://catalogoscsm-dev.github.io/catalogo-CSM-original/

---

## Como funciona o deploy

A cada `git push` na branch `master`, o GitHub Actions roda automaticamente:

```
1. npm ci          → instala dependências
2. npm run build   → Next.js lê data/static-data.json e gera todas as páginas
3. deploy          → pasta /out vai pro GitHub Pages
```

O site não tem servidor. Tudo é gerado em HTML/JS estático na hora do build.

---

## Workflow local para atualizar o site

```bash
# 1. Atualizar o banco (inserir produtos, importar imagens, etc.)
node scripts/export-data.js   # gera data/static-data.json

# 2. Commitar e subir (GitHub Actions faz o deploy automaticamente)
git add .
git commit -m "atualiza produtos"
git push
```

**Nunca pular o `export-data.js`** — o site usa só o JSON, não o banco.

---

## Erros encontrados ao migrar para GitHub Pages (e como foram resolvidos)

### Erro 1 — Segmentation fault no `better-sqlite3`

```
Run npm run export-data
Segmentation fault (core dumped)
Error: Process completed with exit code 139.
```

**Por quê acontece:**  
O `better-sqlite3` é um módulo nativo (C++). O binário compilado no Windows não funciona no Linux do GitHub Actions — causa segfault.

**Solução:**  
Remover completamente `better-sqlite3` do projeto (e `@types/better-sqlite3`). O site público nunca precisou do SQLite em runtime — ele usa só o `static-data.json`. O banco fica apenas para uso local via scripts.

---

### Erro 2 — `dynamic = 'force-static'` nas rotas API

As rotas `app/api/favoritos/route.ts` e `app/api/produtos/route.ts` tinham:

```ts
export const dynamic = 'force-static'
```

**Por quê é problema:**  
Essa diretiva diz ao Next.js para chamar o handler GET na hora do build e salvar o resultado como arquivo estático. Como o handler usava `getDb()` (SQLite), isso causaria o mesmo segfault.

**Solução:**  
Remover a linha `export const dynamic = 'force-static'` das duas rotas. Sem ela, as rotas API são simplesmente ignoradas no export estático.

---

### Erro 3 — Páginas de admin usavam SQLite no build

As páginas `app/admin/page.tsx` e subpáginas chamavam `getDb()` diretamente em componentes de servidor. Com `output: 'export'`, o Next.js tenta pré-renderizar todas as páginas na hora do build — incluindo as de admin — o que causaria o mesmo segfault.

**Solução:**  
Deletar o `app/admin/` inteiro. O painel admin é uma ferramenta interna que só faz sentido com servidor — não tem lugar num site estático.

---

## O que foi removido do projeto para virar estático

| Removido | Motivo |
|---|---|
| `app/admin/` | Usava SQLite em componentes de servidor |
| `app/api/` | Rotas de API não funcionam sem servidor |
| `lib/db.ts` | Wrapper do SQLite — não necessário no site |
| `lib/auth.ts` | Autenticação JWT — sem servidor, sem auth |
| `better-sqlite3` (dep) | Módulo nativo que segfaulta no Linux do CI |
| `@types/better-sqlite3` (devDep) | Tipos do módulo removido |

---

## O que permanece e continua funcionando

- Todo o visual (componentes, animações, tema dark/light)
- Busca por produto (feita no cliente com o JSON)
- Botões WhatsApp (flutuante, por produto, lista de favoritos)
- Histórico com drawer lateral animado
- Favoritos em `localStorage`
- 5000+ páginas de produto geradas estaticamente
