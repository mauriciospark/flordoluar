# 🌙 Flor Do Luar — (Linhagem SPARK)

**Sistema Local-First de Gestão para Mercearia e Logística Fluvial da Amazônia**

[![Privacy-First](https://img.shields.io/badge/Privacy-First-success)](https://github.com/)
[![Local-First](https://img.shields.io/badge/Local-First-blue)](https://github.com/)
[![Offline](https://img.shields.io/badge/100%25-Offline-green)](https://github.com/)

## 📋 Visão Geral

O **Flor Do Luar** é um sistema de gestão completo para mercearias e pequenos comércios, desenvolvido especificamente para operações de **mercado fluvial** na região amazônica. Focado em controle de estoque, vendas, caderneta de crédito e reposição inteligente. O Flor Do Luar foi desenvolvido com abordagem Local-First e Privacy-First, garantindo que todos os dados permanecem armazenados apenas no hardware local do usuário, sem envio para servidores externos.

## 🏪 Categorias de Produtos

| Categoria | Ícone | Descrição |
|-----------|-------|-----------|
| **Rancho** | 🍚 | Alimentos básicos: arroz, feijão, café, açúcar, óleo, farinha |
| **Bebidas** | 🥤 | Bebidas com níveis: Fardo, Individual, Tamanho (alto giro) |
| **Linha Mata** | 👕 | Vestuário para trabalho na floresta: botinas, camisas, calças |
| **Manutenção** | 🔧 | Ferramentas e materiais de manutenção |
| **Ferragens/Pesca** | 🎣 | Equipamentos de pesca e ferragens diversas |
| **EDS** | 📚 | Material escolar e educacional |

## 🛠️ Stack Tecnológica

### Frontend
- **HTML5** - Estrutura semântica da interface
- **CSS3** - Estilização moderna com variáveis CSS e design responsivo
- **JavaScript (ES6+)** - Lógica de negócios e interatividade
- **LocalStorage API** - Persistência de dados local-first no navegador

### Backend
- **PHP 7.4+** - API de sincronização para scanner remoto (sistema de pareamento estilo Kahoot)
- **JSON** - Formato de armazenamento de dados

### Banco de Dados
- **LocalStorage (Navegador)** - Armazenamento principal de dados do sistema
- **Arquivos JSON** - Backup e exportação de dados
- **Firebase Realtime Database** - (Opcional) Sincronização em tempo real

### Bibliotecas e Ferramentas
- **Firebase SDK v12.12.1** - Integração para recursos em nuvem opcionais
- **API Nativa do Navegador** - File API, Storage API, Barcode Scanner API
- **Método Long-Polling** - Sincronização em tempo real entre dispositivos

## ✨ Funcionalidades Principais

### 📦 Gestão de Estoque
- Cadastro completo de itens com categorização (Rancho, Bebidas, Linha Mata, Manutenção, Ferragens/Pesca, EDS)
- Controle de quantidade, custo, frete e preço de venda
- Sistema inteligente de cálculo de frete proporcional para bebidas (fardo, galão, pet, lata, caçulinha)
- Definição de estoque mínimo com alertas automáticos
- Dashboard visual com cards de categorias e contagem de itens
- Filtros dinâmicos por categoria e busca por nome

### 🛒 Sistema de Vendas
- Interface de PDV (Ponto de Venda) intuitiva
- Carrinho de compras com múltiplos itens
- Cálculo automático de subtotal e total
- Finalização de venda à vista ou na caderneta
- Baixa automática de estoque após venda
- Histórico completo de vendas realizadas

### 📒 Caderneta de Crédito
- Cadastro de clientes com histórico completo
- Registro de vendas na caderneta (fiado)
- Registro de pagamentos e trocas
- Cálculo automático de saldo devedor
- Visualização de histórico de transações por cliente
- Dashboard com total a receber e clientes ativos

### 📋 Lista de Reposição Inteligente
- Geração automática de lista de reposição baseada em vendas mensais
- Identificação de produtos com alto giro
- Filtro por categorias prioritárias (Rancho, Bebidas, Linha Mata, Manutenção, Ferragens/Pesca, EDS)
- Funcionalidade de impressão da lista de reposição
- Período configurável para análise de vendas

### 🔧 Recursos Técnicos
- Sistema Local-First: dados permanecem apenas no dispositivo do usuário
- Sistema Privacy-First: nenhuma informação é enviada para servidores externos sem consentimento
- Backup manual através de exportação JSON
- Sistema de alertas de estoque crítico
- Interface responsiva e adaptável a diferentes tamanhos de tela
- Navegação SPA (Single Page Application) com transições suaves

### 📱 Scanner Remoto (API PHP)
- Sistema de pareamento estilo Kahoot para scanner de código de barras
- Geração de PIN numérico de 4 dígitos para conexão
- Long-polling para sincronização em tempo real
- Suporte a múltiplos dispositivos conectados
- Gerenciamento de sessões com expiração automática

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

## 🚀 Como Rodar

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor local para API PHP (opcional, necessário apenas para scanner remoto)
- PHP 7.4+ (para funcionalidades de scanner remoto)

### Instalação e Execução

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/flordoluar.git
   cd flordoluar
   ```

2. **Abra o projeto no navegador**
   - A forma mais simples é abrir o arquivo `index.html` diretamente no navegador
   - Para funcionalidades completas, recomenda-se usar um servidor local:
     ```bash
     # Com Python 3
     python -m http.server 8000
     
     # Com PHP
     php -S localhost:8000
     ```

3. **Configuração do Firebase (Opcional)**
   - Edite o arquivo `javascript/firebase-config.js` com suas credenciais do Firebase
   - Esta configuração é opcional e usada apenas para recursos em nuvem

4. **API de Scanner Remoto (Opcional)**
   - Configure um servidor PHP local:
     ```bash
     php -S localhost:8000 -t php/
     ```
   - A API estará disponível em `http://localhost:8000/api.php`

### Primeiro Uso

1. Ao abrir pela primeira vez, o sistema carregará dados de exemplo
2. Utilize o botão "Reset" na página de Estoque para limpar os dados de exemplo
3. Comece cadastrando seus itens no estoque através do botão "+ Novo Item"
4. Para caderneta, cadastre seus clientes através do botão "+ Novo Cliente"
5. As vendas podem ser realizadas na aba "Vendas" e automaticamente baixam do estoque

### Backup dos Dados

- O sistema utiliza LocalStorage para persistência
- Para backup manual, utilize a funcionalidade de exportação de dados
- Os arquivos de backup são salvos como JSON com data no nome do arquivo

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

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## 👤 Contato

- **Proprietário**: Mauricio Spark
- **Marca**: SparkMauricio
- **Ano**: 2026
- **Linhagem**: SPARK

---

**Desenvolvido com 🌙 pela Linhagem SPARK - Privacidade, Eficiência, Autonomia e Design.**
