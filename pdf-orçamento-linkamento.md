# PDF, Orçamento e Linkamento de Vendedor

Funcionalidades planejadas para o modo vendedor do catálogo digital CSM.

---

## 1. PDF de Produtos Selecionados

**Complexidade:** Simples  
**Estimativa:** ~1 dia

O vendedor marca os produtos desejados no catálogo e clica em "Exportar PDF". O browser gera o arquivo diretamente sem servidor, usando a biblioteca `jsPDF`.

O PDF conterá:
- Foto do produto
- Nome e descrição
- Dimensões
- Preço de tabela

Útil para apresentações, envio por e-mail ou impressão.

---

## 2. Simulação de Orçamento com PDF

**Complexidade:** Médio  
**Estimativa:** ~3 dias

Formulário preenchido pelo vendedor antes de gerar o documento:

| Campo | Descrição |
|---|---|
| Nome do vendedor | Identificação de quem gerou o orçamento |
| Nome do cliente | Para personalizar o documento |
| Desconto | Em % ou R$, aplicado sobre o total |
| Parcelas | Número de vezes e valor por parcela |
| Produtos selecionados | Lista com subtotais e total geral |

O resultado é um **PDF formatado** com aparência de comprovante profissional — cabeçalho CSM, tabela de produtos, totais, condições de pagamento e rodapé.

### Assinatura Digital

O cliente pode assinar diretamente na tela (celular ou computador) usando um canvas de desenho (biblioteca `signature_pad`). A assinatura é embutida no PDF antes de gerar o arquivo final.

---

## 3. Linkamento de WhatsApp do Vendedor

**Complexidade:** Simples  
**Estimativa:** ~1 dia

**O problema:** quando um vendedor envia o catálogo para um cliente, o botão de WhatsApp leva para o número geral da loja — o cliente pode cair com outro atendente.

**A solução:** o vendedor usa um link personalizado com seu número embutido na URL:

```
catalogo.com.br?v=joao&tel=5511999998888
```

Quando o cliente abre esse link:
- O botão de WhatsApp passa a apontar para o número do vendedor
- O parâmetro é salvo na sessão — não some se o cliente navegar entre páginas
- Se não houver parâmetro na URL, o botão usa o WhatsApp geral da loja normalmente

O vendedor só precisa ter seu link salvo no celular e compartilhar ele no lugar do link padrão.

---

## Ordem de implementação recomendada

1. **WhatsApp do vendedor** — entrega imediata de valor, mais simples
2. **PDF de produtos** — útil para apresentações
3. **Orçamento + assinatura** — implementar quando o modo vendedor estiver estável e em uso
