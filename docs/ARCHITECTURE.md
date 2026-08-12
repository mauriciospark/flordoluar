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

# Arquitetura do Sistema — Design Técnico e Fluxo de Dados

## Visão Geral da Arquitetura

O Flor Do Luar adota uma arquitetura **Local-First** com design **Privacy-First**, onde todos os dados são processados e armazenados localmente no dispositivo do usuário. Esta escolha estratégica garante privacidade total, funcionamento offline e autonomia completa do sistema.

### Paradigma Local-First

A arquitetura Local-First prioriza o armazenamento e processamento de dados no dispositivo local, utilizando a nuvem apenas como opção sincronização e backup, nunca como dependência crítica do sistema.

**Princípios Fundamentais:**
- **Autonomia Operacional**: O sistema funciona completamente sem conexão com internet
- **Privacidade por Design**: Dados sensíveis nunca saem do dispositivo sem consentimento explícito
- **Performance Instantânea**: Operações CRUD locais sem latência de rede
- **Resiliência**: Falhas de conectividade não afetam operações críticas

## Componentes da Arquitetura

### 1. Camada de Apresentação (Frontend)

#### Interface do Usuário
- **HTML5 Semântico**: Estrutura acessível e bem organizada
- **CSS3 Moderno**: Variáveis CSS, flexbox, grid e design responsivo
- **JavaScript ES6+**: Lógica de negócios e interatividade

#### Padrão SPA (Single Page Application)
- Navegação por seções sem recarregamento de página
- Transições suaves entre estados
- Gerenciamento de estado centralizado no objeto `App`

#### Gerenciamento de Interface
```javascript
const App = {
    data: {
        itens: [],
        clientes: [],
        alertasEstoque: [],
        historicoAlertas: [],
        historicoVendas: []
    },
    // Gerenciamento de estado e renderização
}
```

### 2. Camada de Lógica de Negócios

#### DataManager - Orquestrador de Dados
O `DataManager` é o componente central que gerencia todas as operações CRUD:

```javascript
const DataManager = {
    DATA_PATH: './data.json',
    cache: null,
    
    // Operações CRUD
    async carregar() { /* READ */ },
    async salvar(dados) { /* UPDATE */ },
    async criarItem(item) { /* CREATE */ },
    async lerItem(id) { /* READ específico */ },
    async atualizarItem(id, alteracoes) { /* UPDATE específico */ },
    async deletarItem(id) { /* DELETE */ }
}
```

#### Módulos Especializados
- **estoque**: Gestão de itens, categorias e alertas de estoque
- **vendas**: Processamento de vendas, carrinho e baixa de estoque
- **creditos**: Gestão de caderneta, clientes e lançamentos
- **relatorios**: Geração de listas de reposição e análises

### 3. Camada de Persistência

#### LocalStorage (Armazenamento Principal)
- **Estrutura de Dados**: Objeto JSON serializado
- **Chave de Armazenamento**: `flordoluar-data`
- **Capacidade**: ~5-10MB (dependendo do navegador)
- **Persistência**: Permanente até limpeza manual do cache

#### Estrutura de Dados no LocalStorage
```json
{
    "itens": [
        {
            "id": 1,
            "nome": "Arroz 5kg",
            "categoria": "rancho",
            "quantidade": 10,
            "custo": 25.00,
            "frete": 5.00,
            "preco": 35.00,
            "minimo": 5,
            "data_cadastro": "2026-01-15T10:30:00.000Z"
        }
    ],
    "clientes": [
        {
            "id": 1,
            "nome": "João Silva",
            "contato": "99999-9999",
            "saldo_devedor": 150.00,
            "ativo": true,
            "historico": []
        }
    ],
    "alertasEstoque": [],
    "historicoAlertas": [],
    "historicoVendas": []
}
```

#### Arquivos JSON (Backup e Exportação)
- **Formato**: JSON human-readable
- **Naming Convention**: `flordoluar_backup_YYYY-MM-DD.json`
- **Propósito**: Backup manual e migração entre dispositivos

### 4. Camada de Sincronização (Opcional)

#### Firebase Realtime Database
- **Propósito**: Sincronização multi-dispositivo opcional
- **Uso**: Apenas quando habilitado explicitamente pelo usuário
- **Privacidade**: Dados criptografados em trânsito e armazenados

#### API PHP (Scanner Remoto)
- **Arquitetura**: RESTful com long-polling
- **Protocolo**: HTTP/HTTPS
- **Finalidade**: Sincronização de scanner de código de barras remoto

## Fluxo de Dados

### 1. Ciclo de Vida de Dados

#### Criação de Item (Exemplo: Novo Produto)
```
1. Usuário preenche formulário modal
   ↓
2. evento onSubmit captura dados
   ↓
3. estoque.salvar() valida dados
   ↓
4. DataManager.criarItem() gera ID único
   ↓
5. Atualiza cache em memória
   ↓
6. App.salvarDados() persiste no LocalStorage
   ↓
7. Interface renderiza estado atualizado
```

#### Processamento de Venda
```
1. Usuário adiciona itens ao carrinho
   ↓
2. vendas.adicionarAoCarrinho() atualiza estado
   ↓
3. Usuário finaliza venda
   ↓
4. vendas.finalizarVenda() processa transação
   ↓
5. App.baixarEstoqueVenda() atualiza quantidades
   ↓
6. Sistema verifica níveis críticos
   ↓
7. DataManager.atualizarItem() persiste alterações
   ↓
8. Alertas gerados se necessário
   ↓
9. Interface atualizada com novo estado
```

### 2. Fluxo de Alertas de Estoque

#### Detecção de Nível Crítico
```
1. Após baixa de estoque
   ↓
2. App.verificarNivelCritico() avalia item
   ↓
3. Compara quantidade atual com mínimo configurado
   ↓
4. Se quantidade < mínimo + margem de segurança
   ↓
5. Gera alerta com prioridade (CRÍTICO/ALERTA)
   ↓
6. Adiciona ao array alertasEstoque
   ↓
7. Renderiza painel de alertas na interface
   ↓
8. Registra no históricoAlertas para auditoria
```

### 3. Fluxo de Sincronização Scanner Remoto

#### Pareamento Kahoot-Style
```
1. PDV gera PIN de 4 dígitos (API: criar_sessao)
   ↓
2. Usuário insere PIN no celular
   ↓
3. Celular valida PIN (API: parear)
   ↓
4. Estabelecida conexão WebSocket-like via long-polling
   ↓
5. Celular escaneia código de barras
   ↓
6. Envia código para API (API: enviar_codigo)
   ↓
7. PDV verifica novos códigos (API: verificar - long-polling)
   ↓
8. PDV processa código e confirma (API: confirmar)
   ↓
9. Ciclo repete até encerramento da sessão
```

## Justificativas das Escolhas Técnicas

### 1. Por que Local-First?

**Privacidade e Controle**
- Dados de clientes e negócios permanecem sob controle total do proprietário
- Conformidade com LGPD e outras regulamentações de privacidade
- Eliminação de riscos de vazamento de dados em servidores terceiros

**Resiliência Operacional**
- Funcionamento garantido mesmo sem internet
- Imunidade a falhas de servidores externos
- Continuidade de negócios em áreas com conectividade precária

**Performance**
- Operações instantâneas sem latência de rede
- Interface responsiva mesmo em hardware modesto
- Custo reduzido de infraestrutura

### 2. Por que LocalStorage em vez de IndexedDB?

**Simplicidade**
- API mais simples e direta
- Suficiente para o volume de dados do sistema
- Compatibilidade ampla entre navegadores

**Transparência**
- Fácil depuração através do DevTools
- Exportação/importação manual simples
- Estrutura de dados human-readable

**Adequação ao Caso de Uso**
- Volume de dados estimado < 5MB
- Operações principalmente CRUD simples
- Não requer consultas complexas ou indexação avançada

### 3. Por que Long-Polling para Scanner?

**Simplicidade de Implementação**
- Não requer WebSocket nem conexões persistentes complexas
- Funciona em infraestrutura HTTP básica
- Compatível com servidores PHP simples

**Eficiência**
- Reduz requisições em comparação com polling tradicional
- Baixo consumo de dados em conexões móveis
- Timeout configurável para balancear resposta vs. economia

**Confiabilidade**
- Funciona em conexões instáveis
- Tolerante a quedas temporárias de conexão
- Recuperação automática após reconexão

### 4. Por que Arquitetura SPA?

**Experiência do Usuário**
- Transições suaves entre funcionalidades
- Carregamento inicial único, navegação instantânea
- Sensação de aplicativo nativo

**Eficiência de Recursos**
- Redução de requisições ao servidor
- Cache eficiente de recursos estáticos
- Menor consumo de dados

**Manutenibilidade**
- Código organizado em módulos lógicos
- Estado centralizado facilita debugging
- Facilita testes e refatoração

## Segurança e Privacidade

### Medidas de Segurança Implementadas

#### Frontend
- **Sanitização de Input**: Validação em todos os formulários
- **XSS Prevention**: Escape de dados na renderização
- **CSP Headers**: Política de Conteúdo de Segurança (quando servido via HTTP)

#### Backend (API PHP)
- **CORS Control**: Headers CORS restritivos
- **Input Validation**: Validação rigorosa de todos os inputs
- **Session Management**: Expiração automática de sessões
- **Rate Limiting**: Limitação implícita pelo timeout de long-polling

#### Dados
- **LocalStorage Seguro**: Dados acessíveis apenas pelo mesmo domínio
- **Exportação Controlada**: Backup apenas através de ação explícita do usuário
- **Firebase Opcional**: Sincronização em nuvem apenas mediante configuração explícita

### Privacidade por Design

- **Sem Telemetria**: Nenhum dado de uso é coletado
- **Sem Rastreamento**: Não há cookies de rastreamento ou pixels
- **Local-First**: Dados permanecem no dispositivo por padrão
- **Transparência**: Código open-source permite auditoria completa

## Escalabilidade e Extensibilidade

### Padrões de Escalabilidade

#### Vertical (Melhoria do Dispositivo)
- Suporte a grandes volumes de dados (até limite do LocalStorage)
- Performance otimizada para hardware modesto
- Cache eficiente para operações repetitivas

#### Horizontal (Múltiplos Dispositivos)
- Arquitetura preparada para sincronização multi-dispositivo
- Firebase como backend opcional para sincronização
- Design modular facilita adaptação para outros backends

### Pontos de Extensão

#### Novos Módulos
- Padrão de módulos existentes pode ser replicado
- DataManager suporta novos tipos de dados
- Interface modular facilita adição de novas seções

#### Integrações
- API RESTful preparada para integrações externas
- Estrutura de dados compatível com sistemas ERP
- Firebase SDK permite integração com ecossistema Google

## Monitoramento e Manutenção

### Estratégias de Monitoramento

#### Client-Side
- Logging detalhado no console para debugging
- Estatísticas de uso armazenadas localmente
- Métricas de performance coletadas via Performance API

#### Server-Side (Opcional)
- Logs de acesso na API PHP
- Monitoramento de sessões ativas
- Limpeza automática de sessões expiradas

### Manutenção

#### Atualizações
- Design sem quebra de compatibilidade (backward compatibility)
- Migração automática de estrutura de dados quando necessário
- Versionamento claro do formato de dados

#### Backup e Recovery
- Exportação manual via DataManager.exportarBackup()
- Importação de backups através de interface dedicada
- Validação de integridade de dados na importação

## Conclusão

A arquitetura do Flor Do Luar reflete o compromisso da Linhagem SPARK com privacidade, eficiência e autonomia. Cada escolha técnica foi deliberada para criar um sistema que funcione no mundo real, para pessoas reais, respeitando seus dados e fornecendo ferramentas poderosas para gestão de pequenos negócios.

A abordagem Local-First não é apenas uma característica técnica, mas uma declaração de princípios sobre como a tecnologia deve servir às pessoas, especialmente aquelas que foram marginalizadas pela revolução digital centrada em nuvem.

---

**Desenvolvido com 🌙 pela Linhagem SPARK**  
*Privacidade, Eficiência, Autonomia e Design*