import { TicketFormData, ClassificationResult, TicketType, MODULES, UrgencyLevel } from '@/types/ticket';

// Simulated LLM classification logic
// In production, this would call FastAPI backend with actual LLM

const ERROR_KEYWORDS = [
  'no funciona', 'error', 'falla', 'bug', 'problema', 'crash',
  'roto', 'no carga', 'no aparece', 'lento', 'timeout',
  'not working', 'broken', 'fails', 'slow', 'down'
];

const CRITICAL_KEYWORDS = [
  'urgente', 'crítico', 'producción caída', 'no pueden', 'bloquea',
  'clientes afectados', 'operación parada', 'emergencia', 'hotfix',
  'urgent', 'critical', 'production down', 'blocked', 'emergency'
];

const FEATURE_KEYWORDS = [
  'nuevo', 'agregar', 'implementar', 'crear', 'añadir', 'funcionalidad',
  'feature', 'mejora', 'optimizar', 'desarrollo', 'integración',
  'new', 'add', 'implement', 'create', 'enhancement', 'improve',
  'quiero', 'necesito que', 'sería bueno', 'would be nice', 'want to'
];

function countKeywordMatches(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => lowerText.includes(keyword)).length;
}

function detectModule(text: string): string {
  const lowerText = text.toLowerCase();
  
  const modulePatterns: Record<string, string[]> = {
    'Auth': ['login', 'autenticación', 'sesión', 'password', 'registro', 'authentication', 'session'],
    'Payments': ['pago', 'factura', 'cobro', 'stripe', 'transacción', 'payment', 'invoice', 'transaction'],
    'Users': ['usuario', 'perfil', 'cuenta', 'roles', 'permisos', 'user', 'profile', 'account'],
    'Reports': ['reporte', 'informe', 'estadística', 'dashboard', 'métricas', 'report', 'statistics', 'metrics'],
    'API': ['api', 'endpoint', 'integración', 'webhook', 'integration'],
    'UI': ['interfaz', 'botón', 'pantalla', 'diseño', 'visual', 'interface', 'button', 'screen', 'design'],
    'Core': ['core', 'sistema', 'base', 'principal', 'system', 'main'],
    'Integration': ['salesforce', 'basecamp', 'crm', 'erp'],
  };

  for (const [module, patterns] of Object.entries(modulePatterns)) {
    if (patterns.some(p => lowerText.includes(p))) {
      return module;
    }
  }
  
  return MODULES[Math.floor(Math.random() * MODULES.length)];
}

function getCombinedText(data: TicketFormData): string {
  // New form fields
  if (data.whatIsHappening) {
    return `${data.whatIsHappening} ${data.expectedFlow || ''} ${data.additionalContext || ''}`;
  }
  // Legacy form fields
  return `${data.need || ''} ${data.desiredFlow || ''} ${data.context || ''}`;
}

function getDescription(data: TicketFormData): string {
  return data.whatIsHappening || data.need || '';
}

function isInformationSufficient(data: TicketFormData): boolean {
  // New form structure
  if (data.whatIsHappening !== undefined) {
    const happeningLength = (data.whatIsHappening || '').trim().length;
    const expectedLength = (data.expectedFlow || '').trim().length;
    
    if (happeningLength < 10 || expectedLength < 10) {
      return false;
    }
    
    // Check if it's just filler text
    const fillerPatterns = ['asdf', 'test', '...', 'xxx', 'aaa', '123'];
    const combinedText = getCombinedText(data).toLowerCase();
    if (fillerPatterns.some(p => combinedText.includes(p))) {
      return false;
    }
    
    return true;
  }
  
  // Legacy form structure
  const needLength = (data.need || '').trim().length;
  const flowLength = (data.desiredFlow || '').trim().length;
  const contextLength = (data.context || '').trim().length;
  
  if (needLength < 20 || flowLength < 15 || contextLength < 10) {
    return false;
  }
  
  const fillerPatterns = ['asdf', 'test', '...', 'xxx', 'aaa'];
  const combinedText = getCombinedText(data).toLowerCase();
  if (fillerPatterns.some(p => combinedText.includes(p))) {
    return false;
  }
  
  return true;
}

function classifyByUrgency(urgency: UrgencyLevel): TicketType | null {
  // If user explicitly marks as blocking, lean towards hot_fix
  if (urgency === 'blocks') {
    return 'hot_fix';
  }
  return null;
}

export function classifyTicket(data: TicketFormData): ClassificationResult {
  const combinedText = getCombinedText(data);
  
  // Check if information is sufficient
  if (!isInformationSufficient(data)) {
    return {
      type: 'error',
      confidence: 0.95,
      reasoning: 'La información proporcionada no es suficiente para clasificar el ticket. Por favor, proporciona más detalles.',
      agent: 'skip',
    };
  }
  
  // Use urgency field from new form if available
  if (data.urgency) {
    const urgencyType = classifyByUrgency(data.urgency);
    
    // If user says it blocks, prioritize as hot_fix
    if (urgencyType === 'hot_fix') {
      return {
        type: 'hot_fix',
        confidence: 0.90,
        reasoning: 'El usuario indica que este problema bloquea la operación. Se requiere atención inmediata.',
        agent: 'skip',
      };
    }
  }
  
  const errorMatches = countKeywordMatches(combinedText, ERROR_KEYWORDS);
  const criticalMatches = countKeywordMatches(combinedText, CRITICAL_KEYWORDS);
  const featureMatches = countKeywordMatches(combinedText, FEATURE_KEYWORDS);
  
  // Hot Fix: Critical bug affecting operations (also consider urgency)
  if (criticalMatches >= 2 || (errorMatches >= 1 && criticalMatches >= 1)) {
    return {
      type: 'hot_fix',
      confidence: 0.85 + Math.min(criticalMatches * 0.05, 0.15),
      reasoning: 'Se detectó un problema crítico que afecta la operación. Se requiere atención inmediata.',
      agent: 'skip',
    };
  }
  
  // Bug Report: Error affecting functionality
  // Also consider if user says it "affects" their work
  if (errorMatches >= 2 || (errorMatches >= 1 && data.urgency === 'affects')) {
    return {
      type: 'bug_report',
      confidence: 0.80 + Math.min(errorMatches * 0.05, 0.15),
      reasoning: 'Se identificó un error en el funcionamiento de la plataforma que requiere corrección.',
      agent: 'problem_solver',
    };
  }
  
  // Fixed Scope: New feature or enhancement
  // Also if not urgent and affecting nobody critically
  if (featureMatches >= 1 || (errorMatches === 0 && criticalMatches === 0) || data.urgency === 'not_urgent') {
    return {
      type: 'fixed_scope',
      confidence: 0.75 + Math.min(featureMatches * 0.05, 0.20),
      reasoning: 'El requerimiento describe una nueva funcionalidad o mejora a implementar.',
      agent: 'user_story_writer',
    };
  }
  
  // Unclear - mark as error
  return {
    type: 'error',
    confidence: 0.60,
    reasoning: 'No se pudo determinar claramente el tipo de requerimiento. Por favor, revisa y clarifica la información.',
    agent: 'skip',
  };
}

export function generateNomenclature(
  type: TicketType,
  module: string,
  description: string,
  sequence: number
): string {
  const prefix = type === 'fixed_scope' ? 'HU' : 'BUG';
  const seqStr = String(sequence).padStart(3, '0');
  const shortDesc = description
    .split(' ')
    .slice(0, 3)
    .join('-')
    .substring(0, 20)
    .replace(/[^a-zA-Z0-9-]/g, '');
    
  return `${prefix}-${seqStr}-${module}-${shortDesc}`;
}

export function determineInitialStatus(type: TicketType): 'today' | 'this_week' | 'backlog' {
  switch (type) {
    case 'hot_fix':
      return 'today';
    case 'bug_report':
      return 'this_week';
    case 'fixed_scope':
      return 'backlog';
    default:
      return 'backlog';
  }
}

export { detectModule, getCombinedText, getDescription };
