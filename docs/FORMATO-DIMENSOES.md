# Formato oficial do campo `dimensoes`

O site (`components/DimensoesDisplay.tsx`) transforma a string em tabela (TAMANHO / LARGURA / PROF. / ALTURA) usando o parser `lib/dimensoes.ts`.
Se a string não for reconhecida, aparece como texto cru. **Valide antes de gravar:** `npm run validar-dimensoes` (e `npm test`).

## Regras

- Unidade sempre **cm** (converter metros: 1,20 m → 120). Sufixo `CM`/`cm` opcional.
- **Variantes** separadas por ` | `. Dentro de uma variante, as medidas se separam por `x` (ou vêm coladas com rótulo: `L200A90P45`).
- **Rótulo de tamanho** opcional antes de um hífen: `Nome-medidas`. Pode ter letras e números (`Ret300`, `Alto200`, `P`, `G`).
- **Rótulos de medida**: `L` largura, `P` profundidade, `A`/`H` altura, `C` comprimento, `Ø` diâmetro. Sem rótulo, a ordem é L x P x A (exceto números puros iniciando por dígito, tratados como mesa: Largura x Compr.).
- Decimais com vírgula ou ponto; faixa com hífen (`207-514`).
- Texto sem nenhum dígito (ex.: `Modular`) é aceito como descritivo, mas não vira tabela.

## 5 exemplos válidos

1. `Ret300-L300A76P120CM | Red150-L150A76P150CM` (rótulo com número, medidas coladas)
2. `Alto200-L200A90P45CM | Baixo200-L200A76P45CM` (rótulo com "x" dentro da palavra)
3. `P-100x50x75CM | M-120x60x75CM | G-140x70x75CM` (tabela P/M/G)
4. `L 266xA 220xP 64cm` (letras com espaço)
5. `L 220 X 100 X 75CM` (letras com espaço e X maiúsculo)

## 5 exemplos inválidos (viram texto cru e travam a importação)

1. `90 cm de diâmetro` — frase com dígitos; use `Ø90CM`
2. `Ret300-L300 A76 P120` — medidas separadas por espaço, sem `x` e coladas
3. `2,07-5,14m x 1,05-1,68 x 0,88m` — unidade `m` fora do formato A; use `L 207-514 x P 105-168 x A 88cm`
4. `300 x 120 cm | ???` — uma variante ilegível invalida a linha inteira
5. `Largura 300, profundidade 120` — frase com dígitos; use `L300xP120CM`

## Ferramentas

| Comando | O que faz |
|---|---|
| `npm run validar-dimensoes` | Varre todos os produtos do banco; sai com código 1 se houver string inválida |
| `npm test` | Testes de regressão do parser (`tests/dimensoes.test.cjs`) |
| `scripts/_dimensoes-guard.cjs` | `assertDimensoes(rows)` — chamar nos `importar-*.cjs` antes de gravar |
| `npm run export-data` | Avisa (não bloqueia) quando há dimensões não reconhecidas |
