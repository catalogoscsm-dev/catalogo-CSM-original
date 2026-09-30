# Catálogo CSM — Versão GitHub Pages

Plano para adaptar o catálogo atual para deploy 100% estático no GitHub Pages.

## O que muda

| Atual | GitHub Pages |
|---|---|
| SQLite lido em runtime | JSON gerado antes do build |
| API routes ativas | Desativadas (sem servidor) |
| Admin panel | Branch separada |
| Turbopack + memória padrão | NODE_OPTIONS 4096MB |

## O que permanece igual

- Todo o visual (componentes, animações, tema dark/light)
- Botões WhatsApp (flutuante, por produto, lista de favoritos)
- Histórico com drawer lateral animado
- Favoritos, remoção com efeito fade, ViewTracker
- 5000+ páginas de produto geradas estaticamente

## Fluxo de build

```
1. node scripts/export-db.js   → gera /data/produtos.json
2. npm run build               → Next.js lê o JSON, gera todas as páginas
3. GitHub Actions faz deploy   → /out → GitHub Pages
```

## O que precisa ser feito

1. `scripts/export-db.js` — lê o SQLite e escreve `data/produtos.json`
2. `lib/data.ts` — trocar queries SQLite por import do JSON
3. `.github/workflows/deploy.yml` — adicionar o passo de export antes do build
4. Desativar rotas de admin no export estático

## Branch sugerida

`github-pages` no mesmo repo — ou repo separado `catal`.
