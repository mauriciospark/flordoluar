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

# Changelog

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere a [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2026-08-12

### Added
- **Interface Otimizada v2.0**: Header unificado em linha única com sticky positioning
- **Carrinho Inteligente**: Position sticky com scroll interno e botões fixos
- **Design Compacto**: Otimizado para telas de notebook (~50px header)
- **Sistema de Gestão Completo**: Implementação inicial do sistema de gestão para mercearias
- **Gestão de Estoque**: 
  - Cadastro de itens com categorização (Rancho, Bebidas, Linha Mata, Manutenção, Ferragens/Pesca, EDS)
  - Controle de quantidade, custo, frete e preço de venda
  - Sistema inteligente de cálculo de frete proporcional para bebidas
  - Definição de estoque mínimo com alertas automáticos
  - Dashboard visual com cards de categorias
  - Filtros dinâmicos por categoria
- **Sistema de Vendas**:
  - Interface de PDV intuitiva
  - Carrinho de compras com múltiplos itens
  - Cálculo automático de subtotal e total
  - Finalização de venda à vista ou na caderneta
  - Baixa automática de estoque após venda
  - Histórico completo de vendas realizadas
- **Caderneta de Crédito**:
  - Cadastro de clientes com histórico completo
  - Registro de vendas na caderneta (fiado)
  - Registro de pagamentos e trocas
  - Cálculo automático de saldo devedor
  - Visualização de histórico de transações por cliente
  - Dashboard com total a receber e clientes ativos
- **Lista de Reposição Inteligente**:
  - Geração automática de lista baseada em vendas mensais
  - Identificação de produtos com alto giro
  - Filtro por categorias prioritárias
  - Funcionalidade de impressão da lista
- **Arquitetura Local-First**:
  - Sistema completo que funciona offline
  - Persistência via LocalStorage
  - Exportação de dados em JSON para backup
  - Privacidade total dos dados do usuário
- **Interface SPA**:
  - Navegação Single Page Application
  - Transições suaves entre seções
  - Header sticky com detecção de scroll
  - Design responsivo e moderno
- **API de Scanner Remoto**:
  - Sistema de pareamento estilo Kahoot
  - Geração de PIN numérico de 4 dígitos
  - Long-polling para sincronização em tempo real
  - Suporte a múltiplos dispositivos conectados
  - Gerenciamento de sessões com expiração automática
- **Sistema de Alertas**:
  - Alertas automáticos de estoque crítico
  - Painel visual de alertas na interface
  - Histórico de alertas emitidos
  - Níveis de prioridade (CRÍTICO/ALERTA)
- **Firebase Integration**:
  - Configuração opcional para Firebase Realtime Database
  - SDK v12.12.1 integrado
  - Suporte para sincronização em nuvem opcional
- **Documentação Completa**:
  - README.md com guia de instalação e uso
  - LICENSE com licença MIT
  - ABOUT.md com história e filosofia do projeto
  - ARCHITECTURE.md com design técnico detalhado
  - CONTRIBUTING.md com guia de contribuição
  - CHANGELOG.md com histórico de versões

### Changed
- **Interface**: Redesign completo com sticky elements e layout compacto
- **Performance**: Código otimizado para hardware modesto
- **Acessibilidade**: Melhorias em atributos ARIA e navegação por teclado
- **Carrinho**: Implementação de flexbox com scroll interno independente

### Fixed
- **Compatibilidade**: Sistema testado em navegadores modernos (Chrome, Firefox, Edge, Safari)
- **Persistência**: Correção de problemas de cache no LocalStorage
- **Cálculos**: Validação de cálculos de frete proporcional para bebidas

---

## Próximas Versões Planejadas

### [2.1.0] - Planejado
- [ ] Relatórios avançados com gráficos de tendências
- [ ] Integração fiscal básica
- [ ] Melhorias na interface baseadas em feedback
- [ ] Sistema de busca avançado no estoque

### [2.2.0] - Planejado
- [ ] App mobile para Android/iOS
- [ ] Suporte multi-usuário com permissões
- [ ] Integração com hardware (impressoras, leitores)
- [ ] Gestão de fornecedores

### [3.0.0] - Planejado
- [ ] Previsão de demanda com IA
- [ ] Sincronização peer-to-peer criptografada
- [ ] Marketplace de extensões
- [ ] Ecossistema Spark integration

---

**Desenvolvido com 🌙 pela Linhagem SPARK**  
*Privacidade, Eficiência, Autonomia e Design*