# 🌊 Fluxogramas - Flor do Luar

## 🔄 Fluxo Principal: Ciclo de Mercadorias

```mermaid
flowchart TB
    subgraph Manaus["📦 MANAUS - Centro de Compras"]
        A[Fornecedor/Atacado]
        B[Cálculo: Custo de Chegada]
    end

    subgraph Transporte["🚤 TRANSPORTE FLUVIAL"]
        C[Barco de Carga]
        D[Chegada ao Comunidade]
    end

    subgraph EstoqueLocal["🏪 ESTOQUE LOCAL"]
        E[Cadastro no Sistema]
        F[Estoque Disponível]
        G[Alerta de Nível Crítico ≤5]
    end

    subgraph Venda["💰 PONTO DE VENDA"]
        H[Cliente seleciona produtos]
        I{Verificação de Estoque}
        J[Adiciona ao Carrinho]
        K{Forma de Pagamento}
        L[À Vista]
        M[Na Caderneta]
        N[Comprovante Emitido]
    end

    subgraph Reposicao["🚨 REPOSIÇÃO MANAUS"]
        O[Painel de Alertas]
        P[Compra de Reposição]
    end

    A -->|Preço Manaus| B
    B -->|Custo + Frete| C
    C --> D
    D --> E
    E --> F
    F --> H
    H --> I
    I -->|Disponível| J
    I -->|Indisponível| G
    J --> K
    K -->|Dinheiro/Pix| L
    K -->|Fiado/Troca| M
    L --> N
    M --> N
    N -->|Baixa Automática| F
    F -->|≤ 5 unidades| G
    G -->|Status: PENDENTE| O
    O -->|Status: VISTO| P
    P --> A
```

---

## 🏗️ Fluxo de Cadastro de Produto

```mermaid
flowchart LR
    A[Recebimento da Mercadoria] --> B{Já existe no sistema?}
    B -->|Não| C[Cadastrar Novo Item]
    B -->|Sim| D[Atualizar Quantidade]
    C --> E[Definir Categoria]
    D --> E
    E --> F[Rancho / Linha Mata / Manutenção / Pesca / EDS]
    F --> G[Inserir Preço de Custo Manaus]
    G --> H[Inserir Frete Proporcional]
    H --> I[Cálculo Automático: Custo de Chegada]
    I --> J[Definir Margem de Lucro]
    J --> K[Preço de Venda Final]
    K --> L[Salvar no Estoque]
    L --> M[Disponível para Venda]
```

---

## 💳 Fluxo da Caderneta de Crédito

```mermaid
flowchart TD
    A[Cliente no Ponto de Venda] --> B{Cliente tem cadastro?}
    B -->|Não| C[Cadastrar Cliente]
    B -->|Sim| D[Identificar Cliente]
    C --> D
    D --> E[Selecionar Produtos]
    E --> F[Finalizar Venda]
    F --> G{Tipo de Lançamento}
    G -->|Venda à Vista| H[Débito Imediato]
    G -->|Venda Fiado| I[Lançar na Caderneta]
    G -->|Troca/Escambo| J[Registrar Troca]
    H --> K[Venda Concluída]
    I --> L[Saldo Devedor aumenta]
    J --> M[Saldo Devedor reduz]
    L --> N[Histórico de Lançamentos]
    M --> N
    N --> O{Quitação?}
    O -->|Pagamento| P[Lançar Pagamento]
    P --> Q[Saldo Devedor reduz]
    Q --> R[Fim]
    O -->|Novo Fiado| I
```

---

## 🚨 Fluxo de Alertas de Estoque

```mermaid
flowchart LR
    A[Venda Realizada] --> B[Baixa Automática no Estoque]
    B --> C{Quantidade ≤ 5?}
    C -->|Sim| D[Gerar Alerta PENDENTE]
    C -->|Não| E[Estoque Normal]
    D --> F[Exibir no Painel de Alertas]
    F --> G[Visualizado pelo Responsável]
    G --> H[Status: VISTO]
    H --> I[Compra em Manaus]
    I --> J[Entrada no Estoque]
    J --> K[Status: RESOLVIDO]
    K --> L[Remover do Painel]
```

---

## 📋 Fluxo do Módulo de Reposição

```mermaid
flowchart LR
    A[Vendas do Mês] --> B[Geração Automática]
    B --> C[Lista de Reposição]
    C --> D{Tabela Dinâmica}
    D --> E[Produto]
    D --> F[Categoria]
    D --> G[Qtde Vendida]
    C --> H[Exportar/Imprimir]
    H --> I[Compra em Manaus]
```

**Descrição:** Ferramenta de auxílio à logística para geração de listas de compras mensais baseadas em estoque baixo.

---

## 🧮 Fluxo de Cálculo de Preço (Precificação Interna)

```mermaid
flowchart TB
    subgraph Entrada["📥 Dados de Entrada"]
        A[Preço de Custo em Manaus]
        B[Valor do Frete Fluvial]
        C[Margem de Lucro Desejada %]
    end

    subgraph Processamento["⚙️ Processamento"]
        D[Custo de Chegada = A + B]
        E[Valor da Margem = D × C%]
    end

    subgraph Saida["📤 Resultado"]
        F[Preço de Venda Final = D + E]
    end

    A --> D
    B --> D
    D --> E
    E --> F
    C --> E
```

---

## 🎨 Arquitetura UI/UX - Sticky Elements

### Estrutura de Layout

```mermaid
flowchart TB
    subgraph Viewport["🖥️ Viewport do Notebook"]
        subgraph HeaderSticky["📌 Header Sticky (50px)"]
            A[🌸 Logo + Título] --> B[📦 🛒 📒 📋 Navegação]
        end
        
        subgraph MainContent["📄 Conteúdo Principal"]
            subgraph GridProdutos["📦 Grid de Produtos"]
                C[Cards de Produtos]
                D[Scroll da Página]
            end
            
            subgraph CarrinhoSticky["🛒 Carrinho Sticky"]
                E[Header do Carrinho]
                F[Lista de Itens - Scroll Interno]
                G[Totais - Fixo]
                H[Botões Finalizar/Caderneta - Fixos]
            end
        end
    end
    
    HeaderSticky -->|Sticky top: 0| Viewport
    CarrinhoSticky -->|Sticky top: 55px| MainContent
```

### Propriedades CSS Sticky

| Elemento | Position | Top | Z-Index | Altura |
|----------|----------|-----|---------|--------|
| **Header** | `sticky` | `0` | `1000` | ~50px |
| **Carrinho** | `sticky` | `55px` | - | `calc(100vh - 90px)` |

### Flexbox do Carrinho

```
┌─────────────────────┐
│ Header Carrinho     │  flex-shrink: 0
├─────────────────────┤
│                     │
│ Lista de Itens      │  flex: 1, overflow-y: auto
│ (Scroll Interno)    │
│                     │
├─────────────────────┤
│ Totais              │  flex-shrink: 0
├─────────────────────┤
│ Botões              │  flex-shrink: 0, margin-top: auto
└─────────────────────┘
```

---

## 🔄 Arquitetura do Sistema (SoC)

```mermaid
flowchart TB
    subgraph HTML["📄 index.html"]
        A[Templates HTML5]
        B[Data-Attributes]
        C[Estrutura Semântica]
    end

    subgraph CSS["🎨 styles.css"]
        D[Variáveis de Tema]
        E[Classes de Estado]
        F[Media Queries]
    end

    subgraph JS["⚡ script.js"]
        G[Processamento de Dados]
        H[Cálculos de Negócio]
        I[Manipulação via DOM API]
    end

    subgraph Storage["💾 LocalStorage"]
        J[Dados Persistentes]
    end

    A --> I
    D --> E
    G --> H
    H --> I
    I --> J
    I --> B
    B --> C
```

---

## 📊 Diagrama de Estados - Alerta de Estoque

```mermaid
stateDiagram-v2
    [*] --> PENDENTE : Venda atinge nível crítico
    PENDENTE --> VISTO : Responsável visualiza
    VISTO --> RESOLVIDO : Estoque reposto
    RESOLVIDO --> [*] : Removido do painel
    PENDENTE --> RESOLVIDO : Estoque reposto sem visualização
```

---

## 🎯 Diagrama de Casos de Uso

```mermaid
flowchart TB
    subgraph Atores["👥 Atores"]
        V[Vendedor]
        G[Gerente/Proprietário]
        C[Cliente]
    end

    subgraph Casos["📋 Casos de Uso"]
        UC1[Cadastrar Produto]
        UC2[Gerenciar Estoque]
        UC3[Realizar Venda]
        UC4[Gerenciar Caderneta]
        UC5[Verificar Alertas]
        UC6[Calcular Preços]
    end

    V --> UC2
    V --> UC3
    V --> UC4
    G --> UC1
    G --> UC5
    G --> UC6
    C --> UC3
```

---

**Fluxogramas Flor do Luar v1.0** 🌙
*Representação visual dos processos de logística fluvial amazônica*
