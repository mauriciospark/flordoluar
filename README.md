# 🌙 Flor do Luar

**Sistema Local-First de Gestão para Mercearia e Logística Fluvial da Amazônia**

[![Privacy-First](https://img.shields.io/badge/Privacy-First-success)](https://github.com/)
[![Local-First](https://img.shields.io/badge/Local-First-blue)](https://github.com/)
[![Offline](https://img.shields.io/badge/100%25-Offline-green)](https://github.com/)

## 📋 Visão Geral

O **Flor do Luar** é um sistema de gestão de estoque e vendas desenvolvido especificamente para operações de **mercado fluvial** na região amazônica. Projetado com filosofia **Privacy-First/Local-First**, todos os dados são armazenados localmente no navegador, garantindo total privacidade e funcionamento offline.

## 🏪 Categorias de Produtos

| Categoria | Ícone | Descrição |
|-----------|-------|-----------|
| **Rancho** | 🍚 | Alimentos básicos: arroz, feijão, café, açúcar, óleo, farinha |
| **Bebidas** | 🥤 | Bebidas com níveis: Fardo, Individual, Tamanho (alto giro) |
| **Linha Mata** | 👕 | Vestuário para trabalho na floresta: botinas, camisas, calças |
| **Manutenção** | 🔧 | Ferramentas e materiais de manutenção |
| **Ferragens/Pesca** | 🎣 | Equipamentos de pesca e ferragens diversas |
| **EDS** | 📚 | Material escolar e educacional |

## ✨ Funcionalidades Principais

- **📦 Gestão de Estoque**: Controle completo de entrada e saída de mercadorias
- **📷 Scanner de Código de Barras**: Leitura via câmera do dispositivo ou leitor USB
- **🥤 Bebidas Multi-Nível**: Sistema de alto giro com Fardo/Grande/Médio/Tamanho/Caçulinha
- **🎨 Identidade Visual SPARK**: Design em verde e dourado, cards de categoria coloridos
- **� Reposição**: Ferramenta de auxílio à logística para geração de listas de compras mensais baseadas em estoque baixo
- **� Alertas de Reposição**: Notificações automáticas quando estoque atinge nível crítico (5 unidades)
- **📒 Caderneta de Crédito**: Sistema de vendas fiado com histórico de lançamentos e persistência local
- **🔄 Escambo/Troca**: Suporte a trocas tradicionais da região amazônica
- **💾 DataManager CRUD**: Operações completas de Criar, Ler, Atualizar, Deletar
- **🌐 100% Offline**: Funciona sem internet, dados salvos localmente no localStorage
- **🔒 100% Local**: Sem servidores externos, sem Firebase, sem dependências de nuvem

## 🎨 Interface Otimizada (v2.0)

### Header Unificado
- **Layout em linha única**: Logo à esquerda, navegação à direita
- **Sticky Header**: Cabeçalho fixo no topo durante scroll
- **Design compacto**: Otimizado para telas de notebook

### Carrinho Inteligente
- **Position Sticky**: Carrinho fixo no lado direito durante scroll
- **Scroll Interno**: Lista de produtos com rolagem independente
- **Botões Fixos**: "Finalizar Venda" e "Venda na Caderneta" sempre visíveis
- **CRUD Completo**: Adicionar, remover, alterar quantidades em tempo real

### Navegação Principal
📦 **Estoque** | 🛒 **Vendas** | 📒 **Caderneta** | 📋 **Reposição**

## 🚀 Como Usar

1. **Acesse o sistema**: Abra o arquivo `index.html` em qualquer navegador moderno
2. **Navegue pelas seções**:
   - **📦 Estoque**: Cadastre produtos e gerencie quantidades
   - **🛒 Vendas**: Registre vendas com carrinho sticky e botões fixos
   - **📒 Caderneta**: Gerencie clientes e lançamentos de crédito com persistência local
   - **📋 Reposição**: Gere listas de compras mensais baseadas em estoque baixo
3. **Backup de Dados**: Exporte os dados periodicamente via console ou copie o localStorage

## 🔒 Privacidade e Segurança

- **Zero dados na nuvem**: Tudo fica no seu dispositivo
- **Sem login obrigatório**: Acesso direto ao sistema
- **Sem rastreamento**: Sem analytics, sem cookies de terceiros
- **Backup manual**: Você controla quando e como exportar seus dados

## 💾 Onde os Dados são Armazenados

```
Navegador → LocalStorage → 'flordoluar-data'
```

Para fazer backup:
1. Abra o console do navegador (F12)
2. Execute: `localStorage.getItem('flordoluar-data')`
3. Copie o conteúdo e salve em um arquivo JSON

## 🛠️ Tecnologias

- **HTML5** com templates semânticos
- **CSS3** com design responsivo
- **JavaScript Vanilla** (ES6+)
- **LocalStorage API** para persistência
- **Separação de Responsabilidades**: Lógica pura em JS, estrutura em HTML, estilos em CSS

## 🥤 Sistema de Bebidas - Alto Giro

O sistema implementa um **sophisticado gerenciamento de bebidas** com múltiplos níveis de venda:

### Níveis de Venda

| Nível | Proporção Frete | Exemplo | Cor Borda |
|-------|-----------------|---------|-----------|
| **Fardo** | 100% (12x) | Pack 12 unidades | 🟢 Verde SPARK |
| **Grande** | 100% (1x) | Galão 20L | 🟣 Roxo |
| **Médio** | 15% | Pet 2L | 🔵 Ciano |
| **Tamanho** | 5% | Lata 350ml | 🟠 Laranja |
| **Caçulinha** | 3% | 200ml | 🩷 Rosa |

### Cálculo Proporcional

```
FRETE_FARDO = R$ 12,00
FRETE_MEDIO = R$ 12,00 × 0.15 = R$ 1,80
CUSTO_CHEGADA = PREÇO_MANAUS + FRETE_PROPORCIONAL
```

**Benefícios:**
- Venda de unidades avulsas sem prejuízo
- Estoque otimizado para produtos de alta rotatividade
- Etiquetas coloridas para identificação visual

## 📐 Especificações Técnicas

### Otimização para Notebooks

O sistema foi redesenhado para máxima eficiência em telas de notebook:

| Especificação | Valor |
|---------------|-------|
| **Header** | ~50px de altura (compacto) |
| **Carrinho** | 270px largura fixa, altura viewport-fit |
| **Grid Produtos** | max-width 280px por card |
| **Z-Index Header** | 1000 (sempre visível) |
| **Navegação** | 4 abas: Estoque, Vendas, Caderneta, Reposição |

### Histórico de Versões

**v2.0 (Abril 2025)**
- ✅ Header unificado em linha única (logo + navegação)
- ✅ Sticky header e carrinho lateral
- ✅ Carrinho com scroll interno e botões fixos
- ✅ Novo módulo de Reposição (substitui Precificação)
- ✅ Caderneta com persistência local aprimorada
- ✅ Design compacto otimizado para notebooks

**v1.0 (Inicial)**
- Gestão de estoque e vendas
- Sistema de bebidas multi-nível
- Caderneta de crédito
- Scanner de código de barras

## 📄 Licença

Projeto privado - Flor do Luar Logística Fluvial

---

**Desenvolvido para a realidade da Amazônia** 🌿
