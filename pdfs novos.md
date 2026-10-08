# PDFs Novos — Curadoria Pendente

Data da discussão: 08/10/2026

---

## Situação atual

Os PDFs de muitos fornecedores foram atualizados na pasta compartilhada de rede **`L:\5 TABELAS`**. Isso significa que alguns catálogos que já preparamos localmente podem estar desatualizados.

---

## Comparativo entre pastas

| | Qtd |
|---|---|
| Fornecedores em ambos (local + rede) | 64 |
| Só na rede `L:\5 TABELAS` (novos, ainda não temos local) | 154 |
| Só no local `catalogos separados` (não estão na rede) | 56 |

### Pasta local
`C:\Users\joao.miguel\Documents\PROJETOS CSM\catalogos\catalogos separados`
→ 124 fornecedores

### Pasta de rede (fonte dos PDFs atualizados)
`L:\5 TABELAS`
→ 218 fornecedores

---

## O que já está feito e protegido

Aproximadamente 10 fornecedores já foram catalogados no banco de dados com produtos, imagens e dimensões. Esses não devem ser apagados ou refeitos sem revisão cuidadosa. Exemplos: **Art Ferro 2024-25**, **ARMIL**.

---

## Decisão pendente (curadoria amanhã)

Verificar:
1. Quais dos 56 fornecedores "só no local" têm produtos reais no banco → esses são trabalho feito, não podem ser perdidos
2. Quais dos 64 "em ambos" têm PDFs atualizados na rede que diferem do que usamos → podem precisar de revisão
3. Os 154 "só na rede" → fornecedores novos a catalogar do zero

---

## Estratégia acordada (provisória)

- **Não começar do zero**
- **Não clonar tudo da rede para local** (pesado e gera confusão de versões)
- Usar `L:\5 TABELAS` como **fonte de verdade para PDFs**
- Para cada fornecedor novo: converter páginas de produto do PDF em PNG → salvar em `imagens dos produtos/pdf-convertido/` → Claude analisa e extrai informações
- As pastas locais vazias permanecem como estão até serem trabalhadas
- Fornecedores com trabalho real no banco são preservados

---

## Pasta pdf-convertido

Foi criada a subpasta `pdf-convertido` dentro de `imagens dos produtos/` em todos os 122 fornecedores locais (exceto `Lib` e `Scripts` que não têm essa estrutura).

Fluxo de uso:
1. Abrir PDF do fornecedor em `L:\5 TABELAS`
2. Exportar só as **páginas de produto** como PNG (pular capa e índice)
3. Salvar os PNGs em `imagens dos produtos/pdf-convertido/`
4. Chamar o Claude para ler, extrair nomes/dimensões/materiais e preparar as subpastas
