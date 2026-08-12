/*
  ============================================================================
  PROPRIETÁRIO: Mauricio Spark
  MARCA:        SparkMauricio
  PROJETO:      Flor Do Luar
  VERSÃO:       v2.0.0
  LINHAGEM:     SPARK
  ============================================================================
  Documento de Planejamento de Escopo
  COPYRIGHT: © 2026 / Mauricio Spark. Todos os direitos reservados.
  ============================================================================
*/

# Guia de Contribuição — Padrões e Boas Práticas (Linhagem SPARK)

Este documento estabelece as diretrizes e padrões para contribuições ao projeto Flor Do Luar. Seguir estas diretrizes garante consistência, qualidade e manutenibilidade do código.

## Princípios de Contribuição

### Valores Fundamentais da Linhagem SPARK
- **Privacidade First**: Todas as contribuições devem respeitar e reforçar a privacidade dos dados
- **Simplicidade**: Código limpo, direto e fácil de entender
- **Autonomia**: Soluções que funcionem localmente sem dependências externas críticas
- **Design**: Interfaces intuitivas e experiências de usuário agradáveis

## Processo de Contribuição

### 1. Fluxo de Trabalho Padrão

#### Para Novos Contribuidores
1. **Fork do Repositório**: Crie sua cópia do projeto
2. **Clone Local**: Clone seu fork para desenvolvimento local
3. **Branch de Feature**: Crie uma branch para sua contribuição
4. **Desenvolvimento**: Implemente suas alterações seguindo os padrões
5. **Testes**: Valide suas alterações completamente
6. **Commit**: Faça commits com mensagens claras e descritivas
7. **Push**: Envie suas alterações para seu fork
8. **Pull Request**: Abra um PR descrevendo suas mudanças

#### Para Mantenedores
1. **Revisão**: Analise o PR com atenção aos padrões estabelecidos
2. **Feedback**: Forneça feedback construtivo quando necessário
3. **Testes**: Valide as alterações em ambiente de teste
4. **Aprovação**: Aprove o PR se atender aos padrões
5. **Merge**: Integre as alterações ao branch principal
6. **Release**: Atualize CHANGELOG.md quando apropriado

### 2. Tipos de Contribuições

#### **Bug Fixes**
- Correção de erros identificados
- Deve incluir testes que reproduzam o bug
- Mensagem de commit deve começar com `fix:`

#### **Features**
- Novas funcionalidades planejadas
- Deve seguir a arquitetura existente
- Mensagem de commit deve começar com `feat:`

#### **Documentation**
- Atualizações na documentação
- Melhorias em comentários de código
- Mensagem de commit deve começar com `docs:`

#### **Refactoring**
- Melhorias na estrutura do código sem mudança de comportamento
- Deve manter compatibilidade
- Mensagem de commit deve começar com `refactor:`

#### **Performance**
- Otimizações de performance
- Deve incluir medições antes/depois
- Mensagem de commit deve começar com `perf:`

#### **Style**
- Ajustes de formatação e estilo
- Não deve alterar lógica
- Mensagem de commit deve começar com `style:`

## Padrões de Nomenclatura

### 1. Branches

#### Estrutura de Nomes
```
<tipo>/<descrição-curta>
```

#### Tipos de Branches
- **feature/**: Nova funcionalidade
  - Exemplo: `feature/sistema-alertas-estoque`
  - Exemplo: `feature/integracao-firebase`

- **bugfix/**: Correção de bug
  - Exemplo: `bugfix/correcao-calculo-frete-bebidas`
  - Exemplo: `bugfix/erro-validacao-formulario`

- **hotfix/**: Correção urgente em produção
  - Exemplo: `hotfix/correcao-critica-seguranca`

- **refactor/**: Refatoração de código
  - Exemplo: `refactor/otimizacao-datamanager`
  - Exemplo: `refactor/modularizacao-interface`

- **docs/**: Atualizações de documentação
  - Exemplo: `docs/atualizacao-readme`
  - Exemplo: `docs/novo-guia-instalacao`

- **release/**: Preparação de release
  - Exemplo: `release/v1.1.0`
  - Exemplo: `release/v2.0.0-beta`

#### Regras para Nomes de Branches
- **Minúsculas**: Sempre em minúsculas
- **Hífens**: Use hífens para separar palavras
- **Descritivo**: Nome deve ser claro e específico
- **Curto**: Preferencialmente menos de 50 caracteres
- **Sem acentos**: Evite caracteres especiais e acentos

### 2. Commits

#### Formato de Mensagens
```
<tipo>: <descrição-curta>

<descrição-detalhada (opcional)>

<footers (opcional)>
```

#### Tipos de Commits
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação/estilo
- **refactor**: Refatoração
- **perf**: Performance
- **test**: Testes
- **chore**: Tarefas de manutenção

#### Exemplos de Commits
```
feat: adicionar sistema de alertas de estoque crítico

Implementa verificação automática de níveis de estoque e
geração de alertas visuais quando itens atingem quantidade
mínima configurada.

Closes #123
```

```
fix: corrigir cálculo de frete proporcional para bebidas

O cálculo estava considerando apenas o valor total do fardo
sem aplicar os fatores proporcionais corretos para cada
tipo de embalagem (lata, pet, caçulinha).

Fixes #456
```

```
docs: atualizar README com instruções de instalação

Adiciona seção sobre pré-requisitos e passo a passo detalhado
para configuração do ambiente de desenvolvimento.
```

## Padrões de Código

### 1. JavaScript/TypeScript

#### Estilo de Código
- **Indentação**: 4 espaços (tabs)
- **Aspas**: Preferencialmente aspas simples `'`
- **Ponto e Vírgula**: Obrigatório no final de linhas
- **Nomes de Variáveis**: camelCase
- **Nomes de Constantes**: UPPER_SNAKE_CASE
- **Nomes de Funções**: camelCase
- **Nomes de Classes**: PascalCase

#### Exemplo de Código Padrão
```javascript
// Constantes de configuração
const CONFIG_ESTOQUE = {
    NIVEL_CRITICO: 5,
    NIVEL_ALERTA_PERCENTUAL: 0.5,
    LOCAIS_REPOSICAO: ['Manaus']
};

// Funções com nomes descritivos
function calcularFreteProporcional(valorFardo, tipoBebida) {
    const fatores = FATORES_FRETE_BEBIDAS;
    const fator = fatores[tipoBebida] || fatores.individual;
    
    return valorFardo * fator;
}

// Classes com PascalCase
class GestorEstoque {
    constructor(configuracao) {
        this.configuracao = configuracao;
        this.itens = [];
    }
    
    adicionarItem(item) {
        this.itens.push(item);
    }
}
```

#### Comentários
- **JSDoc**: Documente funções públicas com JSDoc
- **Inline**: Use comentários inline para lógica complexa
- **TODO**: Marque tarefas pendentes com `// TODO:`
- **FIXME**: Marque correções necessárias com `// FIXME:`

```javascript
/**
 * Calcula o frete proporcional para bebidas baseado no tipo de embalagem
 * @param {number} valorFardo - Valor total do frete do fardo
 * @param {string} tipoBebida - Tipo de embalagem (lata, pet, caculinha, etc)
 * @returns {number} Valor do frete proporcional por unidade
 */
function calcularFreteProporcional(valorFardo, tipoBebida) {
    // TODO: Adicionar suporte para novos tipos de embalagem
    const fatores = FATORES_FRETE_BEBIDAS;
    const fator = fatores[tipoBebida] || fatores.individual;
    
    return valorFardo * fator;
}
```

### 2. CSS

#### Organização
- **Variáveis CSS**: Defina variáveis para cores, espaçamentos, etc.
- **BEM**: Use metodologia BEM para nomeação de classes
- **Responsivo**: Mobile-first approach
- **Performático**: Evite seletores aninhados profundos

#### Exemplo de CSS Padrão
```css
/* Variáveis CSS */
:root {
    --primary: #2563eb;
    --primary-dark: #1d4ed8;
    --success: #16a34a;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
}

/* Metodologia BEM */
.card {
    padding: var(--spacing-lg);
    border-radius: 0.5rem;
    background: var(--light);
}

.card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card__title {
    font-size: 1.25rem;
    font-weight: 700;
}

.card__body {
    margin-top: var(--spacing-md);
}

/* Mobile-first */
@media (min-width: 768px) {
    .card {
        padding: var(--spacing-lg) * 1.5;
    }
}
```

### 3. PHP

#### Estilo de Código
- **Indentação**: 4 espaços
- **Chaves**: K&R style
- **Nomes**: camelCase para funções, PascalCase para classes
- **DocBlocks**: Documente todas as funções públicas

#### Exemplo de PHP Padrão
```php
<?php
/**
 * FLOR DO LUAR - API de Sincronização
 * Sistema de pareamento estilo Kahoot
 */

/**
 * Gera um PIN numérico único de 4 dígitos
 * @return string PIN gerado
 */
function gerarPIN() {
    do {
        $pin = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    } while (sessaoExiste($pin));
    
    return $pin;
}

/**
 * Valida PIN e retorna dados da sessão
 * @param string $pin PIN a ser validado
 * @return array Resultado da validação
 */
function parearSessao($pin) {
    // Validação de entrada
    if (empty($pin) || !preg_match('/^\d{4}$/', $pin)) {
        return ['success' => false, 'message' => 'PIN inválido'];
    }
    
    // Lógica de pareamento
    $sessao = carregarSessao($pin);
    
    if (!$sessao) {
        return ['success' => false, 'message' => 'Sessão não encontrada'];
    }
    
    return ['success' => true, 'sessao' => $sessao];
}
```

### 4. HTML

#### Estrutura
- **Semântico**: Use tags HTML5 semânticas
- **Acessibilidade**: Inclua atributos ARIA quando necessário
- **Organização**: Indentação consistente
- **Comentários**: Comente seções complexas

#### Exemplo de HTML Padrão
```html
<!-- Header Principal -->
<header class="header">
    <div class="brand">
        <span class="brand-icon">🌙</span>
        <div class="brand-text">
            <h1>Flor Do Luar</h1>
            <span class="brand-subtitle">Mercearia e Logística</span>
        </div>
    </div>
    
    <nav class="main-nav" aria-label="Navegação principal">
        <button data-page="estoque" class="nav-btn active" aria-current="page">
            📦 Estoque
        </button>
        <button data-page="vendas" class="nav-btn">
            🛒 Vendas
        </button>
    </nav>
</header>

<!-- Conteúdo Principal -->
<main class="main-content">
    <section id="page-estoque" class="page active">
        <div class="page-header">
            <h2>Gestão de Estoque</h2>
            <button class="btn btn-primary" onclick="estoque.abrirModal()">
                + Novo Item
            </button>
        </div>
    </section>
</main>
```

## Validações Obrigatórias

### 1. Antes de Submeter Alterações

#### Checklist de Validação
- [ ] **Código Limpo**: Sem console.log ou código comentado
- [ ] **Formatação**: Segue os padrões de estilo estabelecidos
- [ ] **Testes**: Funcionalidades testadas manualmente
- [ ] **Compatibilidade**: Funciona nos navegadores suportados
- [ ] **Privacidade**: Não introduz rastreamento ou coleta de dados
- [ ] **Performance**: Não degrada performance do sistema
- [ ] **Acessibilidade**: Mantém ou melhora acessibilidade
- [ ] **Documentação**: Atualiza documentação relevante
- [ ] **Commits**: Mensagens de commit seguem padrão
- [ ] **Branch**: Branch nomeado corretamente

### 2. Validações Automáticas (Futuro)

#### Linting
```bash
# JavaScript/TypeScript
npm run lint

# CSS
npm run stylelint

# PHP
composer phpcs
```

#### Testes
```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e
```

#### Build
```bash
# Build de produção
npm run build

# Verificação de build
npm run check
```

## Padrões Específicos do Projeto

### 1. Cabeçalho de Arquivos

Todos os arquivos de código devem iniciar com o cabeçalho oficial:

```javascript
/*
  ============================================================================
  PROPRIETÁRIO: Mauricio Spark
  MARCA:        SparkMauricio
  PROJETO:      Flor Do Luar
  VERSÃO:       v1.0.0
  LINHAGEM:     SPARK
  ============================================================================
  Documento de Planejamento de Escopo
  COPYRIGHT: © 2026 / Mauricio Spark. Todos os direitos reservados.
  ============================================================================
*/
```

### 2. Estrutura de Diretórios

```
flordoluar/
├── css/              # Estilos CSS
├── javascript/       # Scripts JavaScript
├── php/             # Scripts PHP (API)
├── favicon/         # Ícones e favicon
├── docs/            # Documentação adicional
├── index.html       # Página principal
├── README.md        # Documentação principal
├── LICENSE          # Licença MIT
├── ABOUT.md         # Sobre o projeto
├── ARCHITECTURE.md  # Arquitetura técnica
├── CONTRIBUTING.md  # Guia de contribuição
└── CHANGELOG.md     # Histórico de versões
```

### 3. Padrões de Local-First

Toda nova funcionalidade deve:
- **Funcionar Offline**: Não depender de conexão com internet
- **Privacidade First**: Não enviar dados sem consentimento explícito
- **LocalStorage**: Usar LocalStorage para persistência
- **Fallback**: Ter fallback para quando recursos externos falharem

## Pull Request Guidelines

### 1. Título do PR

#### Formato
```
<tipo>: <descrição-curta>
```

#### Exemplos
- `feat: adicionar sistema de alertas de estoque`
- `fix: corrigir cálculo de frete proporcional`
- `docs: atualizar guia de instalação`

### 2. Descrição do PR

#### Estrutura Obrigatória
```markdown
## Descrição
Breve descrição das alterações implementadas.

## Tipo de Alteração
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Motivação e Contexto
Por que esta alteração é necessária? Qual problema ela resolve?

## Como Testar
Passos detalhados para testar as alterações.

## Screenshots (se aplicável)
Capturas de tela mostrando as alterações.

## Checklist
- [ ] Meu código segue os padrões de estilo
- [ ] Realizei self-review do meu código
- [ ] Comentei código complexo
- [ ] Atualizei a documentação
- [ ] Não há alterações em arquivos sem meu conhecimento
- [ ] Testei manualmente as alterações
```

### 3. Revisão de Código

#### Para Revisores
- **Construtivo**: Feedback seja específico e construtivo
- **Respeitoso**: Mantenha tom profissional e respeitoso
- **Completo**: Revise código, testes e documentação
- **Tempestivo**: Responda aos PRs em tempo razoável

#### Para Contribuidores
- **Aberto**: Aceite feedback construtivo
- **Responsivo**: Responda às solicitações de revisão
- **Iterativo**: Esteja disposto a fazer ajustes
- **Agradecido**: Agradeça o tempo dos revisores

## Comunicação e Suporte

### Canais de Comunicação
- **Issues**: Para bugs e feature requests
- **Discussions**: Para dúvidas e conversas técnicas
- **PRs**: Para contribuições de código

### Código de Conduta
- **Respeito**: Trate todos com respeito e profissionalismo
- **Inclusão**: Seja acolhedor com novos contribuidores
- **Colaboração**: Trabalhe em conjunto para o melhor do projeto
- **Aprendizado**: Esteja aberto a aprender e ensinar

## Reconhecimento

Contribuidores serão reconhecidos no:
- **CHANGELOG.md**: Menção em releases relevantes
- **README.md**: Seção de contribuidores
- **Commits**: Atribuição clara nos commits

---

**Desenvolvido com 🌙 pela Linhagem SPARK**  
*Privacidade, Eficiência, Autonomia e Design*