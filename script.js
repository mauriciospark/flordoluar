// FLOR DO LUAR - Sistema de Gestão
// Sistema Local-First / Privacy-First

console.log('[FLOR DO LUAR] Script.js carregado - v' + new Date().toISOString().slice(0,10));

// Constantes de configuração de estoque
const CONFIG_ESTOQUE = {
    NIVEL_CRITICO: 5,           // Nível crítico de estoque (alerta Manaus)
    NIVEL_ALERTA_PERCENTUAL: 0.5, // 50% do mínimo = estoque baixo
    LOCAIS_REPOSICAO: ['Manaus'],
    CATEGORIAS_REPOSICAO: ['rancho', 'bebidas', 'vestuario', 'manutencao', 'ferramentas', 'escola'],
    // Configuração de níveis para bebidas (alto giro)
    BEBIDAS_NIVEIS: {
        fardo: { proporcao_frete: 1.0, descricao: 'Fardo (Atacado)', multiplicador: 12 },
        grande: { proporcao_frete: 1.0, descricao: 'Grande (Galão 20L)', multiplicador: 1 },
        medio: { proporcao_frete: 0.15, descricao: 'Médio (Pet 2L)', multiplicador: 1 },
        tamanho: { proporcao_frete: 0.05, descricao: 'Pequeno (Lata 350ml)', multiplicador: 1 },
        caçulinha: { proporcao_frete: 0.03, descricao: 'Caçulinha (200ml)', multiplicador: 1 }
    },
    // Mapeamento de tipos de bebidas para etiquetas
    BEBIDAS_TIPOS: {
        lata: 'Lata 350ml',
        lata_473: 'Lata 473ml',
        pet_500ml: 'Pet 500ml',
        pet_1l: 'Pet 1L',
        pet_2l: 'Pet 2L',
        pet_2_5l: 'Pet 2,5L',
        galao_5l: 'Galão 5L',
        galao_10l: 'Galão 10L',
        galao_20l: 'Galão 20L',
        caculinha: 'Caçulinha 200ml',
        long_neck: 'Long Neck 330ml',
        garrafa_600: 'Garrafa 600ml'
    }
};

// Mapeamento de categorias para exibição
const CATEGORIAS_REPOSICAO = {
    rancho: '🍚 Rancho',
    bebidas: '🥤 Bebidas',
    vestuario: '👕 Linha Mata',
    manutencao: '🔧 Manutenção',
    ferramentas: '🎣 Ferragens/Pesca',
    escola: '📚 EDS'
};

// Fatores de proporção para cálculo de frete em bebidas
const FATORES_FRETE_BEBIDAS = {
    fardo: 1.0,        // Frete total do fardo
    individual: 0.1,   // 10% do frete do fardo (ex: 1 garrafa de um pack)
    tamanho: 0.05      // 5% do frete do fardo (ex: lata/caçulinha)
};

// ===== GERENCIADOR DE DADOS (CRUD LOCAL-FIRST) =====

/**
 * DataManager - Gerencia operações CRUD no data.json local
 * PRIVCIDADE: Todos os dados permanecem apenas no hardware local
 */
const DataManager = {
    // Caminho do arquivo de dados (relativo)
    DATA_PATH: './data.json',
    
    // Cache em memória dos dados carregados
    cache: null,
    
    /**
     * CARREGAR (READ) - Carrega dados do arquivo JSON
     * @returns {Promise<Object>} - Objeto com todos os dados
     */
    async carregar() {
        if (this.cache) return this.cache;
        
        try {
            const response = await fetch(this.DATA_PATH);
            if (!response.ok) throw new Error('Erro ao carregar data.json');
            this.cache = await response.json();
            return this.cache;
        } catch (error) {
            console.error('DataManager.carregar():', error);
            return null;
        }
    },
    
    /**
     * SALVAR (UPDATE) - Salva dados no arquivo (simulação para ambiente browser)
     * NOTA: Em produção real, usar API de arquivo ou download
     * @param {Object} dados - Dados completos para salvar
     * @returns {boolean} - Sucesso da operação
     */
    async salvar(dados) {
        try {
            this.cache = dados;
            
            // Em ambiente real com servidor local, faria POST para salvar
            // Por ora, exporta para download manual (privacidade garantida)
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Cria link de download automático
            const link = document.createElement('a');
            link.href = url;
            link.download = `flordoluar_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('DataManager.salvar():', error);
            return false;
        }
    },
    
    // ===== OPERAÇÕES DE ESTOQUE =====
    
    /**
     * CRIAR - Adiciona novo item ao estoque
     * @param {Object} item - Item a ser adicionado
     * @returns {Promise<Object|null>} - Item criado ou null
     */
    async criarItem(item) {
        const dados = await this.carregar();
        if (!dados) return null;
        
        // Gera ID único
        const novoId = Math.max(...dados.estoque.map(i => i.id), 100) + 1;
        const novoItem = {
            ...item,
            id: novoId,
            data_cadastro: new Date().toISOString()
        };
        
        dados.estoque.push(novoItem);
        await this.salvar(dados);
        return novoItem;
    },
    
    /**
     * LER - Busca item do estoque por ID
     * @param {number} id - ID do item
     * @returns {Promise<Object|null>} - Item encontrado ou null
     */
    async lerItem(id) {
        const dados = await this.carregar();
        if (!dados) return null;
        return dados.estoque.find(item => item.id === id) || null;
    },
    
    /**
     * ATUALIZAR - Atualiza item do estoque
     * @param {number} id - ID do item
     * @param {Object} alteracoes - Campos a serem alterados
     * @returns {Promise<boolean>} - Sucesso da operação
     */
    async atualizarItem(id, alteracoes) {
        const dados = await this.carregar();
        if (!dados) return false;
        
        const index = dados.estoque.findIndex(item => item.id === id);
        if (index === -1) return false;
        
        dados.estoque[index] = { ...dados.estoque[index], ...alteracoes };
        await this.salvar(dados);
        return true;
    },
    
    /**
     * DELETAR - Remove item do estoque
     * @param {number} id - ID do item
     * @returns {Promise<boolean>} - Sucesso da operação
     */
    async deletarItem(id) {
        const dados = await this.carregar();
        if (!dados) return false;
        
        const index = dados.estoque.findIndex(item => item.id === id);
        if (index === -1) return false;
        
        dados.estoque.splice(index, 1);
        await this.salvar(dados);
        return true;
    },
    
    // ===== OPERAÇÕES DE CADERNETA =====
    
    /**
     * CRIAR CLIENTE - Adiciona novo cliente
     * @param {Object} cliente - Dados do cliente
     * @returns {Promise<Object|null>} - Cliente criado
     */
    async criarCliente(cliente) {
        const dados = await this.carregar();
        if (!dados) return null;
        
        const novoId = Math.max(...dados.caderneta.clientes.map(c => c.id), 0) + 1;
        const novoCliente = {
            ...cliente,
            id: novoId,
            data_cadastro: new Date().toISOString(),
            saldo_devedor: 0,
            ativo: true,
            historico: []
        };
        
        dados.caderneta.clientes.push(novoCliente);
        await this.salvar(dados);
        return novoCliente;
    },
    
    /**
     * LER CLIENTE - Busca cliente por ID
     * @param {number} id - ID do cliente
     * @returns {Promise<Object|null>} - Cliente encontrado
     */
    async lerCliente(id) {
        const dados = await this.carregar();
        if (!dados) return null;
        return dados.caderneta.clientes.find(c => c.id === id) || null;
    },
    
    /**
     * ATUALIZAR CLIENTE - Atualiza dados do cliente
     * @param {number} id - ID do cliente
     * @param {Object} alteracoes - Campos a alterar
     * @returns {Promise<boolean>} - Sucesso
     */
    async atualizarCliente(id, alteracoes) {
        const dados = await this.carregar();
        if (!dados) return false;
        
        const index = dados.caderneta.clientes.findIndex(c => c.id === id);
        if (index === -1) return false;
        
        dados.caderneta.clientes[index] = { 
            ...dados.caderneta.clientes[index], 
            ...alteracoes 
        };
        await this.salvar(dados);
        return true;
    },
    
    /**
     * DELETAR CLIENTE - Remove cliente (soft delete)
     * @param {number} id - ID do cliente
     * @returns {Promise<boolean>} - Sucesso
     */
    async deletarCliente(id) {
        const dados = await this.carregar();
        if (!dados) return false;
        
        const index = dados.caderneta.clientes.findIndex(c => c.id === id);
        if (index === -1) return false;
        
        // Soft delete - mantém histórico mas desativa
        dados.caderneta.clientes[index].ativo = false;
        await this.salvar(dados);
        return true;
    },
    
    /**
     * ADICIONAR LANÇAMENTO - Registra transação na caderneta
     * @param {number} clienteId - ID do cliente
     * @param {Object} lancamento - Dados da transação
     * @returns {Promise<boolean>} - Sucesso
     */
    async adicionarLancamento(clienteId, lancamento) {
        const dados = await this.carregar();
        if (!dados) return false;
        
        const cliente = dados.caderneta.clientes.find(c => c.id === clienteId);
        if (!cliente) return false;
        
        // Calcula novo saldo
        let novoSaldo = cliente.saldo_devedor;
        if (lancamento.tipo === 'venda') novoSaldo += lancamento.valor;
        else if (lancamento.tipo === 'pagamento' || lancamento.tipo === 'troca') {
            novoSaldo = Math.max(0, novoSaldo - lancamento.valor);
        }
        
        const novoLancamento = {
            id: `txn_${Date.now()}`,
            data: new Date().toISOString(),
            ...lancamento,
            saldo_apos: novoSaldo
        };
        
        cliente.historico.push(novoLancamento);
        cliente.saldo_devedor = novoSaldo;
        
        await this.salvar(dados);
        return true;
    },
    
    // ===== CONFIGURAÇÕES =====
    
    /**
     * LER CONFIGURAÇÕES - Retorna configurações do sistema
     * @returns {Promise<Object|null>} - Configurações
     */
    async lerConfiguracoes() {
        const dados = await this.carregar();
        return dados ? dados.configuracoes : null;
    },
    
    /**
     * ATUALIZAR CONFIGURAÇÕES - Atualiza configurações
     * @param {Object} alteracoes - Novas configurações
     * @returns {Promise<boolean>} - Sucesso
     */
    async atualizarConfiguracoes(alteracoes) {
        const dados = await this.carregar();
        if (!dados) return false;
        
        dados.configuracoes = { ...dados.configuracoes, ...alteracoes };
        await this.salvar(dados);
        return true;
    },
    
    // ===== UTILITÁRIOS =====
    
    /**
     * LISTAR TUDO - Retorna todos os dados (para debug/backup)
     * @returns {Promise<Object|null>} - Objeto completo
     */
    async listarTudo() {
        return await this.carregar();
    },
    
    /**
     * EXPORTAR BACKUP - Gera arquivo de backup para download
     * PRIVACIDADE: Arquivo nunca sai do dispositivo do usuário
     */
    async exportarBackup() {
        const dados = await this.carregar();
        if (!dados) return;
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `flordoluar_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// ===== UTILITÁRIOS DE TEMPLATE =====

/**
 * Clona um template HTML e retorna o elemento raiz
 * @param {string} templateId - ID do template
 * @returns {DocumentFragment} - Fragmento clonado
 */
function cloneTemplate(templateId) {
    const template = document.getElementById(templateId);
    if (!template) {
        console.error(`Template ${templateId} não encontrado`);
        return null;
    }
    return template.content.cloneNode(true);
}

/**
 * Preenche elementos com data-attributes
 * @param {Element} element - Elemento raiz
 * @param {Object} data - Objeto com dados {attrName: value}
 */
function fillDataAttributes(element, data) {
    Object.entries(data).forEach(([key, value]) => {
        const target = element.querySelector(`[data-${key}]`);
        if (target) {
            if (key === 'text' || key === 'html') {
                target.textContent = value;
            } else {
                target.textContent = value;
            }
        }
    });
}

/**
 * Renderiza estado vazio usando template
 * @param {string} containerId - ID do container
 * @param {string} icon - Ícone emoji
 * @param {string} message - Mensagem
 */
function renderEmptyState(containerId, icon, message) {
    const container = document.getElementById(containerId);
    const fragment = cloneTemplate('tpl-empty-state');
    if (fragment) {
        fillDataAttributes(fragment, { icon, message });
        container.innerHTML = '';
        container.appendChild(fragment);
    }
}

const App = {
    data: {
        itens: [],
        clientes: [],
        alertasEstoque: [],           // Alertas de estoque crítico
        historicoAlertas: [],        // Histórico de todos os alertas emitidos
        historicoVendas: []          // Histórico de todas as vendas realizadas
    },

    init() {
        this.carregarDados();
        this.setupNavigation();
        this.setupFilters();
        this.setupStickyHeader();
        vendas.init();
        this.renderAll();
    },

    /**
     * Configura header sticky com detecção de scroll
     */
    setupStickyHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        // Detecta scroll para aplicar sombra extra
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        }, { passive: true });

        console.log('[Sticky Header] Configurado');
    },

    // Persistência com localStorage
    carregarDados() {
        // DEBUG: Log de início do carregamento
        console.log('[DEBUG] Iniciando carregarDados()...');
        
        const saved = localStorage.getItem('flutogrande-data');
        
        // DEBUG: Verifica se há dados salvos
        console.log('[DEBUG] Dados salvos no localStorage:', saved ? 'SIM' : 'NÃO');
        
        if (saved) {
            const parsed = JSON.parse(saved);
            
            // Garante estrutura correta
            this.data = {
                itens: parsed.itens || [],
                clientes: parsed.clientes || [],
                alertasEstoque: parsed.alertasEstoque || [],
                historicoAlertas: parsed.historicoAlertas || [],
                historicoVendas: parsed.historicoVendas || []
            };
            
            // DEBUG: Log dos dados carregados
            console.log('[DEBUG] Dados carregados do localStorage:');
            console.log('- Itens:', this.data.itens.length);
            console.log('- Bebidas:', this.data.itens.filter(i => i.categoria === 'bebidas').length);
            
            // Mescla novos itens dos dados iniciais que não existem nos dados salvos
            // E atualiza bebidas para garantir estrutura completa
            const dadosIniciais = this.getDadosIniciais();
            const itensSalvosIds = (this.data.itens || []).map(i => i.id);
            
            let novosItensAdicionados = 0;
            let bebidasAtualizadas = 0;
            
            dadosIniciais.forEach(itemInicial => {
                if (!itensSalvosIds.includes(itemInicial.id)) {
                    this.data.itens.push(itemInicial);
                    novosItensAdicionados++;
                } else if (itemInicial.categoria === 'bebidas') {
                    // Atualiza bebidas existentes para garantir campos completos
                    const index = this.data.itens.findIndex(i => i.id === itemInicial.id);
                    if (index !== -1) {
                        const itemExistente = this.data.itens[index];
                        // Adiciona campos que podem estar faltando
                        this.data.itens[index] = {
                            ...itemInicial,
                            quantidade: itemExistente.quantidade, // Mantém quantidade atual
                            id: itemExistente.id
                        };
                        bebidasAtualizadas++;
                    }
                }
            });
            
            // DEBUG: Log de mesclagem
            console.log('[DEBUG] Novos itens adicionados:', novosItensAdicionados);
            console.log('[DEBUG] Bebidas atualizadas:', bebidasAtualizadas);
            
            this.salvarDados();
        } else {
            // Dados iniciais de exemplo
            console.log('[DEBUG] Nenhum dado salvo. Usando getDadosIniciais()...');
            this.data.itens = this.getDadosIniciais();
            
            // DEBUG: Log dos dados iniciais
            console.log('[DEBUG] Dados iniciais carregados:');
            console.log('- Total de itens:', this.data.itens.length);
            console.log('- Bebidas:', this.data.itens.filter(i => i.categoria === 'bebidas').length);
            console.log('- IDs das bebidas:', this.data.itens.filter(i => i.categoria === 'bebidas').map(i => ({id: i.id, nome: i.nome})));
            
            this.salvarDados();
        }
    },
    
    // Função para resetar dados e recarregar (útil para debug)
    resetarDados() {
        console.log('[DEBUG] Resetando dados do localStorage...');
        localStorage.removeItem('flutogrande-data');
        this.carregarDados();
        this.renderAll();
        console.log('[DEBUG] Dados resetados e recarregados!');
    },

    salvarDados() {
        localStorage.setItem('flutogrande-data', JSON.stringify(this.data));
    },

    // ===== MÓDULO: GERENCIAMENTO DE ESTOQUE =====
    
    /**
     * Baixa automática do estoque após venda
     * @param {Array} itensVendidos - Array de {id, quantidade} vendidos
     * @returns {Object} - Resultado da operação {sucesso, alertas, erros}
     */
    baixarEstoqueVenda(itensVendidos) {
        const resultado = {
            sucesso: true,
            alertas: [],
            erros: [],
            itensBaixados: []
        };

        itensVendidos.forEach(itemVendido => {
            const itemEstoque = this.data.itens.find(i => i.id === itemVendido.id);
            
            if (!itemEstoque) {
                resultado.erros.push(`Item ID ${itemVendido.id} não encontrado no estoque`);
                resultado.sucesso = false;
                return;
            }

            // Verifica se há estoque suficiente
            if (itemEstoque.quantidade < itemVendido.quantidade) {
                resultado.erros.push(`Estoque insuficiente para ${itemEstoque.nome} (disp: ${itemEstoque.quantidade}, req: ${itemVendido.quantidade})`);
                resultado.sucesso = false;
                return;
            }

            // Realiza a baixa
            const qtdAnterior = itemEstoque.quantidade;
            itemEstoque.quantidade -= itemVendido.quantidade;
            
            resultado.itensBaixados.push({
                id: itemEstoque.id,
                nome: itemEstoque.nome,
                categoria: itemEstoque.categoria,
                quantidadeAnterior: qtdAnterior,
                quantidadeVendida: itemVendido.quantidade,
                quantidadeAtual: itemEstoque.quantidade
            });

            // Verifica se atingiu nível crítico após a baixa
            const alerta = this.verificarNivelCritico(itemEstoque);
            if (alerta) {
                resultado.alertas.push(alerta);
            }
        });

        if (resultado.sucesso) {
            this.salvarDados();
        }

        return resultado;
    },

    /**
     * Verifica se item atingiu nível crítico de estoque
     * @param {Object} item - Item do estoque
     * @returns {Object|null} - Alerta se nível crítico atingido
     */
    verificarNivelCritico(item) {
        // Só verifica categorias de reposição (exclui insumos de produção)
        if (!CONFIG_ESTOQUE.CATEGORIAS_REPOSICAO.includes(item.categoria)) {
            return null;
        }

        // Verifica se atingiu nível crítico (5 unidades ou menos)
        if (item.quantidade <= CONFIG_ESTOQUE.NIVEL_CRITICO) {
            const alerta = {
                id: this.gerarId(),
                tipo: 'CRITICO',
                itemId: item.id,
                nomeItem: item.nome,
                categoria: item.categoria,
                quantidadeAtual: item.quantidade,
                nivelCritico: CONFIG_ESTOQUE.NIVEL_CRITICO,
                localReposicao: CONFIG_ESTOQUE.LOCAIS_REPOSICAO[0], // Manaus
                dataAlerta: new Date().toISOString(),
                status: 'PENDENTE', // PENDENTE, VISTO, RESOLVIDO
                mensagem: `🚨 ALERTA CRÍTICO: ${item.nome} (${CATEGORIAS_REPOSICAO[item.categoria]}) atingiu ${item.quantidade} unidades. Solicitar reposição em MANAUS!`
            };

            // Adiciona aos alertas ativos se ainda não existir
            const existeAlerta = this.data.alertasEstoque.some(a => 
                a.itemId === item.id && a.status === 'PENDENTE'
            );

            if (!existeAlerta) {
                this.data.alertasEstoque.push(alerta);
                this.data.historicoAlertas.push(alerta);
                this.salvarDados();
                return alerta;
            }
        }

        return null;
    },

    /**
     * Verifica todos os itens e gera alertas de estoque crítico
     * @returns {Array} - Lista de alertas gerados
     */
    verificarTodoEstoque() {
        const alertas = [];
        
        this.data.itens.forEach(item => {
            const alerta = this.verificarNivelCritico(item);
            if (alerta) {
                alertas.push(alerta);
            }
        });

        return alertas;
    },

    /**
     * Marca alerta como resolvido (reposição efetuada)
     * @param {number} alertaId - ID do alerta
     */
    resolverAlerta(alertaId) {
        const alerta = this.data.alertasEstoque.find(a => a.id === alertaId);
        if (alerta) {
            alerta.status = 'RESOLVIDO';
            alerta.dataResolucao = new Date().toISOString();
            
            // Remove da lista de ativos
            this.data.alertasEstoque = this.data.alertasEstoque.filter(a => a.id !== alertaId);
            this.salvarDados();
            this.renderizarPainelAlertas();
        }
    },

    /**
     * Marca alerta como visto
     * @param {number} alertaId - ID do alerta
     */
    marcarAlertaVisto(alertaId) {
        const alerta = this.data.alertasEstoque.find(a => a.id === alertaId);
        if (alerta) {
            alerta.status = 'VISTO';
            alerta.dataVisto = new Date().toISOString();
            this.salvarDados();
            this.renderizarPainelAlertas();
        }
    },

    /**
     * Retorna alertas ativos de estoque
     * @returns {Array} - Alertas pendentes
     */
    getAlertasAtivos() {
        return this.data.alertasEstoque.filter(a => a.status === 'PENDENTE');
    },

    /**
     * Retorna todos os alertas de uma categoria específica
     * @param {string} categoria - Categoria desejada
     * @returns {Array} - Alertas da categoria
     */
    getAlertasPorCategoria(categoria) {
        return this.data.alertasEstoque.filter(a => 
            a.categoria === categoria && a.status === 'PENDENTE'
        );
    },

    /**
     * Exibe notificação de alerta crítico na interface
     * @param {Object} alerta - Objeto de alerta
     */
    exibirNotificacaoAlerta(alerta) {
        this.renderizarPainelAlertas();
    },

    /**
     * Renderiza o painel de alertas de estoque usando templates
     */
    renderizarPainelAlertas() {
        const container = document.getElementById('painel-alertas-container');
        if (!container) return;

        const alertasPendentes = this.getAlertasAtivos();

        if (alertasPendentes.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Clona template do painel
        const panelFragment = cloneTemplate('tpl-painel-alertas');
        if (!panelFragment) return;

        const panel = panelFragment.querySelector('.painel-alertas');
        const listaContainer = panel.querySelector('[data-lista]');

        // Atualiza contador no título
        const titulo = panel.querySelector('.alertas-titulo');
        titulo.textContent = `🚨 Alertas de Estoque Crítico (${alertasPendentes.length} item(s))`;

        // Adiciona evento ao botão fechar
        const btnClose = panel.querySelector('[data-action="close"]');
        btnClose.addEventListener('click', () => container.innerHTML = '');

        // Renderiza cada alerta usando template
        alertasPendentes.forEach(alerta => {
            const alertaFragment = cloneTemplate('tpl-alerta-item');
            if (!alertaFragment) return;

            const alertaEl = alertaFragment.querySelector('[data-item]');
            alertaEl.classList.add(alerta.status.toLowerCase());

            fillDataAttributes(alertaEl, {
                nome: alerta.nomeItem,
                categoria: CATEGORIAS_REPOSICAO[alerta.categoria],
                quantidade: alerta.quantidadeAtual
            });

            // Adiciona eventos aos botões
            const btnVisto = alertaEl.querySelector('[data-action="visto"]');
            const btnResolver = alertaEl.querySelector('[data-action="resolver"]');

            btnVisto.addEventListener('click', () => this.marcarAlertaVisto(alerta.id));
            btnResolver.addEventListener('click', () => this.resolverAlerta(alerta.id));

            listaContainer.appendChild(alertaFragment);
        });

        container.innerHTML = '';
        container.appendChild(panelFragment);
    },

    renderAll() {
        estoque.render();
        vendas.render();
        creditos.render();
        this.renderizarPainelAlertas();
    },

    getDadosIniciais() {
        return [
            // Bebidas - Alto Giro (com níveis de venda)
            { 
                id: 301, nome: 'Refrigerante 2L - Fardo', categoria: 'bebidas', quantidade: 48, 
                custo: 6.00, frete: 12.00, preco: 10.00, minimo: 12, 
                unidade: 'fardo', nivel_venda: 'fardo', tipo_bebida: 'pet_2l',
                frete_proporcional: 12.00, custo_chegada: 18.00, unidades_por_embalagem: 12 
            },
            { 
                id: 302, nome: 'Refrigerante 2L - Unidade', categoria: 'bebidas', quantidade: 24, 
                custo: 6.00, frete: 12.00, preco: 9.10, minimo: 5, 
                unidade: 'medio', nivel_venda: 'medio', tipo_bebida: 'pet_2l',
                frete_proporcional: 1.80, custo_chegada: 7.80, unidades_por_embalagem: 1 
            },
            { 
                id: 303, nome: 'Cerveja Lata 350ml - Fardo', categoria: 'bebidas', quantidade: 36, 
                custo: 3.50, frete: 8.00, preco: 15.00, minimo: 12, 
                unidade: 'fardo', nivel_venda: 'fardo', tipo_bebida: 'lata',
                frete_proporcional: 8.00, custo_chegada: 11.50, unidades_por_embalagem: 12 
            },
            { 
                id: 304, nome: 'Cerveja Lata 350ml - Unidade', categoria: 'bebidas', quantidade: 15, 
                custo: 3.50, frete: 8.00, preco: 5.50, minimo: 5, 
                unidade: 'tamanho', nivel_venda: 'tamanho', tipo_bebida: 'lata',
                frete_proporcional: 0.40, custo_chegada: 3.90, unidades_por_embalagem: 1 
            },
            { 
                id: 305, nome: 'Água Mineral 500ml - Fardo', categoria: 'bebidas', quantidade: 60, 
                custo: 1.20, frete: 5.00, preco: 8.00, minimo: 20, 
                unidade: 'fardo', nivel_venda: 'fardo', tipo_bebida: 'pet_500ml',
                frete_proporcional: 5.00, custo_chegada: 6.20, unidades_por_embalagem: 20 
            },
            { 
                id: 306, nome: 'Água Mineral 500ml - Unidade', categoria: 'bebidas', quantidade: 45, 
                custo: 1.20, frete: 5.00, preco: 1.90, minimo: 10, 
                unidade: 'tamanho', nivel_venda: 'tamanho', tipo_bebida: 'pet_500ml',
                frete_proporcional: 0.25, custo_chegada: 1.45, unidades_por_embalagem: 1 
            },
            { 
                id: 307, nome: 'Guaraná Caçulinha 200ml', categoria: 'bebidas', quantidade: 50, 
                custo: 1.80, frete: 4.00, preco: 3.20, minimo: 15, 
                unidade: 'caçulinha', nivel_venda: 'caçulinha', tipo_bebida: 'caculinha',
                frete_proporcional: 0.12, custo_chegada: 1.92, unidades_por_embalagem: 1 
            },
            
            // Itens de Rancho
            { id: 7, nome: 'Arroz 5kg', categoria: 'rancho', quantidade: 15, custo: 18.00, frete: 3.00, preco: 28.00, minimo: 5 },
            { id: 70, nome: 'Arroz 1kg', categoria: 'rancho', quantidade: 25, custo: 4.50, frete: 0.80, preco: 8.00, minimo: 10 },
            { id: 8, nome: 'Feijão 1kg', categoria: 'rancho', quantidade: 20, custo: 6.00, frete: 1.00, preco: 10.00, minimo: 5 },
            { id: 9, nome: 'Óleo de soja 900ml', categoria: 'rancho', quantidade: 12, custo: 4.50, frete: 0.80, preco: 8.00, minimo: 3 },
            { id: 10, nome: 'Café 500g', categoria: 'rancho', quantidade: 10, custo: 8.00, frete: 1.50, preco: 14.00, minimo: 3 },
            { id: 11, nome: 'Açúcar 1kg', categoria: 'rancho', quantidade: 15, custo: 3.50, frete: 0.60, preco: 6.00, minimo: 5 },
            { id: 12, nome: 'Farinha de mandioca 1kg', categoria: 'rancho', quantidade: 8, custo: 4.00, frete: 0.80, preco: 7.00, minimo: 3 },
            { id: 13, nome: 'Charque 500g', categoria: 'rancho', quantidade: 6, custo: 12.00, frete: 2.00, preco: 20.00, minimo: 2 },
            { id: 14, nome: 'Sardinha em lata', categoria: 'rancho', quantidade: 24, custo: 3.00, frete: 0.50, preco: 5.50, minimo: 6 },
            { id: 15, nome: 'Sabão em pó 1kg', categoria: 'rancho', quantidade: 10, custo: 8.00, frete: 1.50, preco: 14.00, minimo: 3 },
            { id: 16, nome: 'Papel higiênico 4 rolos', categoria: 'rancho', quantidade: 12, custo: 6.00, frete: 1.00, preco: 11.00, minimo: 4 },
            
            // Vestuário de Trabalho (Linha Mata)
            { id: 17, nome: 'Camisa manga longa UV', categoria: 'vestuario', quantidade: 8, custo: 25.00, frete: 4.00, preco: 45.00, minimo: 3 },
            { id: 18, nome: 'Calça brim reforçada', categoria: 'vestuario', quantidade: 6, custo: 35.00, frete: 5.00, preco: 60.00, minimo: 2 },
            { id: 19, nome: 'Bota PVC cano longo', categoria: 'vestuario', quantidade: 4, custo: 45.00, frete: 6.00, preco: 75.00, minimo: 2 },
            { id: 20, nome: 'Chapéu de palha', categoria: 'vestuario', quantidade: 10, custo: 12.00, frete: 2.00, preco: 22.00, minimo: 3 },
            { id: 21, nome: 'Perneiras', categoria: 'vestuario', quantidade: 5, custo: 18.00, frete: 3.00, preco: 32.00, minimo: 2 },
            
            // Manutenção e Consumíveis
            { id: 22, nome: 'Óleo 2 tempos 500ml', categoria: 'manutencao', quantidade: 8, custo: 12.00, frete: 2.00, preco: 22.00, minimo: 3 },
            { id: 23, nome: 'Óleo 4 tempos 1L', categoria: 'manutencao', quantidade: 6, custo: 15.00, frete: 2.50, preco: 28.00, minimo: 2 },
            { id: 24, nome: 'Vela de ignição', categoria: 'manutencao', quantidade: 10, custo: 8.00, frete: 1.50, preco: 15.00, minimo: 3 },
            { id: 25, nome: 'Corrente de motosserra', categoria: 'manutencao', quantidade: 4, custo: 35.00, frete: 5.00, preco: 60.00, minimo: 2 },
            { id: 26, nome: 'Corda de nylon 100m', categoria: 'manutencao', quantidade: 6, custo: 18.00, frete: 3.00, preco: 32.00, minimo: 2 },
            { id: 27, nome: 'Graxa 500g', categoria: 'manutencao', quantidade: 5, custo: 10.00, frete: 1.80, preco: 18.00, minimo: 2 },
            
            // Ferramentas e Pesca
            { id: 28, nome: 'Terçado', categoria: 'ferramentas', quantidade: 4, custo: 28.00, frete: 4.00, preco: 50.00, minimo: 2 },
            { id: 29, nome: 'Lima grossa', categoria: 'ferramentas', quantidade: 6, custo: 12.00, frete: 2.00, preco: 22.00, minimo: 2 },
            { id: 30, nome: 'Pedra de amolar', categoria: 'ferramentas', quantidade: 5, custo: 15.00, frete: 2.50, preco: 28.00, minimo: 2 },
            { id: 31, nome: 'Anzol pacote c/10', categoria: 'ferramentas', quantidade: 15, custo: 5.00, frete: 0.80, preco: 10.00, minimo: 5 },
            { id: 32, nome: 'Malhadeira 10m', categoria: 'ferramentas', quantidade: 4, custo: 35.00, frete: 5.00, preco: 60.00, minimo: 2 },
            
            // EDS e Escola
            { id: 33, nome: 'Caderno 96 folhas', categoria: 'escola', quantidade: 20, custo: 4.50, frete: 0.80, preco: 9.00, minimo: 5 },
            { id: 34, nome: 'Lápis grafite', categoria: 'escola', quantidade: 30, custo: 0.80, frete: 0.15, preco: 2.00, minimo: 10 },
            { id: 35, nome: 'Caneta esferográfica', categoria: 'escola', quantidade: 25, custo: 1.20, frete: 0.20, preco: 2.50, minimo: 8 },
            { id: 36, nome: 'Borracha', categoria: 'escola', quantidade: 20, custo: 0.60, frete: 0.10, preco: 1.50, minimo: 5 },
            { id: 37, nome: 'Apontador', categoria: 'escola', quantidade: 15, custo: 0.80, frete: 0.15, preco: 2.00, minimo: 5 },
            { id: 38, nome: 'Régua 30cm', categoria: 'escola', quantidade: 12, custo: 1.50, frete: 0.30, preco: 3.50, minimo: 4 },
            { id: 39, nome: 'Cola bastão', categoria: 'escola', quantidade: 15, custo: 1.80, frete: 0.30, preco: 4.00, minimo: 5 },
            { id: 40, nome: 'Tesoura escolar', categoria: 'escola', quantidade: 10, custo: 3.50, frete: 0.60, preco: 7.50, minimo: 3 }
        ];
    },

    // Navegação
    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.navegar(page);
            });
        });
    },

    navegar(page) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });
        
        document.querySelectorAll('.page').forEach(p => {
            p.classList.toggle('active', p.id === `page-${page}`);
        });
        
        this.renderAll();
    },

    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                estoque.render(btn.dataset.filter);
            });
        });
    },

    renderAll() {
        estoque.render();
        vendas.render();
        creditos.render();
        relatorios.renderizarListaReposicaoPagina();
    },

    gerarId() {
        return Date.now();
    },

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    },

    formatarData(data) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
    }
};

// Módulo: Estoque
const estoque = {
    filtroAtual: 'todos',

    render(filtro = this.filtroAtual) {
        this.filtroAtual = filtro;
        const grid = document.getElementById('estoque-grid');
        
        // DEBUG: Log de dados carregados
        console.log('[DEBUG] Total de itens em App.data.itens:', App.data.itens.length);
        console.log('[DEBUG] Itens por categoria:', {
            rancho: App.data.itens.filter(i => i.categoria === 'rancho').length,
            bebidas: App.data.itens.filter(i => i.categoria === 'bebidas').length,
            vestuario: App.data.itens.filter(i => i.categoria === 'vestuario').length,
            manutencao: App.data.itens.filter(i => i.categoria === 'manutencao').length,
            ferramentas: App.data.itens.filter(i => i.categoria === 'ferramentas').length,
            escola: App.data.itens.filter(i => i.categoria === 'escola').length
        });
        
        let itens = App.data.itens.filter(i => i.categoria !== 'producao');
        if (filtro !== 'todos') {
            itens = itens.filter(i => i.categoria === filtro);
        }
        
        // DEBUG: Log de itens filtrados
        console.log('[DEBUG] Filtro atual:', filtro);
        console.log('[DEBUG] Itens a renderizar:', itens.length);
        console.log('[DEBUG] Primeiros 3 itens:', itens.slice(0, 3).map(i => ({ nome: i.nome, cat: i.categoria })));
        
        itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        if (itens.length === 0) {
            renderEmptyState('estoque-grid', '📦', 'Nenhum item encontrado nesta categoria');
            return;
        }

        grid.innerHTML = '';
        
        // Atualiza contadores nos cards de categoria
        const contagem = {
            rancho: App.data.itens.filter(i => i.categoria === 'rancho').length,
            bebidas: App.data.itens.filter(i => i.categoria === 'bebidas').length,
            vestuario: App.data.itens.filter(i => i.categoria === 'vestuario').length,
            manutencao: App.data.itens.filter(i => i.categoria === 'manutencao').length,
            ferramentas: App.data.itens.filter(i => i.categoria === 'ferramentas').length,
            escola: App.data.itens.filter(i => i.categoria === 'escola').length
        };
        
        Object.keys(contagem).forEach(cat => {
            const el = document.querySelector(`[data-qtd-${cat}]`);
            if (el) el.textContent = `${contagem[cat]} itens`;
        });
        
        const categorias = {
            rancho: '🍚 Rancho',
            bebidas: '🥤 Bebidas',
            vestuario: '👕 Linha Mata',
            manutencao: '🔧 Manutenção',
            ferramentas: '🎣 Ferragens/Pesca',
            escola: '📚 EDS'
        };

        itens.forEach(item => {
            const custoChegada = item.custo + item.frete;
            let estoqueClass = 'estoque-ok';
            let badgeClass = 'ok';
            let statusText = 'Estoque OK';
            
            if (item.quantidade <= CONFIG_ESTOQUE.NIVEL_CRITICO) {
                estoqueClass = 'estoque-critico';
                badgeClass = 'critico';
                statusText = '🚨 CRÍTICO - Repor em Manaus!';
            } else if (item.quantidade <= item.minimo * CONFIG_ESTOQUE.NIVEL_ALERTA_PERCENTUAL) {
                estoqueClass = 'estoque-baixo';
                badgeClass = 'baixo';
                statusText = 'Estoque Baixo';
            } else if (item.quantidade <= item.minimo) {
                estoqueClass = 'estoque-medio';
                badgeClass = 'medio';
                statusText = 'Estoque Médio';
            }

            const cardFragment = cloneTemplate('tpl-estoque-card');
            if (!cardFragment) return;

            const card = cardFragment.querySelector('[data-card]');
            card.classList.add(estoqueClass);
            
            // Adiciona data-attributes para bebidas
            if (item.categoria === 'bebidas') {
                card.dataset.categoria = 'bebidas';
                if (item.nivel_venda) card.dataset.nivel = item.nivel_venda;
            }
            
            if (item.quantidade <= CONFIG_ESTOQUE.NIVEL_CRITICO) {
                card.classList.add('has-critico-badge');
                const badge = document.createElement('span');
                badge.className = 'estoque-critico-badge';
                badge.textContent = '!';
                card.appendChild(badge);
            }

            // Adiciona tag de bebida se aplicável
            let nomeExibicao = item.nome;
            if (item.categoria === 'bebidas' && item.tipo_bebida) {
                const tipoLabel = CONFIG_ESTOQUE.BEBIDAS_TIPOS[item.tipo_bebida] || item.tipo_bebida;
                const tagClass = this.getBebidaTagClass(item.tipo_bebida);
                nomeExibicao = `${item.nome} <span class="bebida-tag ${tagClass}">${tipoLabel}</span>`;
            }

            fillDataAttributes(card, {
                categoria: categorias[item.categoria] || item.categoria,
                nome: item.nome,
                quantidade: `${item.quantidade} un`,
                custo: App.formatarMoeda(custoChegada),
                preco: App.formatarMoeda(item.preco)
            });
            
            // Se for bebida, atualiza o nome com a tag HTML
            if (item.categoria === 'bebidas' && item.tipo_bebida) {
                const nomeEl = card.querySelector('[data-nome]');
                if (nomeEl) nomeEl.innerHTML = nomeExibicao;
            }

            const badge = card.querySelector('[data-estoque-badge]');
            if (badge) {
                badge.classList.add(badgeClass);
                badge.querySelector('[data-estoque-text]').textContent = statusText;
            }

            const btnEdit = card.querySelector('[data-action="edit"]');
            const btnDelete = card.querySelector('[data-action="delete"]');
            
            btnEdit.addEventListener('click', () => this.editar(item.id));
            btnDelete.addEventListener('click', () => this.excluir(item.id));

            grid.appendChild(cardFragment);
        });
    },

    abrirModal(id = null) {
        const modal = document.getElementById('modal-item');
        const form = document.getElementById('form-item');
        const title = document.getElementById('modal-item-title');
        
        form.reset();
        document.getElementById('item-id').value = '';
        
        if (id) {
            const item = App.data.itens.find(i => i.id === id);
            if (item) {
                title.textContent = 'Editar Item';
                document.getElementById('item-id').value = item.id;
                document.getElementById('item-nome').value = item.nome;
                document.getElementById('item-categoria').value = item.categoria;
                document.getElementById('item-quantidade').value = item.quantidade;
                document.getElementById('item-custo').value = item.custo;
                document.getElementById('item-frete').value = item.frete;
                document.getElementById('item-preco').value = item.preco;
                document.getElementById('item-minimo').value = item.minimo;
                
                // Restaura campos específicos de bebidas
                if (item.categoria === 'bebidas') {
                    this.onCategoriaChange('bebidas');
                    const nivel = item.nivel_venda || item.unidade || 'individual';
                    document.getElementById('item-unidade-nivel').value = nivel;
                    this.onNivelChange(nivel);
                }
            }
        } else {
            title.textContent = 'Novo Item';
            // Reseta campos de bebidas
            this.onCategoriaChange(document.getElementById('item-categoria').value);
        }
        
        modal.classList.add('active');
    },

    fecharModal() {
        document.getElementById('modal-item').classList.remove('active');
    },

    editar(id) {
        this.abrirModal(id);
    },

    // ===== FUNÇÕES PARA GERENCIAMENTO DE BEBIDAS =====
    
    /**
     * Handler quando muda a categoria no formulário
     * Mostra campos de nível de venda apenas para bebidas
     */
    onCategoriaChange(categoria) {
        const grupoUnidade = document.getElementById('grupo-unidade');
        const grupoFreteProp = document.getElementById('grupo-frete-proporcional');
        const grupoTipoBebida = document.getElementById('grupo-tipo-bebida');
        const grupoMultiplicador = document.getElementById('grupo-multiplicador');
        
        if (categoria === 'bebidas') {
            grupoUnidade.style.display = 'block';
            grupoTipoBebida.style.display = 'block';
            grupoMultiplicador.style.display = 'block';
        } else {
            grupoUnidade.style.display = 'none';
            grupoFreteProp.style.display = 'none';
            grupoTipoBebida.style.display = 'none';
            grupoMultiplicador.style.display = 'none';
            document.getElementById('item-unidade-nivel').value = '';
            document.getElementById('item-frete-proporcional').value = '';
            document.getElementById('item-tipo-bebida').value = '';
            document.getElementById('item-unidades-por-embalagem').value = '1';
        }
    },
    
    /**
     * Handler quando muda o nível de venda (fardo/individual/tamanho)
     * Calcula frete proporcional automaticamente e ajusta multiplicador
     */
    onNivelChange(nivel) {
        const grupoFreteProp = document.getElementById('grupo-frete-proporcional');
        const inputFreteProp = document.getElementById('item-frete-proporcional');
        const inputFreteBase = document.getElementById('item-frete');
        const inputMultiplicador = document.getElementById('item-unidades-por-embalagem');
        
        if (!nivel) {
            grupoFreteProp.style.display = 'none';
            inputFreteProp.value = '';
            inputMultiplicador.value = '1';
            return;
        }
        
        const freteBase = parseFloat(inputFreteBase.value) || 0;
        const config = CONFIG_ESTOQUE.BEBIDAS_NIVEIS[nivel];
        const fator = config?.proporcao_frete || 1.0;
        const multiplicador = config?.multiplicador || 1;
        
        // Para fardo/galão, multiplica o frete; para outros, proporcional
        let freteCalculado;
        if (nivel === 'fardo' || nivel === 'grande') {
            freteCalculado = freteBase * fator; // Frete total do fardo/grande
        } else {
            freteCalculado = freteBase * fator; // Frete proporcional
        }
        
        grupoFreteProp.style.display = 'block';
        inputFreteProp.value = freteCalculado.toFixed(2);
        inputMultiplicador.value = multiplicador;
    },
    
    /**
     * Calcula frete proporcional para bebidas baseado no nível
     * Multiplica frete quando é fardo ou galão grande
     * @param {number} freteBase - Frete base do fardo
     * @param {string} nivel - fardo | grande | medio | tamanho | caçulinha
     * @param {number} unidadesPorEmbalagem - Quantidade de unidades (para fardo)
     * @returns {number} - Frete proporcional calculado
     */
    calcularFreteBebidas(freteBase, nivel, unidadesPorEmbalagem = 1) {
        if (!nivel) return freteBase;
        
        const config = CONFIG_ESTOQUE.BEBIDAS_NIVEIS[nivel];
        const fator = config?.proporcao_frete || 1.0;
        const multiplicador = config?.multiplicador || 1;
        
        // Para fardo: frete total dividido por unidades
        // Para galão grande: frete integral
        // Para outros: frete proporcional
        if (nivel === 'fardo') {
            return (freteBase * fator) / (unidadesPorEmbalagem || multiplicador);
        } else if (nivel === 'grande') {
            return freteBase * fator; // Galão paga frete completo
        } else {
            return freteBase * fator; // Proporcional para médio/pequeno
        }
    },

    salvar(e) {
        e.preventDefault();
        
        const id = document.getElementById('item-id').value;
        const categoria = document.getElementById('item-categoria').value;
        const freteBase = parseFloat(document.getElementById('item-frete').value) || 0;
        const nivel = document.getElementById('item-unidade-nivel').value;
        
        // Campos específicos para bebidas
        const tipoBebida = categoria === 'bebidas' 
            ? document.getElementById('item-tipo-bebida').value 
            : null;
        const unidadesPorEmbalagem = categoria === 'bebidas'
            ? parseInt(document.getElementById('item-unidades-por-embalagem').value) || 1
            : 1;
        
        // Calcula frete proporcional para bebidas
        const freteProporcional = categoria === 'bebidas' && nivel
            ? this.calcularFreteBebidas(freteBase, nivel, unidadesPorEmbalagem)
            : freteBase;
        
        const item = {
            id: id ? parseInt(id) : App.gerarId(),
            nome: document.getElementById('item-nome').value,
            categoria: categoria,
            quantidade: parseInt(document.getElementById('item-quantidade').value),
            custo: parseFloat(document.getElementById('item-custo').value),
            frete: freteBase,
            preco: parseFloat(document.getElementById('item-preco').value),
            minimo: parseInt(document.getElementById('item-minimo').value),
            // Campos específicos para bebidas
            unidade: categoria === 'bebidas' ? (nivel || 'individual') : 'un',
            nivel_venda: categoria === 'bebidas' ? nivel : null,
            tipo_bebida: tipoBebida,
            frete_proporcional: categoria === 'bebidas' ? freteProporcional : null,
            custo_chegada: parseFloat(document.getElementById('item-custo').value) + freteProporcional,
            unidades_por_embalagem: categoria === 'bebidas' ? unidadesPorEmbalagem : null
        };

        if (id) {
            const index = App.data.itens.findIndex(i => i.id === parseInt(id));
            if (index !== -1) App.data.itens[index] = item;
        } else {
            App.data.itens.push(item);
        }

        App.salvarDados();
        this.fecharModal();
        this.render();
    },

    excluir(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            App.data.itens = App.data.itens.filter(i => i.id !== id);
            App.salvarDados();
            this.render();
        }
    },

    /**
     * Filtra estoque ao clicar nos cards de categoria
     * @param {string} categoria - Categoria a filtrar
     */
    filtrarPorCard(categoria) {
        // Atualiza estado ativo nos cards
        document.querySelectorAll('.cat-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.cat === categoria) {
                card.classList.add('active');
            }
        });
        
        // Atualiza botões de filtro
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === categoria) {
                btn.classList.add('active');
            }
        });
        
        // Renderiza com filtro
        this.render(categoria);
    },

    /**
     * Retorna classe CSS para etiqueta de bebida
     * @param {string} tipo - Tipo da bebida
     * @returns {string} - Classe CSS
     */
    getBebidaTagClass(tipo) {
        if (!tipo) return '';
        if (tipo.startsWith('lata')) return 'bebida-tag-lata';
        if (tipo.startsWith('pet')) return 'bebida-tag-pet';
        if (tipo.startsWith('galao')) return 'bebida-tag-galao';
        if (tipo === 'caculinha') return 'bebida-tag-caculinha';
        if (tipo === 'long_neck') return 'bebida-tag-longneck';
        if (tipo === 'garrafa_600') return 'bebida-tag-garrafa';
        return '';
    }
};

// Módulo: Créditos/Caderneta
const creditos = {
    clienteAtual: null,

    render() {
        console.log('[creditos.render] Iniciando renderização...');
        // Renderiza clientes tradicionais + clientes da caderneta (vendas)
        this.renderClientesTradicionais();
        this.renderClientesCaderneta();
        console.log('[creditos.render] Renderização completa!');
    },

    /**
     * Renderiza clientes tradicionais do App.data.clientes
     */
    renderClientesTradicionais() {
        // Calcula totais de clientes tradicionais
        let totalReceber = 0;
        App.data.clientes.forEach(cliente => {
            const saldo = this.calcularSaldo(cliente);
            if (saldo > 0) totalReceber += saldo;
        });

        // Adiciona totais da caderneta (vendas)
        const listaCaderneta = this.getClientesCaderneta();
        Object.values(listaCaderneta).forEach(cliente => {
            if (cliente.total_devido > 0) totalReceber += cliente.total_devido;
        });

        document.getElementById('total-receber').textContent = App.formatarMoeda(totalReceber);
        document.getElementById('total-clientes').textContent = App.data.clientes.length + Object.keys(listaCaderneta).length;

        // Renderiza clientes
        const list = document.getElementById('clientes-list');
        if (App.data.clientes.length === 0 && Object.keys(this.getClientesCaderneta()).length === 0) {
            renderEmptyState('clientes-list', '📒', 'Nenhum cliente cadastrado');
            return;
        }

        list.innerHTML = '';

        // Ordena clientes alfabeticamente
        App.data.clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        App.data.clientes.forEach(cliente => {
            const saldo = this.calcularSaldo(cliente);
            const saldoClass = saldo > 0 ? 'devedor' : saldo < 0 ? 'credor' : 'quitado';
            const saldoText = saldo > 0 ? 'Deve' : saldo < 0 ? 'Crédito' : 'Quitado';

            const cardFragment = cloneTemplate('tpl-cliente-card');
            if (!cardFragment) return;

            const card = cardFragment.querySelector('[data-card]');
            const badge = card.querySelector('[data-saldo-badge]');
            badge.classList.add(saldoClass);

            fillDataAttributes(card, {
                nome: cliente.nome,
                contato: cliente.contato || 'Sem contato',
                'saldo-text': saldoText,
                'saldo-valor': App.formatarMoeda(Math.abs(saldo))
            });

            // Event listeners
            card.querySelector('[data-action="lancar"]').addEventListener('click', () => this.abrirLancamento(cliente.id));
            card.querySelector('[data-action="historico"]').addEventListener('click', () => this.toggleLancamentos(cliente.id));
            card.querySelector('[data-action="delete"]').addEventListener('click', () => this.excluirCliente(cliente.id));

            // Lançamentos container
            const lancamentosContainer = card.querySelector('[data-lancamentos]');
            lancamentosContainer.id = `lancamentos-${cliente.id}`;
            lancamentosContainer.innerHTML = this.renderLancamentos(cliente);

            list.appendChild(cardFragment);
        });
    },

    /**
     * Retorna clientes da caderneta (vendas) do localStorage
     */
    getClientesCaderneta() {
        return JSON.parse(localStorage.getItem('lista_caderneta') || '{}');
    },

    /**
     * Renderiza clientes da caderneta (vendas) abaixo dos tradicionais
     */
    renderClientesCaderneta() {
        console.log('[renderClientesCaderneta] Buscando clientes da caderneta...');
        const listaCaderneta = this.getClientesCaderneta();
        console.log('[renderClientesCaderneta] Clientes encontrados:', Object.keys(listaCaderneta).length);
        const list = document.getElementById('clientes-list');
        
        if (!list) return;
        
        // Se a lista está vazia e temos clientes na caderneta, limpa o empty state
        if (App.data.clientes.length === 0 && Object.keys(listaCaderneta).length > 0) {
            list.innerHTML = '';
        }

        // Renderiza cada cliente da caderneta
        Object.keys(listaCaderneta).sort().forEach(nome => {
            const cliente = listaCaderneta[nome];
            const saldo = cliente.total_devido || 0;
            
            if (saldo <= 0) return; // Pula clientes quitados

            const cardFragment = cloneTemplate('tpl-cliente-card');
            if (!cardFragment) return;

            const card = cardFragment.querySelector('[data-card]');
            const badge = card.querySelector('[data-saldo-badge]');
            badge.classList.add('devedor');

            // Mostra resumo dos itens comprados
            let ultimaCompra = '';
            if (cliente.historico && cliente.historico.length > 0) {
                const ultima = cliente.historico[cliente.historico.length - 1];
                const itens = ultima.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ');
                ultimaCompra = itens.length > 50 ? itens.substring(0, 50) + '...' : itens;
            }

            fillDataAttributes(card, {
                nome: cliente.cliente,
                contato: cliente.contato || 'Sem contato',
                'saldo-text': 'Deve (Caderneta)',
                'saldo-valor': App.formatarMoeda(saldo)
            });

            // Adiciona indicador visual de caderneta
            card.style.borderLeft = '4px solid #f59e0b';
            
            // Mostra última compra no card
            const infoEl = document.createElement('div');
            infoEl.style.cssText = 'font-size:0.8rem;color:#64748b;margin-top:0.5rem;';
            infoEl.textContent = `Última: ${ultimaCompra || 'N/A'}`;
            card.querySelector('[data-contato]').parentNode.appendChild(infoEl);

            // Adapta botões para caderneta - usa container existente do template
            const actionsContainer = card.querySelector('.cliente-actions');
            if (actionsContainer) {
                const btnLancar = actionsContainer.querySelector('[data-action="lancar"]');
                const btnDelete = actionsContainer.querySelector('[data-action="delete"]');
                const btnHistorico = actionsContainer.querySelector('[data-action="historico"]');
                
                // Transforma botão "Lançar" em "Pagar"
                if (btnLancar) {
                    btnLancar.className = 'btn btn-success';
                    btnLancar.innerHTML = '💰 Pagar';
                    btnLancar.onclick = () => this.abrirPagamentoCaderneta(cliente);
                }
                
                // Remove botão delete
                if (btnDelete) btnDelete.remove();
                
                // Atualiza botão histórico
                if (btnHistorico) {
                    btnHistorico.className = 'btn btn-secondary';
                    btnHistorico.innerHTML = '📋 Histórico';
                    btnHistorico.onclick = () => this.mostrarHistoricoCaderneta(cliente);
                }
            }

            list.appendChild(cardFragment);
        });

        console.log('[renderClientesCaderneta] Renderizados:', Object.keys(listaCaderneta).length, 'clientes da caderneta');
    },

    /**
     * Mostra histórico detalhado de compras e pagamentos na caderneta
     */
    mostrarHistoricoCaderneta(cliente) {
        let html = `<h3>📒 Histórico de ${cliente.cliente}</h3>`;
        html += `<p style="font-size:1.1rem;margin:0.5rem 0;"><strong>Total Devendo:</strong> <span style="color:${cliente.total_devido > 0 ? '#dc2626' : '#16a34a'};font-size:1.3rem;">${App.formatarMoeda(cliente.total_devido)}</span></p>`;
        if (cliente.contato) {
            html += `<p style="color:#64748b;margin:0.25rem 0;">📞 ${cliente.contato}</p>`;
        }
        html += '<hr style="margin:1rem 0;">';
        
        if (cliente.historico && cliente.historico.length > 0) {
            html += '<table style="width:100%;border-collapse:collapse;font-size:0.95rem;">';
            html += '<tr style="background:#f1f5f9;">';
            html += '<th style="padding:10px 8px;text-align:left;">Data</th>';
            html += '<th style="padding:10px 8px;text-align:left;">Descrição</th>';
            html += '<th style="padding:10px 8px;text-align:right;">Valor</th>';
            html += '<th style="padding:10px 8px;text-align:right;">Saldo</th>';
            html += '</tr>';
            
            [...cliente.historico].reverse().forEach(h => {
                const data = new Date(h.data).toLocaleDateString('pt-BR');
                const isPagamento = h.tipo === 'pagamento';
                const cor = isPagamento ? '#16a34a' : '#dc2626';
                const sinal = isPagamento ? '-' : '+';
                const icone = isPagamento ? '💰' : '🛒';
                
                let descricao;
                if (isPagamento) {
                    descricao = `${icone} ${h.descricao || 'Pagamento'}`;
                } else {
                    const itens = h.itens ? h.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ') : 'Compra';
                    descricao = `${icone} ${itens}`;
                }
                
                const valor = isPagamento ? h.valor : (h.total || 0);
                const saldo = h.novoSaldo !== undefined ? h.novoSaldo : cliente.total_devido;
                
                html += `<tr style="border-bottom:1px solid #e2e8f0;${isPagamento ? 'background:#f0fdf4;' : ''}">`;
                html += `<td style="padding:10px 8px;white-space:nowrap;">${data}</td>`;
                html += `<td style="padding:10px 8px;font-size:0.85rem;max-width:200px;word-wrap:break-word;">${descricao}</td>`;
                html += `<td style="padding:10px 8px;text-align:right;font-weight:bold;color:${cor};">${sinal} ${App.formatarMoeda(valor)}</td>`;
                html += `<td style="padding:10px 8px;text-align:right;color:${saldo > 0 ? '#dc2626' : '#16a34a'};font-weight:bold;">${App.formatarMoeda(saldo)}</td>`;
                html += `</tr>`;
            });
            html += '</table>';
        } else {
            html += '<p style="text-align:center;color:#64748b;padding:2rem;">Sem histórico de movimentações.</p>';
        }

        // Cria modal temporário
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background:white;padding:2rem;border-radius:0.5rem;max-width:600px;max-height:80vh;overflow:auto;">
                ${html}
                <div style="margin-top:1rem;text-align:right;">
                    <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    /**
     * Abre modal para registrar pagamento na caderneta
     */
    abrirPagamentoCaderneta(cliente) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'modal-pagamento-caderneta';
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;';
        
        modal.innerHTML = `
            <div style="background:white;padding:2rem;border-radius:0.5rem;max-width:400px;width:90%;">
                <h3>💰 Registrar Pagamento</h3>
                <p style="margin:1rem 0;"><strong>Cliente:</strong> ${cliente.cliente}</p>
                <p style="margin:1rem 0;color:#dc2626;font-size:1.2rem;">
                    <strong>Saldo Devedor:</strong> ${App.formatarMoeda(cliente.total_devido)}
                </p>
                
                <div class="form-group" style="margin:1.5rem 0;">
                    <label for="valor-pagamento">Valor do Pagamento *</label>
                    <input type="number" id="valor-pagamento" class="form-control" 
                        placeholder="0,00" step="0.01" min="0.01" max="${cliente.total_devido}"
                        style="font-size:1.2rem;padding:0.75rem;">
                    <small style="color:#64748b;">Digite o valor que o cliente está pagando</small>
                </div>
                
                <div id="novo-saldo-preview" style="background:#f8fafc;padding:1rem;border-radius:0.5rem;margin:1rem 0;display:none;">
                    <p style="margin:0;">Saldo após pagamento:</p>
                    <p id="novo-saldo-valor" style="margin:0;font-size:1.3rem;font-weight:bold;color:#16a34a;">R$ 0,00</p>
                </div>
                
                <div style="display:flex;gap:0.5rem;margin-top:1.5rem;">
                    <button type="button" onclick="document.getElementById('modal-pagamento-caderneta').remove()" 
                        class="btn btn-secondary" style="flex:1;">Cancelar</button>
                    <button type="button" onclick="creditos.registrarPagamentoCaderneta('${cliente.cliente}')" 
                        class="btn btn-success" style="flex:1;">Confirmar Pagamento</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Foca no input
        setTimeout(() => document.getElementById('valor-pagamento').focus(), 100);
        
        // Preview do novo saldo ao digitar
        document.getElementById('valor-pagamento').addEventListener('input', (e) => {
            const valor = parseFloat(e.target.value) || 0;
            const novoSaldo = Math.max(0, cliente.total_devido - valor);
            const preview = document.getElementById('novo-saldo-preview');
            const previewValor = document.getElementById('novo-saldo-valor');
            
            if (valor > 0) {
                preview.style.display = 'block';
                previewValor.textContent = App.formatarMoeda(novoSaldo);
                previewValor.style.color = novoSaldo === 0 ? '#16a34a' : '#dc2626';
            } else {
                preview.style.display = 'none';
            }
        });
        
        // Fecha ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },

    /**
     * Processa o pagamento e atualiza o saldo na caderneta
     */
    registrarPagamentoCaderneta(nomeCliente) {
        const inputValor = document.getElementById('valor-pagamento');
        const valorPagamento = parseFloat(inputValor.value);
        
        // Validações
        if (!valorPagamento || valorPagamento <= 0) {
            alert('Por favor, digite um valor válido maior que zero!');
            inputValor.focus();
            return;
        }
        
        // Recupera dados do cliente
        let listaCaderneta = JSON.parse(localStorage.getItem('lista_caderneta') || '{}');
        const cliente = listaCaderneta[nomeCliente];
        
        if (!cliente) {
            alert('Erro: Cliente não encontrado na caderneta!');
            return;
        }
        
        // Calcula novo saldo (não permite negativo)
        const saldoAnterior = parseFloat(cliente.total_devido) || 0;
        const novoSaldo = Math.max(0, saldoAnterior - valorPagamento);
        const valorEfetivo = Math.min(valorPagamento, saldoAnterior); // Não paga além da dívida
        
        console.log('[Pagamento Caderneta]', {
            cliente: nomeCliente,
            saldoAnterior,
            valorPagamento,
            valorEfetivo,
            novoSaldo
        });
        
        // Atualiza saldo
        cliente.total_devido = novoSaldo;
        cliente.ultima_atualizacao = new Date().toISOString();
        
        // Adiciona ao histórico
        if (!cliente.historico) cliente.historico = [];
        cliente.historico.push({
            data: new Date().toISOString(),
            tipo: 'pagamento',
            descricao: 'Pagamento Realizado',
            valor: valorEfetivo,
            saldoAnterior: saldoAnterior,
            novoSaldo: novoSaldo
        });
        
        // Salva no localStorage
        localStorage.setItem('lista_caderneta', JSON.stringify(listaCaderneta));
        
        // Fecha modal
        document.getElementById('modal-pagamento-caderneta').remove();
        
        // Mensagem de confirmação
        if (novoSaldo === 0) {
            alert(`✅ Pagamento registrado!\n\nCliente: ${nomeCliente}\nValor pago: ${App.formatarMoeda(valorEfetivo)}\n\n🎉 CONTA QUITADA!`);
        } else {
            alert(`✅ Pagamento registrado!\n\nCliente: ${nomeCliente}\nValor pago: ${App.formatarMoeda(valorEfetivo)}\nSaldo restante: ${App.formatarMoeda(novoSaldo)}`);
        }
        
        // Atualiza a tela
        this.render();
    },

    renderLancamentos(cliente) {
        if (!cliente.lancamentos || cliente.lancamentos.length === 0) {
            return '<p class="lancamentos-empty">Nenhum lançamento</p>';
        }

        return cliente.lancamentos
            .slice().reverse()
            .map(l => {
                const tipoClass = l.tipo;
                const tipoText = { venda: 'Venda', pagamento: 'Pagamento', troca: 'Troca' }[l.tipo];
                const valorClass = l.tipo === 'venda' ? '' : 'text-success';
                
                return `
                    <div class="lancamento-item">
                        <div>
                            <span class="lancamento-tipo ${tipoClass}">${tipoText}</span>
                            <span class="lancamento-desc">${l.descricao || '-'}</span>
                        </div>
                        <span class="lancamento-valor ${valorClass}">${App.formatarMoeda(l.valor)}</span>
                    </div>
                `;
            }).join('');
    },

    calcularSaldo(cliente) {
        if (!cliente.lancamentos) return 0;
        return cliente.lancamentos.reduce((total, l) => {
            if (l.tipo === 'venda') return total + l.valor;
            if (l.tipo === 'pagamento') return total - l.valor;
            if (l.tipo === 'troca') return total - l.valor;
            return total;
        }, 0);
    },

    abrirModalCliente() {
        document.getElementById('form-cliente').reset();
        document.getElementById('cliente-id').value = '';
        document.getElementById('modal-cliente').classList.add('active');
    },

    fecharModalCliente() {
        document.getElementById('modal-cliente').classList.remove('active');
    },

    salvarCliente(e) {
        e.preventDefault();
        
        const id = document.getElementById('cliente-id').value;
        const cliente = {
            id: id ? parseInt(id) : App.gerarId(),
            nome: document.getElementById('cliente-nome').value,
            contato: document.getElementById('cliente-contato').value,
            lancamentos: []
        };

        if (!id) {
            App.data.clientes.push(cliente);
        }

        App.salvarDados();
        this.fecharModalCliente();
        this.render();
    },

    excluirCliente(id) {
        if (confirm('Excluir este cliente e todo seu histórico?')) {
            App.data.clientes = App.data.clientes.filter(c => c.id !== id);
            App.salvarDados();
            this.render();
        }
    },

    abrirLancamento(clienteId) {
        const cliente = App.data.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        this.clienteAtual = cliente;
        document.getElementById('lancamento-cliente-id').value = clienteId;
        document.getElementById('lancamento-cliente-nome').value = cliente.nome;
        document.getElementById('form-lancamento').reset();

        document.getElementById('modal-lancamento').classList.add('active');
    },

    fecharModalLancamento() {
        document.getElementById('modal-lancamento').classList.remove('active');
    },

    salvarLancamento(e) {
        e.preventDefault();
        
        const clienteId = parseInt(document.getElementById('lancamento-cliente-id').value);
        const cliente = App.data.clientes.find(c => c.id === clienteId);
        if (!cliente) return;

        if (!cliente.lancamentos) cliente.lancamentos = [];

        const lancamento = {
            data: new Date().toISOString(),
            tipo: document.getElementById('lancamento-tipo').value,
            valor: parseFloat(document.getElementById('lancamento-valor').value),
            descricao: document.getElementById('lancamento-descricao').value
        };

        cliente.lancamentos.push(lancamento);

        App.salvarDados();
        this.fecharModalLancamento();
        this.render();
    },

    toggleLancamentos(clienteId) {
        const el = document.getElementById(`lancamentos-${clienteId}`);
        if (el) {
            el.classList.toggle('lancamentos-visible');
        }
    }
};

// Módulo: Vendas
const vendas = {
    carrinho: [],
    filtroAtual: 'todos',

    init() {
        this.setupFiltrosVenda();
        this.setupBotoesVenda();
    },

    setupBotoesVenda() {
        console.log('[setupBotoesVenda] Configurando event listeners...');
        
        const btnFinalizar = document.getElementById('btn-finalizar-venda');
        const btnCaderneta = document.getElementById('btn-caderneta');
        const btnLimpar = document.getElementById('btn-limpar-carrinho');
        
        console.log('[setupBotoesVenda] btnFinalizar:', btnFinalizar);
        console.log('[setupBotoesVenda] btnCaderneta:', btnCaderneta);
        console.log('[setupBotoesVenda] btnLimpar:', btnLimpar);
        
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[btnFinalizar] Click detectado!');
                this.finalizarVenda(false);
            });
        } else {
            console.error('[setupBotoesVenda] ERRO: btn-finalizar-venda não encontrado!');
        }
        
        if (btnCaderneta) {
            btnCaderneta.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[btnCaderneta] Click detectado!');
                this.finalizarVenda(true);
            });
        } else {
            console.error('[setupBotoesVenda] ERRO: btn-caderneta não encontrado!');
        }
        
        if (btnLimpar) {
            btnLimpar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[btnLimpar] Click detectado!');
                this.limparCarrinho();
            });
        } else {
            console.error('[setupBotoesVenda] ERRO: btn-limpar-carrinho não encontrado!');
        }
    },

    setupFiltrosVenda() {
        document.querySelectorAll('[data-filter-venda]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-filter-venda]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderProdutos(btn.dataset.filterVenda);
            });
        });
    },

    render() {
        this.renderProdutos();
        this.renderCarrinho();
        this.atualizarSelectClientes();
    },

    renderProdutos(filtro = this.filtroAtual) {
        this.filtroAtual = filtro;
        const grid = document.getElementById('produtos-venda-grid');
        
        // DEBUG: Log de dados no módulo vendas
        console.log('[DEBUG VENDAS] Total itens disponíveis:', App.data.itens.length);
        console.log('[DEBUG VENDAS] Bebidas disponíveis:', App.data.itens.filter(i => i.categoria === 'bebidas' && i.quantidade > 0).length);
        
        let itens = App.data.itens.filter(i => 
            i.categoria !== 'producao' && i.quantidade > 0
        );
        
        if (filtro !== 'todos') {
            itens = itens.filter(i => i.categoria === filtro);
        }
        
        // DEBUG: Log após filtro
        console.log('[DEBUG VENDAS] Filtro:', filtro);
        console.log('[DEBUG VENDAS] Itens a exibir:', itens.length);
        
        itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        if (itens.length === 0) {
            renderEmptyState('produtos-venda-grid', '🛒', 'Nenhum produto disponível');
            return;
        }

        const categorias = {
            rancho: '🍚 Rancho',
            bebidas: '🥤 Bebidas',
            vestuario: '👕 Linha Mata',
            manutencao: '🔧 Manutenção',
            ferramentas: '🎣 Ferragens/Pesca',
            escola: '📚 EDS'
        };

        grid.innerHTML = '';
        itens.forEach(item => {
            const noCarrinho = this.carrinho.find(c => c.id === item.id);
            const qtdNoCarrinho = noCarrinho ? noCarrinho.quantidade : 0;
            const disponivel = item.quantidade - qtdNoCarrinho;
            
            const cardFragment = cloneTemplate('tpl-produto-venda');
            if (!cardFragment) return;

            const card = cardFragment.querySelector('[data-card]');
            
            fillDataAttributes(card, {
                categoria: categorias[item.categoria] || item.categoria,
                nome: item.nome,
                preco: App.formatarMoeda(item.preco),
                disponivel: disponivel
            });

            const btnAdd = card.querySelector('[data-action="add"]');
            if (disponivel <= 0) {
                btnAdd.disabled = true;
                btnAdd.textContent = 'Indisponível';
            } else {
                btnAdd.addEventListener('click', () => this.adicionarAoCarrinho(item.id));
            }

            grid.appendChild(cardFragment);
        });
    },

    renderCarrinho() {
        const container = document.getElementById('carrinho-itens');
        
        if (this.carrinho.length === 0) {
            renderEmptyState('carrinho-itens', '🛒', 'Carrinho vazio');
        } else {
            container.innerHTML = '';
            this.carrinho.forEach(item => {
                const itemFragment = cloneTemplate('tpl-carrinho-item');
                if (!itemFragment) return;

                const itemEl = itemFragment.querySelector('[data-item]');
                
                fillDataAttributes(itemEl, {
                    nome: item.nome,
                    'preco-unit': App.formatarMoeda(item.preco) + ' un',
                    quantidade: item.quantidade,
                    subtotal: App.formatarMoeda(item.preco * item.quantidade)
                });

                itemEl.querySelector('[data-action="minus"]').addEventListener('click', () => this.alterarQuantidade(item.id, -1));
                itemEl.querySelector('[data-action="plus"]').addEventListener('click', () => this.alterarQuantidade(item.id, 1));
                itemEl.querySelector('[data-action="remove"]').addEventListener('click', () => this.removerDoCarrinho(item.id));

                container.appendChild(itemFragment);
            });
        }

        this.atualizarTotais();
    },

    atualizarTotais() {
        const subtotal = this.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
        document.getElementById('carrinho-subtotal').textContent = App.formatarMoeda(subtotal);
        document.getElementById('carrinho-total').textContent = App.formatarMoeda(subtotal);
    },

    adicionarAoCarrinho(id) {
        const item = App.data.itens.find(i => i.id === id);
        if (!item) return;

        const noCarrinho = this.carrinho.find(c => c.id === id);
        const qtdNoCarrinho = noCarrinho ? noCarrinho.quantidade : 0;
        
        if (qtdNoCarrinho >= item.quantidade) {
            alert('Quantidade indisponível em estoque!');
            return;
        }

        if (noCarrinho) {
            noCarrinho.quantidade++;
        } else {
            this.carrinho.push({
                id: item.id,
                nome: item.nome,
                preco: item.preco,
                quantidade: 1
            });
        }

        this.renderCarrinho();
        this.renderProdutos();
    },

    alterarQuantidade(id, delta) {
        const itemCarrinho = this.carrinho.find(c => c.id === id);
        const itemEstoque = App.data.itens.find(i => i.id === id);
        
        if (!itemCarrinho) return;

        const novaQtd = itemCarrinho.quantidade + delta;
        
        if (novaQtd <= 0) {
            this.removerDoCarrinho(id);
            return;
        }

        if (novaQtd > itemEstoque.quantidade) {
            alert('Quantidade indisponível em estoque!');
            return;
        }

        itemCarrinho.quantidade = novaQtd;
        this.renderCarrinho();
        this.renderProdutos();
    },

    removerDoCarrinho(id) {
        this.carrinho = this.carrinho.filter(c => c.id !== id);
        this.renderCarrinho();
        this.renderProdutos();
    },

    limparCarrinho() {
        if (this.carrinho.length === 0) return;
        if (!confirm('Limpar todo o carrinho?')) return;
        
        this.carrinho = [];
        this.renderCarrinho();
        this.renderProdutos();
    },

    atualizarSelectClientes() {
        const select = document.getElementById('venda-cliente');
        
        // Limpa todas as opções exceto a primeira
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        App.data.clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nome;
            select.appendChild(option);
        });
    },

    finalizarVenda(naCaderneta = false) {
        console.log('[finalizarVenda] ===== INÍCIO =====');
        console.log('[finalizarVenda] naCaderneta:', naCaderneta);
        console.log('[finalizarVenda] this.carrinho:', this.carrinho);
        console.log('[finalizarVenda] this.carrinho.length:', this.carrinho.length);
        
        if (this.carrinho.length === 0) {
            console.log('[finalizarVenda] Carrinho vazio - abortando');
            alert('Carrinho vazio!');
            return;
        }

        const clienteId = document.getElementById('venda-cliente');
        console.log('[finalizarVenda] Elemento venda-cliente:', clienteId);
        const clienteIdValue = clienteId ? clienteId.value : '';
        console.log('[finalizarVenda] clienteIdValue:', clienteIdValue);

        // Se for na caderneta, abre modal para coletar dados do cliente
        if (naCaderneta) {
            console.log('[finalizarVenda] Modo CADERNETA - abrindo modal...');
            this.abrirModalCaderneta();
            return;
        }

        // Fluxo normal de venda (à vista)
        console.log('[finalizarVenda] Modo VENDA À VISTA - processando...');
        this.processarFinalizacaoVenda(false, clienteIdValue);
    },

    /**
     * Abre modal para coletar dados do cliente para caderneta
     */
    abrirModalCaderneta() {
        console.log('[abrirModalCaderneta] Iniciando...');
        const total = this.carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const resumoDiv = document.getElementById('caderneta-resumo');
        
        // Preenche resumo da venda
        resumoDiv.innerHTML = `
            <div style="margin-bottom:0.5rem;"><strong>Total:</strong> ${App.formatarMoeda(total)}</div>
            <div style="font-size:0.85rem;color:#64748b;">
                ${this.carrinho.map(i => `${i.quantidade}x ${i.nome}`).join('<br>')}
            </div>
        `;
        
        // Carrega clientes existentes no dropdown
        this.carregarClientesCaderneta();
        
        // Reseta para modo 'existente'
        this.modoCaderneta('existente');
        
        // Limpa campos
        document.getElementById('caderneta-nome').value = '';
        document.getElementById('caderneta-contato').value = '';
        document.getElementById('caderneta-cliente-select').value = '';
        
        // Abre modal
        const modal = document.getElementById('modal-caderneta-cliente');
        modal.classList.add('active');
        console.log('[abrirModalCaderneta] Modal aberto!');
    },

    /**
     * Carrega clientes existentes da caderneta no dropdown
     */
    carregarClientesCaderneta() {
        const select = document.getElementById('caderneta-cliente-select');
        const listaCaderneta = JSON.parse(localStorage.getItem('lista_caderneta') || '{}');
        
        // Limpa opções exceto a primeira
        select.innerHTML = '<option value="">-- Selecione um cliente --</option>';
        
        // Adiciona clientes existentes
        const clientes = Object.keys(listaCaderneta).sort();
        clientes.forEach(nome => {
            const cliente = listaCaderneta[nome];
            const option = document.createElement('option');
            option.value = nome;
            option.textContent = `${nome} (Devendo: ${App.formatarMoeda(cliente.total_devido)})`;
            select.appendChild(option);
        });
        
        console.log('[carregarClientesCaderneta] Clientes carregados:', clientes.length);
    },

    /**
     * Alterna entre modo 'existente' e 'novo'
     */
    modoCaderneta(modo) {
        console.log('[modoCaderneta] Modo:', modo);
        
        const tabExistente = document.getElementById('tab-existente');
        const tabNovo = document.getElementById('tab-novo');
        const divExistente = document.getElementById('modo-existente');
        const divNovo = document.getElementById('modo-novo');
        const inputModo = document.getElementById('caderneta-modo');
        
        inputModo.value = modo;
        
        if (modo === 'existente') {
            tabExistente.classList.add('active');
            tabNovo.classList.remove('active');
            divExistente.style.display = 'block';
            divNovo.style.display = 'none';
            document.getElementById('caderneta-nome').removeAttribute('required');
        } else {
            tabExistente.classList.remove('active');
            tabNovo.classList.add('active');
            divExistente.style.display = 'none';
            divNovo.style.display = 'block';
            document.getElementById('caderneta-nome').setAttribute('required', 'required');
            setTimeout(() => document.getElementById('caderneta-nome').focus(), 100);
        }
    },

    /**
     * Fecha modal da caderneta
     */
    fecharModalCaderneta() {
        document.getElementById('modal-caderneta-cliente').classList.remove('active');
    },

    /**
     * Salva venda na caderneta (chamado pelo form do modal)
     * Suporta dois fluxos: cliente existente ou novo cadastro
     */
    salvarVendaCaderneta(e) {
        e.preventDefault();
        console.log('[salvarVendaCaderneta] Iniciando salvamento...');
        
        const modo = document.getElementById('caderneta-modo').value;
        console.log('[salvarVendaCaderneta] Modo selecionado:', modo);
        
        let nome, contato;
        
        if (modo === 'existente') {
            // Fluxo: selecionar cliente existente
            const select = document.getElementById('caderneta-cliente-select');
            nome = select.value;
            
            if (!nome) {
                alert('Por favor, selecione um cliente da lista!\n\nSe for novo cliente, clique em "Novo Cliente".');
                select.focus();
                return;
            }
            
            // Busca contato do cliente existente
            const listaCaderneta = JSON.parse(localStorage.getItem('lista_caderneta') || '{}');
            contato = listaCaderneta[nome]?.contato || '';
            
            console.log('[salvarVendaCaderneta] Cliente existente:', nome, contato);
        } else {
            // Fluxo: novo cadastro
            nome = document.getElementById('caderneta-nome').value.trim();
            contato = document.getElementById('caderneta-contato').value.trim();
            
            if (!nome) {
                alert('Por favor, informe o nome do cliente!');
                document.getElementById('caderneta-nome').focus();
                return;
            }
            
            console.log('[salvarVendaCaderneta] Novo cliente:', nome, contato);
        }
        
        // Processa a venda na caderneta
        this.processarFinalizacaoVenda(true, null, { nome, contato });
        this.fecharModalCaderneta();
        console.log('[salvarVendaCaderneta] Venda salva com sucesso!');
    },

    /**
     * Processa a finalização da venda (fluxo completo)
     * @param {boolean} naCaderneta - Se é venda na caderneta
     * @param {number|null} clienteId - ID do cliente selecionado (para vendas à vista)
     * @param {Object|null} dadosCliente - Dados do cliente {nome, contato} (para caderneta)
     */
    processarFinalizacaoVenda(naCaderneta = false, clienteId = null, dadosCliente = null) {
        const total = this.carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

        // Baixa do estoque usando o sistema de gerenciamento de estoque
        const itensParaBaixa = this.carrinho.map(item => ({
            id: item.id,
            quantidade: item.quantidade
        }));

        const resultadoBaixa = App.baixarEstoqueVenda(itensParaBaixa);

        // Se houve erro na baixa, cancela a venda
        if (!resultadoBaixa.sucesso) {
            alert('⚠️ Erro na baixa de estoque:\n\n' + resultadoBaixa.erros.join('\n'));
            return;
        }

        // Exibe alertas de estoque crítico, se houver
        if (resultadoBaixa.alertas.length > 0) {
            const mensagensAlerta = resultadoBaixa.alertas.map(a => a.mensagem).join('\n\n');
            setTimeout(() => {
                alert('🚨 ALERTAS DE ESTOQUE CRÍTICO GERADOS:\n\n' + mensagensAlerta + 
                      '\n\nVerifique o painel de alertas no topo da página.');
            }, 100);
        }

        // Se for na caderneta, salva no localStorage com acumulação por cliente
        if (naCaderneta && dadosCliente) {
            // Recupera ou cria objeto de clientes na caderneta (estrutura: { nome: { dados } })
            let listaCaderneta = JSON.parse(localStorage.getItem('lista_caderneta') || '{}');
            
            const nomeCliente = dadosCliente.nome.trim();
            const agora = new Date().toISOString();
            
            // Se cliente já existe, acumula o valor. Se não, cria novo
            if (listaCaderneta[nomeCliente]) {
                // Cliente existente - acumula valores
                listaCaderneta[nomeCliente].total_devido += total;
                listaCaderneta[nomeCliente].ultima_atualizacao = agora;
                listaCaderneta[nomeCliente].contato = dadosCliente.contato || listaCaderneta[nomeCliente].contato;
                
                // Adiciona ao histórico de compras
                listaCaderneta[nomeCliente].historico.push({
                    data: agora,
                    itens: this.carrinho.map(item => ({
                        nome: item.nome,
                        quantidade: item.quantidade,
                        precoUnitario: item.preco,
                        subtotal: item.preco * item.quantidade
                    })),
                    total: total
                });
                
                console.log('[Caderneta] Cliente existente - valor acumulado:', listaCaderneta[nomeCliente].total_devido);
            } else {
                // Novo cliente
                listaCaderneta[nomeCliente] = {
                    cliente: nomeCliente,
                    contato: dadosCliente.contato || '',
                    total_devido: total,
                    ultima_atualizacao: agora,
                    historico: [{
                        data: agora,
                        itens: this.carrinho.map(item => ({
                            nome: item.nome,
                            quantidade: item.quantidade,
                            precoUnitario: item.preco,
                            subtotal: item.preco * item.quantidade
                        })),
                        total: total
                    }]
                };
                
                console.log('[Caderneta] Novo cliente criado:', nomeCliente);
            }
            
            // Salva no localStorage
            localStorage.setItem('lista_caderneta', JSON.stringify(listaCaderneta));
            
            console.log('[Caderneta] Salvo no localStorage. Total clientes:', Object.keys(listaCaderneta).length);
            console.log('[Caderneta] Dados do cliente:', listaCaderneta[nomeCliente]);
        }

        // Se for na caderneta com cliente existente, lança o débito no cliente
        if (naCaderneta && clienteId) {
            const cliente = App.data.clientes.find(c => c.id === parseInt(clienteId));
            if (cliente) {
                if (!cliente.lancamentos) cliente.lancamentos = [];
                
                const descricao = this.carrinho.map(i => `${i.quantidade}x ${i.nome}`).join(', ');
                cliente.lancamentos.push({
                    data: new Date().toISOString(),
                    tipo: 'venda',
                    valor: total,
                    descricao: descricao.substring(0, 100),
                    amoladores: null
                });
            }
        }

        // Salva no histórico de vendas para relatórios
        const vendaRegistro = {
            id: `venda_${Date.now()}`,
            data: new Date().toISOString(),
            itens: this.carrinho.map(item => ({
                id: item.id,
                nome: item.nome,
                categoria: item.categoria,
                quantidade: item.quantidade,
                precoUnitario: item.preco,
                subtotal: item.preco * item.quantidade
            })),
            total: total,
            clienteId: clienteId || null,
            clienteCaderneta: naCaderneta && dadosCliente ? dadosCliente.nome : null,
            naCaderneta: naCaderneta
        };
        App.data.historicoVendas.push(vendaRegistro);

        // Gera a nota
        this.mostrarNota(naCaderneta, clienteId, dadosCliente);

        // Limpa carrinho e atualiza todas as telas
        this.carrinho = [];
        this.renderCarrinho();
        this.renderProdutos();
        
        console.log('[Venda] Atualizando tela de créditos/caderneta...');
        creditos.render();
        console.log('[Venda] Tela de créditos atualizada!');
        
        estoque.render();
        App.salvarDados();
        
        // Mostra mensagem de confirmação
        if (naCaderneta) {
            // Busca o total acumulado do cliente
            const listaCaderneta = JSON.parse(localStorage.getItem('lista_caderneta') || '{}');
            const clienteData = listaCaderneta[dadosCliente.nome];
            const totalAcumulado = clienteData ? clienteData.total_devido : total;
            const isNovoCliente = clienteData && clienteData.historico && clienteData.historico.length === 1;
            
            if (isNovoCliente) {
                alert(`✅ Nova caderneta criada!\n\nCliente: ${dadosCliente.nome}\nTotal devido: ${App.formatarMoeda(total)}`);
            } else {
                alert(`✅ Valor adicionado à caderneta!\n\nCliente: ${dadosCliente.nome}\nNesta compra: ${App.formatarMoeda(total)}\nTotal acumulado: ${App.formatarMoeda(totalAcumulado)}`);
            }
        }
    },

    mostrarNota(naCaderneta, clienteId, dadosCliente = null) {
        const total = this.carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const data = new Date();
        const cliente = clienteId ? App.data.clientes.find(c => c.id === parseInt(clienteId)) : null;
        const numNota = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        const notaFragment = cloneTemplate('tpl-nota-fiscal');
        if (!notaFragment) return;

        const nota = notaFragment.querySelector('.nota-fiscal');
        
        // Preenche data e hora
        nota.querySelector('[data-data]').textContent = `Nota: #${numNota} - ${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR')}`;
        nota.querySelector('[data-hora]').textContent = data.toLocaleString('pt-BR');

        // Preenche cliente
        const clienteEl = nota.querySelector('[data-cliente]');
        if (cliente) {
            // Cliente selecionado do dropdown
            clienteEl.textContent = cliente.nome;
            if (cliente.contato || naCaderneta) {
                const contatoEl = document.createElement('div');
                contatoEl.className = 'nota-cliente-contato';
                if (cliente.contato) {
                    contatoEl.textContent = cliente.contato;
                }
                if (naCaderneta) {
                    const cadernetaEl = document.createElement('span');
                    cadernetaEl.className = 'nota-caderneta-badge';
                    cadernetaEl.textContent = '📒 Lançado na Caderneta';
                    contatoEl.appendChild(cadernetaEl);
                }
                clienteEl.appendChild(contatoEl);
            }
        } else if (dadosCliente) {
            // Cliente da caderneta (novo fluxo)
            clienteEl.textContent = dadosCliente.nome;
            const contatoEl = document.createElement('div');
            contatoEl.className = 'nota-cliente-contato';
            if (dadosCliente.contato) {
                contatoEl.textContent = dadosCliente.contato;
            }
            const cadernetaEl = document.createElement('span');
            cadernetaEl.className = 'nota-caderneta-badge';
            cadernetaEl.textContent = '📒 Caderneta';
            contatoEl.appendChild(cadernetaEl);
            clienteEl.appendChild(contatoEl);
        } else {
            clienteEl.textContent = 'Cliente não identificado';
        }

        // Preenche itens
        const tbody = nota.querySelector('[data-itens]');
        this.carrinho.forEach(item => {
            const rowFragment = cloneTemplate('tpl-nota-item-row');
            if (!rowFragment) return;
            
            const row = rowFragment.querySelector('[data-row]');
            fillDataAttributes(row, {
                nome: item.nome,
                qtd: item.quantidade,
                unit: App.formatarMoeda(item.preco),
                total: App.formatarMoeda(item.preco * item.quantidade)
            });
            tbody.appendChild(rowFragment);
        });

        // Preenche total
        nota.querySelector('[data-total]').textContent = App.formatarMoeda(total);

        document.getElementById('nota-conteudo').innerHTML = '';
        document.getElementById('nota-conteudo').appendChild(notaFragment);
        document.getElementById('modal-nota').classList.add('active');
    },

    fecharNota() {
        document.getElementById('modal-nota').classList.remove('active');
    },

    imprimirNota() {
        const conteudo = document.getElementById('nota-conteudo').innerHTML;
        const janela = window.open('', '_blank', 'width=500,height=700');
        
        janela.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Nota - Flutuante do Grande</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Courier New', monospace; 
                        font-size: 12px; 
                        padding: 20px;
                        max-width: 400px;
                        margin: 0 auto;
                    }
                    .nota-header { text-align: center; margin-bottom: 15px; }
                    .nota-header h2 { font-size: 16px; margin-bottom: 5px; }
                    .nota-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10px; }
                    .nota-cliente { margin-bottom: 10px; padding: 8px; border: 1px dashed #000; }
                    .nota-itens { margin-bottom: 10px; }
                    .nota-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dotted #ccc; }
                    .nota-item-info { flex: 1; }
                    .nota-item-nome { font-weight: bold; }
                    .nota-item-qtd { font-size: 10px; color: #666; }
                    .nota-item-preco { text-align: right; min-width: 80px; }
                    .nota-totais { border-top: 2px solid #000; padding-top: 10px; }
                    .nota-total-final { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; }
                    .nota-rodape { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
                </style>
            </head>
            <body>
                ${conteudo}
            </body>
            </html>
        `);
        
        janela.document.close();
        janela.print();
    }
};

// Módulo: Precificação
const precificacao = {
    calcular() {
        const custo = parseFloat(document.getElementById('calc-custo').value) || 0;
        const frete = parseFloat(document.getElementById('calc-frete').value) || 0;
        const margem = parseFloat(document.getElementById('calc-margem').value) || 0;

        const custoChegada = custo + frete;
        const precoVenda = custoChegada * (1 + margem / 100);
        const lucro = precoVenda - custoChegada;

        document.getElementById('res-custo-chegada').textContent = App.formatarMoeda(custoChegada);
        document.getElementById('res-preco-venda').textContent = App.formatarMoeda(precoVenda);
        document.getElementById('res-lucro').textContent = App.formatarMoeda(lucro);
    }
};

// Módulo: Relatórios
const relatorios = {
    // Gera lista de reposição baseada nas vendas do mês atual
    gerarListaReposicao() {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        
        // Filtra vendas do mês atual
        const vendasDoMes = App.data.historicoVendas.filter(venda => {
            const dataVenda = new Date(venda.data);
            return dataVenda.getMonth() === mesAtual && dataVenda.getFullYear() === anoAtual;
        });
        
        // Se não houver vendas no mês
        if (vendasDoMes.length === 0) {
            return {
                periodo: this.formatarPeriodo(mesAtual, anoAtual),
                itens: [],
                totalVendas: 0,
                mensagem: 'Nenhuma venda registrada neste mês.'
            };
        }
        
        // Agrupa por produto e soma quantidades
        const produtosVendidos = {};
        
        vendasDoMes.forEach(venda => {
            venda.itens.forEach(item => {
                if (!produtosVendidos[item.id]) {
                    produtosVendidos[item.id] = {
                        id: item.id,
                        nome: item.nome,
                        categoria: item.categoria,
                        quantidade: 0
                    };
                }
                produtosVendidos[item.id].quantidade += item.quantidade;
            });
        });
        
        // Converte para array e ordena por quantidade (maior primeiro)
        const listaOrdenada = Object.values(produtosVendidos)
            .sort((a, b) => b.quantidade - a.quantidade);
        
        return {
            periodo: this.formatarPeriodo(mesAtual, anoAtual),
            itens: listaOrdenada,
            totalVendas: vendasDoMes.length,
            mensagem: null
        };
    },
    
    // Formata o período para exibição
    formatarPeriodo(mes, ano) {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${meses[mes]} de ${ano}`;
    },
    
    // Renderiza a lista de reposição na tabela (modal)
    renderizarListaReposicao() {
        const dados = this.gerarListaReposicao();
        const tbody = document.getElementById('reposicao-tbody');
        const periodoEl = document.getElementById('reposicao-periodo');
        const totalEl = document.getElementById('reposicao-total-vendas');
        const vazioEl = document.getElementById('reposicao-vazio');
        
        if (!tbody || !periodoEl) return;
        
        // Atualiza cabeçalho
        periodoEl.textContent = dados.periodo;
        if (totalEl) totalEl.textContent = dados.totalVendas;
        
        // Limpa tabela
        tbody.innerHTML = '';
        
        // Mostra mensagem se vazio
        if (dados.itens.length === 0) {
            if (vazioEl) vazioEl.style.display = 'block';
            return;
        }
        
        if (vazioEl) vazioEl.style.display = 'none';
        
        // Preenche tabela usando template
        dados.itens.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.nome}</strong></td>
                <td style="text-align:center;font-size:1.1rem;font-weight:600;color:var(--spark-green);">${item.quantidade}</td>
            `;
            tbody.appendChild(row);
        });
    },

    // Renderiza a lista de reposição na página dedicada
    renderizarListaReposicaoPagina() {
        const dados = this.gerarListaReposicao();
        const tbody = document.getElementById('reposicao-page-tbody');
        const periodoEl = document.getElementById('reposicao-page-periodo');
        const totalEl = document.getElementById('reposicao-page-total');
        const vazioEl = document.getElementById('reposicao-page-vazio');
        const conteudoEl = document.getElementById('reposicao-page-conteudo');
        
        if (!tbody || !periodoEl) {
            console.log('[Reposição Página] Elementos não encontrados');
            return;
        }
        
        console.log('[Reposição Página] Renderizando', dados.itens.length, 'itens');
        
        // Atualiza cabeçalho
        periodoEl.textContent = dados.periodo;
        if (totalEl) totalEl.textContent = dados.totalVendas;
        
        // Limpa tabela
        tbody.innerHTML = '';
        
        // Mostra mensagem se vazio
        if (dados.itens.length === 0) {
            if (vazioEl) vazioEl.style.display = 'block';
            if (conteudoEl) conteudoEl.style.display = 'none';
            return;
        }
        
        if (vazioEl) vazioEl.style.display = 'none';
        if (conteudoEl) conteudoEl.style.display = 'block';
        
        // Preenche tabela com categoria
        dados.itens.forEach(item => {
            const row = document.createElement('tr');
            row.style.cssText = 'border-bottom:1px solid var(--border);';
            row.innerHTML = `
                <td style="padding:12px;"><strong>${item.nome}</strong></td>
                <td style="padding:12px;text-align:center;text-transform:capitalize;color:var(--gray);">${item.categoria || '-'}</td>
                <td style="padding:12px;text-align:center;font-size:1.1rem;font-weight:600;color:var(--primary);">${item.quantidade}</td>
            `;
            tbody.appendChild(row);
        });
    },

    // Atualiza a lista de reposição na página
    atualizarListaReposicao() {
        console.log('[Reposição] Atualizando lista...');
        this.renderizarListaReposicaoPagina();
        
        const dados = this.gerarListaReposicao();
        if (dados.itens.length > 0) {
            alert(`✅ Lista atualizada!\n\nPeríodo: ${dados.periodo}\nTotal de itens: ${dados.itens.length}\nUnidades vendidas: ${dados.totalVendas}`);
        } else {
            alert('📭 Nenhuma venda registrada neste mês.\n\nRealize vendas para gerar a lista de reposição.');
        }
    },

    // Imprime a lista de reposição da página
    imprimirListaReposicao() {
        const dados = this.gerarListaReposicao();
        
        if (dados.itens.length === 0) {
            alert('Não há itens para imprimir. Realize vendas primeiro.');
            return;
        }
        
        // Cria conteúdo para impressão
        let html = `
            <html>
            <head>
                <title>Lista de Reposição - Flor do Luar</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
                    .info { color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th { background: #667eea; color: white; padding: 10px; text-align: left; }
                    td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .qtde { text-align: center; font-weight: bold; color: #667eea; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>📋 Lista de Reposição - Flor do Luar</h1>
                <div class="info">
                    <p><strong>Período:</strong> ${dados.periodo}</p>
                    <p><strong>Total de vendas:</strong> ${dados.totalVendas} unidades</p>
                    <p><strong>Data de emissão:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th style="text-align:center;">Categoria</th>
                            <th style="text-align:center;">Qtde Vendida</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dados.itens.map(item => `
                            <tr>
                                <td>${item.nome}</td>
                                <td style="text-align:center;text-transform:capitalize;">${item.categoria || '-'}</td>
                                <td class="qtde">${item.quantidade}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="no-print" style="margin-top:30px;padding:15px;background:#f5f5f5;border-radius:5px;">
                    <p><em>Lista gerada automaticamente pelo sistema Flor do Luar</em></p>
                    <button onclick="window.print()" style="padding:10px 20px;font-size:16px;cursor:pointer;">🖨️ Imprimir</button>
                </div>
            </body>
            </html>
        `;
        
        // Abre em nova janela para impressão
        const janela = window.open('', '_blank');
        janela.document.write(html);
        janela.document.close();
    },
    
    // Abre o modal de lista de reposição
    abrirModal() {
        this.renderizarListaReposicao();
        
        const modal = document.getElementById('modal-reposicao');
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    // Fecha o modal
    fecharModal() {
        const modal = document.getElementById('modal-reposicao');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    // Imprime a lista de reposição
    imprimirLista() {
        const conteudo = document.getElementById('reposicao-conteudo');
        if (!conteudo) return;
        
        const janela = window.open('', '_blank', 'width=600,height=700');
        janela.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Lista de Reposição - Flor do Luar</title>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: 'Segoe UI', sans-serif; 
                        padding: 20px;
                        max-width: 500px;
                        margin: 0 auto;
                    }
                    h2 { text-align: center; margin-bottom: 5px; }
                    .periodo { text-align: center; color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { 
                        padding: 12px 8px; 
                        text-align: left; 
                        border-bottom: 1px solid #ddd;
                    }
                    th { background: #f5f5f5; font-weight: 600; }
                    td.qtd { 
                        text-align: center; 
                        font-weight: bold; 
                        font-size: 1.1rem;
                        color: #10b981;
                    }
                    .footer { 
                        margin-top: 30px; 
                        text-align: center; 
                        font-size: 12px; 
                        color: #999;
                        border-top: 1px dashed #ccc;
                        padding-top: 15px;
                    }
                </style>
            </head>
            <body>
                <h2>🛒 Lista de Reposição</h2>
                <p class="periodo">${document.getElementById('reposicao-periodo').textContent}</p>
                ${conteudo.innerHTML}
                <div class="footer">
                    Flor do Luar - Mercadinho<br>
                    Gerado em: ${new Date().toLocaleDateString('pt-BR')}
                </div>
            </body>
            </html>
        `);
        
        janela.document.close();
        janela.print();
    }
};

// ============================================
// MÓDULO: SCANNER DE CÓDIGO DE BARRAS
// ============================================

const barcodeScanner = {
    scanner: null,
    modo: 'venda', // 'venda' ou 'cadastro'
    cameraAtual: 'environment', // 'environment' (traseira) ou 'user' (frontal)
    bufferLeitorUSB: '',
    ultimoScan: 0,

    /**
     * Inicializa o listener para leitor USB (keydown)
     * Captura códigos digitados rapidamente (característica de leitores USB)
     */
    init() {
        this.setupKeydownListener();
        console.log('[BarcodeScanner] Inicializado (USB apenas)');
    },

    /**
     * Configura listener de keydown para capturar códigos do leitor USB
     * Leitores USB emitem o código como keystrokes seguidos de Enter
     */
    setupKeydownListener() {
        let buffer = '';
        let timeout = null;

        // Detecta se está na página de vendas
        const isPaginaVendas = () => {
            const pageVendas = document.getElementById('page-vendas');
            return pageVendas && pageVendas.classList.contains('active');
        };

        // Evento global de keydown
        document.addEventListener('keydown', (e) => {
            // Só processa na página de vendas
            if (!isPaginaVendas()) return;

            // Ignora se estiver em um input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Captura caracteres imprimíveis
            if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                buffer += e.key;

                // Reseta buffer após 100ms (leitores são rápidos)
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    buffer = '';
                }, 100);
            }

            // Quando receber Enter, processa o buffer
            if (e.key === 'Enter' && buffer.length >= 8) {
                e.preventDefault();
                const codigo = buffer.trim();
                buffer = '';
                clearTimeout(timeout);

                console.log('[BarcodeScanner] Código capturado via USB:', codigo);
                this.processarCodigoVenda(codigo);
            }
        });
    },

    /**
     * Abre scanner.html em nova aba para escanear com câmera
     * @param {string} modo - 'venda' ou 'cadastro'
     */
    abrirModalScanner(modo = 'venda') {
        // Abre scanner.html em nova aba
        window.open('scanner.html', '_blank');
    },

    /**
     * Fecha o modal (mantido para compatibilidade)
     */
    fecharModal() {
        // Não faz nada - scanner agora está em página separada
    },

    /**
     * Inicia câmera (mantido para compatibilidade)
     */
    async iniciarCamera() {
        // Câmera agora está em scanner.html
    },

    /**
     * Para a câmera
     */
    async pararCamera() {
        if (this.scanner && this.scanner.isScanning) {
            try {
                await this.scanner.stop();
            } catch (error) {
                console.log('[BarcodeScanner] Erro ao parar câmera:', error);
            }
        }
    },

    /**
     * Alterna entre câmera frontal e traseira
     */
    async alternarCamera() {
        await this.pararCamera();
        this.cameraAtual = this.cameraAtual === 'environment' ? 'user' : 'environment';
        await this.iniciarCamera();
    },

    /**
     * Callback quando um código é escaneado com sucesso
     */
    onScanSuccess(decodedText) {
        // Evita scans duplicados em curto período
        const agora = Date.now();
        if (agora - this.ultimoScan < 2000) return;
        this.ultimoScan = agora;

        console.log('[BarcodeScanner] Código escaneado:', decodedText);

        const statusEl = document.getElementById('scanner-status');
        statusEl.textContent = `Código detectado: ${decodedText}`;
        statusEl.className = 'scanner-status sucesso';

        // Pausa a câmera temporariamente
        this.pararCamera();

        // Processa conforme o modo
        if (this.modo === 'venda') {
            this.processarCodigoVenda(decodedText);
            // Fecha o modal após um breve delay
            setTimeout(() => this.fecharModal(), 800);
        } else if (this.modo === 'cadastro') {
            this.processarCodigoCadastro(decodedText);
            // Não fecha o modal no cadastro, apenas preenche
            document.getElementById('scanner-input-manual').value = decodedText;
            statusEl.textContent = 'Código capturado! Feche o modal para confirmar.';
        }
    },

    /**
     * Callback quando há falha no scan (não usado, apenas log)
     */
    onScanFailure(error) {
        // Silencioso - falhas são normais quando não há código na tela
    },

    /**
     * Processa código digitado manualmente
     */
    processarCodigoManual() {
        const input = document.getElementById('scanner-input-manual');
        const codigo = input.value.trim();

        if (!codigo) {
            this.mostrarStatus('Digite um código válido', 'erro');
            return;
        }

        if (this.modo === 'venda') {
            this.processarCodigoVenda(codigo);
            this.fecharModal();
        } else if (this.modo === 'cadastro') {
            this.processarCodigoCadastro(codigo);
            this.fecharModal();
        }
    },

    /**
     * Mostra status no scanner
     */
    mostrarStatus(mensagem, tipo = 'scanning') {
        const statusEl = document.getElementById('scanner-status');
        statusEl.textContent = mensagem;
        statusEl.className = `scanner-status ${tipo}`;
    },

    /**
     * Processa código na página de vendas
     * Busca produto e adiciona ao carrinho
     */
    processarCodigoVenda(codigoBarras) {
        // Limpa o código (remove espaços e caracteres não numéricos)
        const codigoLimpo = codigoBarras.replace(/\D/g, '');

        if (!codigoLimpo) {
            this.mostrarFeedback('Código inválido', 'erro');
            return;
        }

        // Busca produto pelo código de barras
        const produto = App.data.itens.find(item =>
            item.codigo_barras === codigoLimpo ||
            item.codigo_barras === codigoBarras
        );

        if (!produto) {
            this.mostrarFeedback(`Produto não encontrado: ${codigoLimpo}`, 'erro');
            return;
        }

        // Adiciona ao carrinho
        vendas.adicionarAoCarrinho(produto.id);
        this.mostrarFeedback(`${produto.nome} adicionado!`, 'sucesso');

        // Toca som de confirmação (opcional)
        this.tocarSomSucesso();
    },

    /**
     * Processa código no formulário de cadastro
     * Preenche o campo de código de barras
     */
    processarCodigoCadastro(codigoBarras) {
        const input = document.getElementById('item-codigo-barras');
        if (input) {
            input.value = codigoBarras.replace(/\D/g, '');
            input.focus();
        }
    },

    /**
     * Mostra feedback visual na tela
     */
    mostrarFeedback(mensagem, tipo = 'sucesso') {
        // Remove feedback anterior se existir
        const anterior = document.querySelector('.scanner-feedback');
        if (anterior) anterior.remove();

        const feedback = document.createElement('div');
        feedback.className = `scanner-feedback ${tipo}`;
        feedback.textContent = mensagem;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 2000);
    },

    /**
     * Toca som de sucesso (feedback sonoro)
     */
    tocarSomSucesso() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Silencioso se não conseguir tocar som
        }
    }
};

// Inicializa o scanner quando o App inicia
const originalInit = App.init.bind(App);
App.init = function() {
    originalInit();
    barcodeScanner.init();
};

// ============================================
// ATUALIZAÇÕES NOS MÓDULOS EXISTENTES
// ============================================

// Atualiza estoque.salvar() para incluir código de barras
const originalEstoqueSalvar = estoque.salvar.bind(estoque);
estoque.salvar = async function(event) {
    event.preventDefault();

    const id = document.getElementById('item-id').value;
    const codigoBarras = document.getElementById('item-codigo-barras').value.trim();

    const item = {
        nome: document.getElementById('item-nome').value,
        codigo_barras: codigoBarras || null,
        categoria: document.getElementById('item-categoria').value,
        quantidade: parseInt(document.getElementById('item-quantidade').value),
        custo: parseFloat(document.getElementById('item-custo').value),
        frete: parseFloat(document.getElementById('item-frete').value),
        preco: parseFloat(document.getElementById('item-preco').value),
        minimo: parseInt(document.getElementById('item-minimo').value) || 5
    };

    // Campos específicos para bebidas
    const grupoUnidade = document.getElementById('grupo-unidade');
    if (grupoUnidade && grupoUnidade.style.display !== 'none') {
        const nivelVenda = document.getElementById('item-unidade-nivel').value;
        if (nivelVenda) {
            item.nivel_venda = nivelVenda;
            item.unidade = nivelVenda;
        }

        const tipoBebida = document.getElementById('item-tipo-bebida');
        if (tipoBebida) {
            item.tipo_bebida = tipoBebida.value;
        }

        const freteProporcional = document.getElementById('item-frete-proporcional');
        if (freteProporcional && freteProporcional.value) {
            item.frete_proporcional = parseFloat(freteProporcional.value);
        }

        const unidadesEmbalagem = document.getElementById('item-unidades-por-embalagem');
        if (unidadesEmbalagem && unidadesEmbalagem.value) {
            item.unidades_por_embalagem = parseInt(unidadesEmbalagem.value);
        }
    }

    if (id) {
        const index = App.data.itens.findIndex(i => i.id == id);
        if (index !== -1) {
            App.data.itens[index] = { ...App.data.itens[index], ...item };
        }
    } else {
        item.id = Math.max(...App.data.itens.map(i => i.id), 0) + 1;
        item.data_cadastro = new Date().toISOString();
        App.data.itens.push(item);
    }

    App.salvarDados();
    this.fecharModal();
    App.renderAll();

    // Mostra feedback
    barcodeScanner.mostrarFeedback(id ? 'Item atualizado!' : 'Item cadastrado!', 'sucesso');
};

// Atualiza estoque.editar() para preencher código de barras
const originalEstoqueEditar = estoque.editar.bind(estoque);
estoque.editar = function(id) {
    const item = App.data.itens.find(i => i.id === id);
    if (!item) return;

    document.getElementById('modal-item-title').textContent = 'Editar Item';
    document.getElementById('item-id').value = item.id;
    document.getElementById('item-nome').value = item.nome;
    document.getElementById('item-codigo-barras').value = item.codigo_barras || '';
    document.getElementById('item-categoria').value = item.categoria;
    document.getElementById('item-quantidade').value = item.quantidade;
    document.getElementById('item-custo').value = item.custo;
    document.getElementById('item-frete').value = item.frete;
    document.getElementById('item-preco').value = item.preco;
    document.getElementById('item-minimo').value = item.minimo || 5;

    this.onCategoriaChange(item.categoria);

    // Campos de bebidas
    if (item.nivel_venda) {
        const nivelSelect = document.getElementById('item-unidade-nivel');
        if (nivelSelect) nivelSelect.value = item.nivel_venda;
    }
    if (item.tipo_bebida) {
        const tipoSelect = document.getElementById('item-tipo-bebida');
        if (tipoSelect) tipoSelect.value = item.tipo_bebida;
    }
    if (item.frete_proporcional) {
        const freteInput = document.getElementById('item-frete-proporcional');
        if (freteInput) freteInput.value = item.frete_proporcional;
    }
    if (item.unidades_por_embalagem) {
        const unidadesInput = document.getElementById('item-unidades-por-embalagem');
        if (unidadesInput) unidadesInput.value = item.unidades_por_embalagem;
    }

    document.getElementById('modal-item').classList.add('active');
};

// Fechar modais ao clicar fora
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DOMContentLoaded] Inicializando App...');
    App.init();
    
    // Fallback: garante que botões de venda tenham event listeners
    setTimeout(() => {
        console.log('[Fallback] Verificando botões de venda...');
        vendas.setupBotoesVenda();
    }, 100);
});

// Expor objetos no escopo global para onclick handlers
console.log('[FLOR DO LUAR] Expondo objetos globais...');
window.App = App;
window.estoque = estoque;
window.vendas = vendas;
window.creditos = creditos;
window.precificacao = precificacao;
window.relatorios = relatorios;
window.barcodeScanner = barcodeScanner;
console.log('[FLOR DO LUAR] Objetos expostos: vendas=', !!window.vendas, 'finalizarVenda=', typeof window.vendas?.finalizarVenda);

// Função de teste para debug
window.testarBotoesVenda = function() {
    console.log('=== TESTE DE BOTÕES ===');
    console.log('btn-finalizar-venda:', document.getElementById('btn-finalizar-venda'));
    console.log('btn-caderneta:', document.getElementById('btn-caderneta'));
    console.log('vendas objeto:', window.vendas);
    console.log('vendas.finalizarVenda:', window.vendas?.finalizarVenda);
    console.log('vendas.carrinho:', window.vendas?.carrinho);
    alert('Verifique o console (F12) para ver os resultados do teste!');
};
console.log('[FLOR DO LUAR] Função de teste disponível: testarBotoesVenda()');
