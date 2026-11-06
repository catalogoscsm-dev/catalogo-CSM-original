# Corrigir produtos sem imagens — Aço Mobilia 2025

## Problema

No catálogo **Aco Mobilia 2025** (catalogo_id = 4), algumas páginas têm múltiplos produtos cadastrados mas só o primeiro produto da página ganhou as imagens linkadas. Os demais ficaram com `imagens: []`.

## Padrão identificado

Quando uma página do catálogo mostra um conjunto (ex: mesa + cadeira), os dois produtos foram cadastrados com a mesma página, mas apenas um recebeu o array de imagens no banco.

Exemplos:
- pag 14 → "Cadeira Luxor" (4 imgs) + **"Mesa Louvre" (0 imgs)**
- pag 16 → "Cadeira Ágatha" (4 imgs) + **"Mesa Milão" (0 imgs)**
- pag 18 → "Cadeira Madrid" (7 imgs) + **"Mesa Amalfi" (0 imgs)**
- pag 28 → "Cadeira Belagio" (5 imgs) + **"Mesa Capri" (0 imgs)**
- pag 30 → "Poltrona Madrid" (5 imgs) + **"Cadeira Madrid" (0 imgs)** + **"Mesa Milão" (0 imgs)**
- pag 34 → "Cadeira Ágatha" (5 imgs) + **"Mesa Madrid" (0 imgs)**
- pag 38 → "Cadeira Milão" (6 imgs) + **"Cadeira Madrid" (0 imgs)** + **"Poltrona Madrid" (0 imgs)** + **"Mesa Capri" (0 imgs)**
- pag 42 → "Cadeira Bora Bora Corda Náutica" (5 imgs) + **"Mesa Moorea" (0 imgs)**
- pag 44 → "Cadeira Bora Bora" (5 imgs) + **"Mesa Taiti" (0 imgs)**
- pag 46 → "Banqueta Athenas Alta" (6 imgs) + **"Banqueta Athenas Baixa" (0 imgs)**
- pag 48 → "Banqueta Caribe Alta" (4 imgs) + **"Banqueta Caribe Baixa" (0 imgs)** + **"Bistro Capri" (0 imgs)**
- pag 50 → "Banqueta Belagio Alta" (4 imgs) + **"Banqueta Belagio Baixa" (0 imgs)** + **"Bistro Maupiti" (0 imgs)**
- pag 53 → "Mesa Canto Anaa" (6 imgs) + **"Mesa Centro Raiatea" (0 imgs)**
- pag 57 → "Mesa Canto Sicilia" (5 imgs) + **"Mesa Canto Athenas" (0 imgs)**

## Solução planejada

Rodar script que para cada produto com `imagens = []` no catálogo id 4, busca outro produto da mesma página que já tenha imagens e copia o mesmo array.

Depois rodar `node scripts/export-data.js` e fazer commit + push.

## Status

- [ ] Implementar e rodar script de correção
- [ ] Regenerar static-data.json
- [ ] Commit e push
