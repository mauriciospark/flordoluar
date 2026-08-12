<?php
/**
 * FLOR DO LUAR - API de Sincronização Scanner Remoto
 * Sistema de pareamento estilo Kahoot para scanner de código de barras
 * 
 * Endpoints:
 * - POST ?action=criar_sessao  → Cria nova sessão com PIN
 * - POST ?action=parear        → Valida PIN e retorna sessao_id
 * - POST ?action=enviar_codigo → Celular envia código de barras
 * - GET  ?action=verificar     → PDV verifica novos códigos (long-polling)
 * - POST ?action=confirmar     → PDV confirma recebimento do código
 * - POST ?action=encerrar      → Encerra sessão
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configurações
define('SESSOES_DIR', __DIR__ . '/sessoes/');
define('PIN_EXPIRACAO', 3600); // 1 hora em segundos
define('POLLING_TIMEOUT', 30); // 30 segundos de long-polling

// Cria diretório de sessões se não existir
if (!is_dir(SESSOES_DIR)) {
    mkdir(SESSOES_DIR, 0755, true);
}

// Limpa sessões antigas periodicamente (1 a cada 10 requisições)
if (rand(1, 10) === 1) {
    limparSessoesAntigas();
}

$action = $_GET['action'] ?? '';
$response = ['success' => false, 'message' => 'Ação inválida'];

switch ($action) {
    case 'criar_sessao':
        $response = criarSessao();
        break;
        
    case 'parear':
        $response = parearSessao();
        break;
        
    case 'enviar_codigo':
        $response = enviarCodigo();
        break;
        
    case 'verificar':
        $response = verificarCodigos();
        break;
        
    case 'confirmar':
        $response = confirmarRecebimento();
        break;
        
    case 'encerrar':
        $response = encerrarSessao();
        break;
        
    case 'status':
        $response = statusSessao();
        break;
}

echo json_encode($response, JSON_PRETTY_PRINT);

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Gera um PIN numérico único de 4 dígitos
 */
function gerarPIN() {
    do {
        $pin = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    } while (sessaoExiste($pin));
    return $pin;
}

/**
 * Verifica se já existe sessão ativa com esse PIN
 */
function sessaoExiste($pin) {
    $arquivo = SESSOES_DIR . "sessao_{$pin}.json";
    if (!file_exists($arquivo)) return false;
    
    $sessao = json_decode(file_get_contents($arquivo), true);
    return isset($sessao['ativo']) && $sessao['ativo'] === true;
}

/**
 * Retorna o caminho do arquivo de uma sessão
 */
function getArquivoSessao($pin) {
    return SESSOES_DIR . "sessao_{$pin}.json";
}

/**
 * Carrega dados de uma sessão
 */
function carregarSessao($pin) {
    $arquivo = getArquivoSessao($pin);
    if (!file_exists($arquivo)) return null;
    
    $conteudo = file_get_contents($arquivo);
    return json_decode($conteudo, true);
}

/**
 * Salva dados de uma sessão
 */
function salvarSessao($pin, $dados) {
    $arquivo = getArquivoSessao($pin);
    $dados['ultima_atualizacao'] = time();
    return file_put_contents($arquivo, json_encode($dados, JSON_PRETTY_PRINT));
}

/**
 * Limpa sessões antigas (mais de 1 hora sem atividade)
 */
function limparSessoesAntigas() {
    $arquivos = glob(SESSOES_DIR . 'sessao_*.json');
    $agora = time();
    
    foreach ($arquivos as $arquivo) {
        $conteudo = json_decode(file_get_contents($arquivo), true);
        $ultimaAtualizacao = $conteudo['ultima_atualizacao'] ?? 0;
        
        if ($agora - $ultimaAtualizacao > PIN_EXPIRACAO) {
            unlink($arquivo);
        }
    }
}

// ============================================
// ENDPOINTS
// ============================================

/**
 * POST ?action=criar_sessao
 * Cria uma nova sessão de pareamento
 */
function criarSessao() {
    $input = json_decode(file_get_contents('php://input'), true);
    $nomePDV = $input['nome_pdv'] ?? 'Caixa Principal';
    
    $pin = gerarPIN();
    
    $sessao = [
        'pin' => $pin,
        'nome_pdv' => $nomePDV,
        'ativo' => true,
        'criado_em' => time(),
        'ultima_atualizacao' => time(),
        'dispositivo' => null,
        'codigos' => [],
        'ultimo_codigo_id' => 0
    ];
    
    if (salvarSessao($pin, $sessao)) {
        return [
            'success' => true,
            'pin' => $pin,
            'message' => 'Sessão criada com sucesso',
            'expira_em' => PIN_EXPIRACAO
        ];
    }
    
    return ['success' => false, 'message' => 'Erro ao criar sessão'];
}

/**
 * POST ?action=parear
 * Valida PIN e retorna dados da sessão para o celular
 */
function parearSessao() {
    $input = json_decode(file_get_contents('php://input'), true);
    $pin = $input['pin'] ?? '';
    $nomeDispositivo = $input['dispositivo'] ?? 'Celular';
    
    if (empty($pin) || !preg_match('/^\d{4}$/', $pin)) {
        return ['success' => false, 'message' => 'PIN inválido. Digite 4 dígitos.'];
    }
    
    $sessao = carregarSessao($pin);
    
    if (!$sessao) {
        return ['success' => false, 'message' => 'Sessão não encontrada. Verifique o PIN.'];
    }
    
    if (!$sessao['ativo']) {
        return ['success' => false, 'message' => 'Sessão encerrada.'];
    }
    
    // Verifica se já tem dispositivo pareado
    if (!empty($sessao['dispositivo']) && $sessao['dispositivo'] !== $nomeDispositivo) {
        return ['success' => false, 'message' => 'Sessão já pareada com outro dispositivo.'];
    }
    
    // Atualiza sessão com dados do dispositivo
    $sessao['dispositivo'] = $nomeDispositivo;
    $sessao['pareado_em'] = time();
    salvarSessao($pin, $sessao);
    
    return [
        'success' => true,
        'message' => 'Pareamento realizado com sucesso!',
        'sessao' => [
            'pin' => $pin,
            'nome_pdv' => $sessao['nome_pdv'],
            'dispositivo' => $nomeDispositivo
        ]
    ];
}

/**
 * POST ?action=enviar_codigo
 * Celular envia código de barras escaneado
 */
function enviarCodigo() {
    $input = json_decode(file_get_contents('php://input'), true);
    $pin = $input['pin'] ?? '';
    $codigo = $input['codigo'] ?? '';
    $timestamp = $input['timestamp'] ?? time();
    
    if (empty($pin)) {
        return ['success' => false, 'message' => 'PIN não fornecido'];
    }
    
    if (empty($codigo)) {
        return ['success' => false, 'message' => 'Código de barras não fornecido'];
    }
    
    $sessao = carregarSessao($pin);
    
    if (!$sessao || !$sessao['ativo']) {
        return ['success' => false, 'message' => 'Sessão não encontrada ou encerrada'];
    }
    
    // Incrementa ID do código
    $sessao['ultimo_codigo_id']++;
    $codigoId = $sessao['ultimo_codigo_id'];
    
    // Adiciona código à sessão
    $novoCodigo = [
        'id' => $codigoId,
        'codigo' => $codigo,
        'timestamp' => $timestamp,
        'status' => 'pendente', // pendente, confirmado, erro
        'recebido_em' => time()
    ];
    
    $sessao['codigos'][] = $novoCodigo;
    
    // Mantém apenas os últimos 50 códigos para economizar espaço
    if (count($sessao['codigos']) > 50) {
        $sessao['codigos'] = array_slice($sessao['codigos'], -50);
    }
    
    salvarSessao($pin, $sessao);
    
    return [
        'success' => true,
        'message' => 'Código enviado com sucesso',
        'codigo_id' => $codigoId,
        'codigo' => $codigo
    ];
}

/**
 * GET ?action=verificar&pin=XXXX&ultimo_id=0
 * PDV verifica novos códigos (com long-polling)
 */
function verificarCodigos() {
    $pin = $_GET['pin'] ?? '';
    $ultimoId = intval($_GET['ultimo_id'] ?? 0);
    
    if (empty($pin)) {
        return ['success' => false, 'message' => 'PIN não fornecido'];
    }
    
    $sessao = carregarSessao($pin);
    
    if (!$sessao) {
        return ['success' => false, 'message' => 'Sessão não encontrada'];
    }
    
    if (!$sessao['ativo']) {
        return ['success' => false, 'message' => 'Sessão encerrada', 'sessao_encerrada' => true];
    }
    
    // Long-polling: aguarda novos códigos por até POLLING_TIMEOUT segundos
    $inicio = time();
    $codigosNovos = [];
    
    while (time() - $inicio < POLLING_TIMEOUT) {
        $sessao = carregarSessao($pin);
        
        // Busca códigos novos (ID maior que o último recebido)
        $codigosNovos = array_filter($sessao['codigos'], function($codigo) use ($ultimoId) {
            return $codigo['id'] > $ultimoId && $codigo['status'] === 'pendente';
        });
        
        if (!empty($codigosNovos)) {
            break;
        }
        
        // Aguarda 1 segundo antes de verificar novamente
        sleep(1);
    }
    
    // Retorna códigos novos (ou array vazio se timeout)
    return [
        'success' => true,
        'codigos' => array_values($codigosNovos),
        'ultimo_id' => $sessao['ultimo_codigo_id'],
        'sessao_ativa' => $sessao['ativo'],
        'dispositivo' => $sessao['dispositivo']
    ];
}

/**
 * POST ?action=confirmar
 * PDV confirma que processou o código
 */
function confirmarRecebimento() {
    $input = json_decode(file_get_contents('php://input'), true);
    $pin = $input['pin'] ?? '';
    $codigoId = intval($input['codigo_id'] ?? 0);
    $status = $input['status'] ?? 'confirmado'; // confirmado ou erro
    $mensagem = $input['mensagem'] ?? '';
    
    if (empty($pin) || $codigoId === 0) {
        return ['success' => false, 'message' => 'Dados incompletos'];
    }
    
    $sessao = carregarSessao($pin);
    
    if (!$sessao) {
        return ['success' => false, 'message' => 'Sessão não encontrada'];
    }
    
    // Atualiza status do código
    foreach ($sessao['codigos'] as &$codigo) {
        if ($codigo['id'] === $codigoId) {
            $codigo['status'] = $status;
            $codigo['mensagem'] = $mensagem;
            $codigo['confirmado_em'] = time();
            break;
        }
    }
    
    salvarSessao($pin, $sessao);
    
    return [
        'success' => true,
        'message' => 'Confirmação registrada',
        'codigo_id' => $codigoId,
        'status' => $status
    ];
}

/**
 * POST ?action=encerrar
 * Encerra uma sessão ativa
 */
function encerrarSessao() {
    $input = json_decode(file_get_contents('php://input'), true);
    $pin = $input['pin'] ?? '';
    
    if (empty($pin)) {
        return ['success' => false, 'message' => 'PIN não fornecido'];
    }
    
    $sessao = carregarSessao($pin);
    
    if (!$sessao) {
        return ['success' => false, 'message' => 'Sessão não encontrada'];
    }
    
    $sessao['ativo'] = false;
    $sessao['encerrado_em'] = time();
    salvarSessao($pin, $sessao);
    
    return [
        'success' => true,
        'message' => 'Sessão encerrada com sucesso'
    ];
}

/**
 * GET ?action=status&pin=XXXX
 * Retorna status atual da sessão
 */
function statusSessao() {
    $pin = $_GET['pin'] ?? '';
    
    if (empty($pin)) {
        return ['success' => false, 'message' => 'PIN não fornecido'];
    }
    
    $sessao = carregarSessao($pin);
    
    if (!$sessao) {
        return ['success' => false, 'message' => 'Sessão não encontrada'];
    }
    
    return [
        'success' => true,
        'sessao' => [
            'pin' => $pin,
            'ativo' => $sessao['ativo'],
            'nome_pdv' => $sessao['nome_pdv'],
            'dispositivo' => $sessao['dispositivo'],
            'pareado' => !empty($sessao['dispositivo']),
            'total_codigos' => count($sessao['codigos']),
            'ultimo_codigo_id' => $sessao['ultimo_codigo_id']
        ]
    ];
}
