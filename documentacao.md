# 📚 Documentação Técnica - Flor do Luar

## 📖 Sumário

1. [Visão Geral do Sistema](#visão-geral)
2. [Regras de Negócio](#regras-de-negócio)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Fluxos de Operação](#fluxos-de-operação)
5. [Manual Técnico](#manual-técnico)

---

## 🌙 Visão Geral

O **Flor do Luar** é um sistema de gestão comercial desenvolvido para operações de **mercado fluvial e logística** na região amazônica. Sua arquitetura segue rigorosamente o princípio de **Separação de Responsabilidades**:

- **HTML**: Estrutura visual e templates
- **CSS**: Estilização e aparência
- **JavaScript**: Lógica de processamento pura

### Filosofia Privacy-First/Local-First

```
┌─────────────────────────────────────────┐
│  ❌ Sem servidores externos             │
│  ❌ Sem banco de dados na nuvem         │
│  ❌ Sem autenticação obrigatória        │
│  ❌ Sem rastreamento de usuários        │
├─────────────────────────────────────────┤
│  ✅ Dados no dispositivo local          │
│  ✅ Funcionamento 100% offline          │
│  ✅ Controle total do usuário           │
│  ✅ Backup manual quando desejar        │
└─────────────────────────────────────────┘
```

---

## 🎨 Mudanças na Interface (v2.0)

### Header Unificado e Compacto
- **Layout**: Linha única com logo à esquerda e navegação à direita
- **Position**: `sticky` fixo no topo (`top: 0`)
- **Altura**: Reduzida para ~50px (padding mínimo de 0.5rem)
- **Z-Index**: 1000 (acima de todos os elementos)
- **Sombra dinâmica**: `box-shadow` aumenta ao scrollar (classe `.is-scrolled`)

### Sticky Elements
| Elemento | Position | Comportamento |
|----------|----------|---------------|
| **Header** | `sticky` | Fixo no topo, sombra ao scrollar |
| **Carrinho** | `sticky` | Fixo à direita, acompanha scroll da página |

### Responsividade do Carrinho (Vendas)
**Estrutura Flexbox:**
```
┌─────────────────────┐ ← carrinho-header (fixo)
├─────────────────────┤ ← carrinho-itens (flex: 1, scroll-y: auto)
├─────────────────────┤ ← carrinho-totais (flex-shrink: 0, fixo)
├─────────────────────┤ ← carrinho-acoes (flex-shrink: 0 + margin-top: auto, fixo)
└─────────────────────┘
```

**Propriedades CSS Críticas:**
- `flex: 1` na lista de itens → ocupa espaço disponível
- `overflow-y: auto` na lista → scroll independente
- `flex-shrink: 0` nos totais e botões → nunca encolhem
- `margin-top: auto` nas ações → empurra para o final

**Dimensões:**
- Largura: 270px fixa (`width: 270px; flex: 0 0 270px`)
- Altura: `calc(100vh - 90px)` → maximizada para viewport
- Altura mínima: 350px

### Grid de Produtos Ajustado
- `max-width: 280px` nos cards para evitar expansão excessiva
- `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`

---

## 📊 Regras de Negócio

### 1. Cálculo do Custo de Chegada

Fórmula base para precificação de produtos vindos de Manaus:

```
CUSTO DE CHEGADA = PREÇO MANAUS + FRETE FLUVIAL

PREÇO VENDA = CUSTO DE CHEGADA + MARGEM (%)
```

**Exemplo Prático:**
- Arroz 1kg em Manaus: R$ 5,00
- Frete proporcional: R$ 1,50
- Custo de Chegada: R$ 6,50
- Margem de 30%: R$ 1,95
- **Preço Final: R$ 8,45**

### 2. Categoria Bebidas - Níveis de Venda

Para otimizar o estoque de **alto giro** (bebidas), o sistema implementa múltiplos níveis de venda com cálculo proporcional de frete:

| Nível | Descrição | Proporção Frete | Multiplicador | Exemplo |
|-------|-----------|-----------------|---------------|---------|
| **Fardo** | Atacado/Pack | 100% | 12x | Pack 12 unidades |
| **Grande** | Galão 20L | 100% | 1x | Galão isolado |
| **Médio** | Pet 2L | 15% | 1x | Garrafa média |
| **Tamanho** | Lata 350ml | 5% | 1x | Lata pequena |
| **Caçulinha** | 200ml | 3% | 1x | Caçulinha |

**Tipos de Embalagem Suportados:**
- 🥫 Lata (350ml, 473ml)
- 🧃 Pet (500ml, 1L, 2L, 2,5L)
- 🍶 Galão (5L, 10L, 20L)
- 🍺 Long Neck (330ml)
- 🍾 Garrafa (600ml)
- 🥤 Caçulinha (200ml)

**Cálculo do Frete Proporcional:**

```
FRETE_FARDO = R$ 12,00 (frete total do pack)

FRETE_MEDIO = R$ 12,00 × 0.15 = R$ 1,80
FRETE_TAMANHO = R$ 12,00 × 0.05 = R$ 0,60
FRETE_CACULINHA = R$ 12,00 × 0.03 = R$ 0,36

CUSTO_CHEGADA = CUSTO_MANAUS + FRETE_PROPORCIONAL
```

**Campos Específicos para Bebidas:**
- `nivel_venda`: fardo | grande | medio | tamanho | caçulinha
- `tipo_bebida`: identificador do formato (ex: pet_2l, lata, galao_20l)
- `frete_proporcional`: valor calculado automaticamente
- `unidades_por_embalagem`: quantidade no pack (12, 20, etc)
- `custo_chegada`: custo + frete proporcional

**Benefícios:**
- Permite vender unidades avulsas sem prejuízo no frete
- Estoque otimizado para produtos de alta rotatividade
- Etiquetas coloridas para identificação visual rápida
- Flexibilidade para atender diferentes perfis de clientes
- Cards de categoria visual na dashboard

### 3. Módulo de Reposição

**Descrição:** Ferramenta de auxílio à logística para geração de listas de compras mensais baseadas em estoque baixo.

**Funcionalidades:**
- Geração automática baseada nas vendas do mês atual
- Tabela dinâmica com produto, categoria e quantidade vendida
- Exportação para impressão (formato otimizado)
- Atualização manual com um clique

**Substituição:** Módulo anterior "Precificação" foi substituído por este.

### 4. Sistema de Caderneta de Crédito

**Persistência:** Dados armazenados em `localStorage` com chave `lista_caderneta`, permitindo:
- Renderização dinâmica de clientes
- Histórico persistente entre sessões
- Acumulação de débitos por cliente

O sistema suporta três tipos de lançamentos:

| Tipo | Efeito no Saldo | Uso |
|------|-----------------|-----|
| **Venda** | + (Aumenta dívida) | Cliente compra fiado |
| **Pagamento** | - (Reduz dívida) | Cliente quita parcial/total |
| **Troca/Escambo** | - (Reduz dívida) | Troca tradicional amazônica |

**Regras:**
- Cliente pode ter saldo devedor (positivo) ou crédito (negativo)
- Histórico completo de lançamentos por cliente
- Ordenação cronológica inversa (mais recente primeiro)

### 5. Alertas de Estoque Crítico

**Nível Crítico:** 5 unidades ou menos

**Status dos Alertas:**
- **PENDENTE**: Acabou de atingir nível crítico
- **VISTO**: Responsável visualizou o alerta
- **RESOLVIDO**: Estoque reposto

**Fluxo:**
```
Venda Realizada → Verificação Automática → Alerta Gerado → Painel de Reposição Manaus
```

### 6. Baixa Automática de Estoque

Toda venda realizada automaticamente:
1. Verifica disponibilidade
2. Reduz quantidade do estoque
3. Verifica nível crítico
4. Gera alerta se necessário
5. Registra no histórico

---

## 💾 Estrutura de Dados

### Armazenamento Local

```javascript
// Chave no LocalStorage
'flordoluar-data'

// Estrutura JSON
{
  "itens": [
    {
      "id": number,
      "nome": string,
      "categoria": "rancho|bebidas|vestuario|manutencao|ferramentas|escola",
      "quantidade": number,
      "preco": number,
      "custo": number,
      "frete": number,
      // Campos específicos para bebidas (alto giro)
      "unidade": "fardo|grande|medio|tamanho|caçulinha|un|cx|kit",
      "nivel_venda": "fardo|grande|medio|tamanho|caçulinha|null",
      "tipo_bebida": "lata|pet_500ml|pet_2l|galao_20l|caculinha|long_neck|...",
      "frete_proporcional": number|null,
      "custo_chegada": number,
      "unidades_por_embalagem": number|null
    }
  ],
  "clientes": [
    {
      "id": number,
      "nome": string,
      "contato": string,
      "lancamentos": [
        {
          "data": ISO_string,
          "tipo": "venda|pagamento|troca",
          "valor": number,
          "descricao": string
        }
      ]
    }
  ],
  "alertas": [
    {
      "id": string,
      "itemId": number,
      "nome": string,
      "categoria": string,
      "quantidade": number,
      "status": "PENDENTE|VISTO|RESOLVIDO",
      "dataCriacao": ISO_string,
      "dataAtualizacao": ISO_string
    }
  ],
  "historicoVendas": [
    {
      "data": ISO_string,
      "itens": [...],
      "total": number,
      "clienteId": number|null,
      "naCaderneta": boolean
    }
  ]
}
```

---

## 🔄 Fluxos de Operação

### Fluxo 1: Entrada de Mercadoria

```
Compra em Manaus
    ↓
Transporte Fluvial
    ↓
Recebimento/Chegada
    ↓
Cadastro no Estoque [categoria + quantidade + custo + frete]
    ↓
Cálculo Automático: Custo de Chegada
    ↓
Definição do Preço de Venda
    ↓
Disponível para Venda
```

### Fluxo 2: Venda ao Consumidor

```
Cliente seleciona produtos
    ↓
Adiciona ao Carrinho
    ↓
[Verificação] Estoque suficiente?
    ↓
Sim → Prossegue | Não → Alerta de indisponibilidade
    ↓
Escolha: Pagamento à Vista ou na Caderneta
    ↓
Finalização da Venda
    ↓
Baixa Automática do Estoque
    ↓
Verificação de Nível Crítico (≤5 unidades)
    ↓
Geração de Alerta (se aplicável)
    ↓
Emissão de Comprovante
```

### Fluxo 3: Reposição de Estoque (Manaus)

```
Painel de Alertas exibe itens críticos
    ↓
Visualização dos Alertas (status → VISTO)
    ↓
Compra em Manaus
    ↓
Transporte Fluvial
    ↓
Entrada no Estoque
    ↓
Marcação como RESOLVIDO no Painel
```

---

## DataManager - Operações CRUD

O `DataManager` é o módulo responsável por todas as operações de **CRUD** (Criar, Ler, Atualizar, Deletar) no arquivo `data.json` local.

### Operações de Estoque

```javascript
// CRIAR novo item
const novoItem = await DataManager.criarItem({
    nome: "Farinha 1kg",
    categoria: "rancho",
    custo_manaus: 4.00,
    frete: 1.00,
    custo_chegada: 5.00,
    preco_venda: 6.50,
    quantidade: 20
});

// LER item específico
const item = await DataManager.lerItem(101);

// ATUALIZAR item
await DataManager.atualizarItem(101, {
    quantidade: 45,
    preco_venda: 8.90
});

// DELETAR item
await DataManager.deletarItem(101);
```

### Operações de Caderneta

```javascript
// CRIAR cliente
const cliente = await DataManager.criarCliente({
    nome: "Carlos Pereira",
    apelido: "Carlão",
    contato: "(92) 91234-5678",
    localidade: "Comunidade Nova Esperança"
});

// LER cliente
const dadosCliente = await DataManager.lerCliente(1);

// ATUALIZAR cliente
await DataManager.atualizarCliente(1, {
    limite_credito: 600.00
});

// DELETAR cliente (soft delete)
await DataManager.deletarCliente(1);

// ADICIONAR LANÇAMENTO
await DataManager.adicionarLancamento(1, {
    tipo: "venda",  // 'venda', 'pagamento', 'troca'
    valor: 50.00,
    descricao: "Compra de materiais de pesca"
});
```

### Configurações do Sistema

```javascript
// Ler configurações
const config = await DataManager.lerConfiguracoes();

// Atualizar configurações
await DataManager.atualizarConfiguracoes({
    margem_lucro_padrao: 35,
    nome_loja: "Flor do Luar - Filial 2"
});
```

### Utilitários

```javascript
// Listar todos os dados
const tudo = await DataManager.listarTudo();

// Exportar backup (download automático)
await DataManager.exportarBackup();
```

### Privacidade das Operações

Todas as operações CRUD:
- ✅ Funcionam **100% offline**
- ✅ Nunca fazem requisições para APIs externas
- ✅ Mantêm dados apenas no arquivo local
- ✅ Exportam backup apenas para download manual

---

## �🛠️ Manual Técnico

### Executar Localmente

1. **Clone ou baixe** os arquivos do projeto
2. **Navegue** até a pasta do projeto
3. **Abra** o arquivo `index.html` em qualquer navegador moderno
4. **Pronto!** O sistema está funcionando

**Não requer:**
- ❌ Instalação de software
- ❌ Servidor web
- ❌ Banco de dados externo
- ❌ Conexão com internet

### Estrutura de Arquivos

```
flordoluar/
├── index.html          # Interface e templates
├── scanner.html        # Scanner de código de barras (câmera/USB)
├── styles.css          # Estilos e aparência
├── script.js           # Lógica de processamento
├── data.json           # BANCO DE DADOS LOCAL (única fonte de verdade)
├── README.md           # Documentação geral
├── DOCUMENTACAO.md     # Documentação técnica
├── fluxograma.md       # Fluxogramas Mermaid
└── SPARK_TECH.txt      # Assinatura protegida
```

**Nota:** O sistema é 100% local. Não requer Firebase, servidores externos ou conexão com internet.

### 🔒 Segurança do Arquivo data.json

**⚠️ INSTRUÇÃO CRÍTICA DE SEGURANÇA**

O arquivo `data.json` é a **única fonte de verdade** do sistema Flor do Luar. Ele contém:
- Configurações da loja e margens de lucro
- Todo o estoque de produtos com preços e custos
- Cadastro de clientes e histórico financeiro
- Histórico completo de vendas e transações

**REGRAS DE SEGURANÇA:**

1. **MANTENHA APENAS NO HARDWARE LOCAL**
   - ❌ Nunca envie para servidores na nuvem
   - ❌ Nunca compartilhe via WhatsApp, email ou redes sociais
   - ❌ Nunca sincronize com Google Drive, Dropbox ou similar
   - ✅ Mantenha apenas no computador/tablet local

2. **BACKUP SEGURO**
   - Use apenas dispositivos de armazenamento físicos (pen drive, HD externo)
   - Guarde em local seguro e seco
   - Criptografe se possível

3. **PRIVACIDADE DOS CLIENTES**
   - O arquivo contém nomes, contatos e dados financeiros de clientes
   - É dever do proprietário proteger essas informações
   - Vazamento pode acarretar responsabilidades legais (LGPD)

4. **ACESSO FÍSICO**
   - Proteja o dispositivo com senha
   - Evite que terceiros acessem o sistema sem supervisão

**Para maior segurança, utilize o sistema em modo completamente offline, sem conexão com internet.**

### Backup e Restauração

**Exportar Dados:**
```javascript
// No console do navegador (F12)
const dados = localStorage.getItem('flordoluar-data');
console.log(dados);
// Copie o resultado e salve em arquivo .json
```

**Importar Dados:**
```javascript
// Cole seu JSON na variável 'dadosImportados'
const dadosImportados = '{"itens": [...]}';
localStorage.setItem('flordoluar-data', dadosImportados);
location.reload();
```

### Arquitetura: Separação de Responsabilidades

```
┌──────────────────────────────────────────────────┐
│  index.html (Estrutura Visual)                   │
│  ├── Templates HTML5 <template>                  │
│  ├── Data-attributes para binding               │
│  └── Containers para renderização              │
├──────────────────────────────────────────────────┤
│  styles.css (Aparência)                         │
│  ├── Variáveis CSS (cores, espaçamentos)        │
│  ├── Classes de estado (.active, .hidden)       │
│  └── Media queries responsivas                  │
├──────────────────────────────────────────────────┤
│  script.js (Lógica Pura)                       │
│  ├── Processamento de dados                     │
│  ├── Cálculos (frete, margem, estoque)          │
│  ├── Manipulação via textContent/value          │
│  └── ❌ Sem HTML strings                        │
│  └── ❌ Sem element.style inline                │
└──────────────────────────────────────────────────┘
```

---

## 📝 Convenções de Código

### JavaScript
- Módulos separados: `estoque`, `vendas`, `creditos`, `relatorios`
- Helper functions: `cloneTemplate()`, `fillDataAttribute()`
- Event listeners via atributos `data-action`

### CSS
- BEM-like naming: `.lancamento-item`, `.cliente-card`
- Variáveis CSS para tema consistente

### HTML Templates
- IDs prefixados: `tpl-[nome]`
- Data attributes: `data-nome`, `data-valor`
- Estrutura semântica acessível

---

## 📋 Changelog

### v2.0 - Abril 2025 (Release Atual)

**UI/UX - Interface Otimizada:**
- Header unificado em linha única (logo à esquerda, navegação à direita)
- Implementação de sticky header e sticky carrinho
- Carrinho com scroll interno e botões fixos na base
- Grid de produtos com max-width para evitar expansão excessiva
- Design compacto otimizado para telas de notebook (~50px header)

**Funcionalidades:**
- Novo módulo **Reposição** (substitui Precificação)
- Caderneta com persistência local via `lista_caderneta`
- Renderização dinâmica de clientes com histórico persistente

**Técnico:**
- Z-index 1000 para header (sempre acima)
- Flexbox estruturado no carrinho (flex-shrink: 0 nos botões)
- Altura viewport-fit: calc(100vh - 90px)

### v1.0 - Release Inicial
- Gestão de estoque com categorias
- Sistema de vendas com carrinho
- Caderneta de crédito
- Scanner de código de barras
- Sistema de bebidas multi-nível (alto giro)

---

**Documentação v2.0 - Flor do Luar** 🌙
*Sistema Local-First para Logística Amazônica*
