export type Language = 'es' | 'en' | 'pt-BR';

export const LANGUAGE_CONFIG: Record<Language, { label: string; flag: string }> = {
  es: { label: 'Español', flag: '🇪🇸' },
  en: { label: 'English', flag: '🇺🇸' },
  'pt-BR': { label: 'Português', flag: '🇧🇷' },
};

export const translations = {
  es: {
    // Header
    'header.title': 'TicketFlow',
    'header.newTicket': 'Nuevo Ticket',
    'header.tracking': 'Seguimiento',
    
    // Form
    'form.title': 'Nuevo Ticket',
    'form.subtitle': 'Describe tu necesidad y nuestro sistema la clasificará automáticamente',
    'form.need.label': '¿Cuál es tu necesidad?',
    'form.need.placeholder': 'Describe qué necesitas de manera clara y detallada...',
    'form.need.hint': 'Sé específico sobre el problema o funcionalidad que requieres',
    'form.desiredFlow.label': '¿Cuál es el flujo deseado?',
    'form.desiredFlow.placeholder': 'Describe paso a paso cómo debería funcionar...',
    'form.desiredFlow.hint': 'Enumera los pasos del proceso ideal que esperas',
    'form.context.label': 'Danos un poco de contexto',
    'form.context.placeholder': '¿Por qué es importante? ¿Quiénes se ven afectados? ¿Hay urgencia?',
    'form.context.hint': 'Incluye impacto en el negocio, usuarios afectados o dependencias',
    'form.desiredDate.label': 'Tiempo deseado de entrega',
    'form.desiredDate.placeholder': 'Selecciona una fecha',
    'form.desiredDate.hint': 'Solo se permiten fechas a partir de mañana',
    'form.desiredDate.error': 'No se permiten fechas pasadas ni la fecha de hoy. Selecciona una fecha futura.',
    'form.submit': 'Enviar Ticket',
    'form.submitting': 'Procesando ticket...',
    'form.attachments': 'Adjuntos',
    'form.attachments.hint': 'Agrega fotos, videos o enlaces para dar más contexto',
    'form.addPhoto': 'Agregar foto',
    'form.addVideo': 'Agregar video',
    'form.addLink': 'Agregar enlace',
    'form.linkUrl': 'URL del enlace',
    'form.linkDescription': 'Descripción (opcional)',
    
    // Validation
    'validation.need.min': 'Describe tu necesidad en al menos 20 caracteres',
    'validation.desiredFlow.min': 'Describe el flujo deseado en al menos 15 caracteres',
    'validation.context.min': 'Proporciona contexto en al menos 10 caracteres',
    'validation.date.required': 'Selecciona una fecha',
    
    // Helper
    'helper.title': '¿Cómo clasificamos tu ticket?',
    'helper.hotfix.title': 'Hot Fix',
    'helper.hotfix.desc': 'Situaciones en la plataforma o Back Office que afectan directamente la operación o el uso de CX/plataforma. Se resolverá dentro del día como máximo.',
    'helper.bug.title': 'Bugs',
    'helper.bug.desc': 'Situación o condición de la plataforma o Back Office que afecta el flujo de trabajo correcto y la experiencia de los usuarios. Se resolverá de un día para otro.',
    'helper.feature.title': 'Features',
    'helper.feature.desc': 'Nuevos flujos, funcionalidades o mejoras que mejoran la experiencia y la operación.',
    
    // Table
    'table.title': 'Tabla de Seguimiento',
    'table.subtitle': 'Gestiona y da seguimiento a todos los tickets',
    'table.newTicket': 'Nuevo Ticket',
    
    // Stats
    'stats.total': 'Total',
    'stats.hotfixes': 'Hot Fixes',
    'stats.bugs': 'Bugs',
    'stats.features': 'Features',
    'stats.errors': 'Errores',
    
    // Actions
    'action.edit': 'Editar y Re-enviar',
    'action.linkCard': 'Vincular Card Manual',
    'action.close': 'Cerrar Caso',
    'action.moveToProgress': 'Mover a En Progreso',
    'action.moveToReview': 'Mover a Revisión',
    'action.moveToProduction': 'Mover a Producción',
    'action.viewBasecamp': 'Ver en Basecamp',
    
    // Status
    'status.today': 'Hoy',
    'status.thisWeek': 'Esta semana',
    'status.backlog': 'Por definir',
    'status.inProgress': 'En progreso',
    'status.review': 'En revisión',
    'status.production': 'Producción',
    'status.closed': 'Cerrado',
    
    // Types
    'type.userStory': 'Historia de Usuario',
    'type.bugReport': 'Bug Report',
    'type.hotFix': 'Hot Fix',
    'type.error': 'Error',
    
    // Classification Result
    'result.analyzing': 'Analizando tu ticket...',
    'result.classified': 'Ticket Clasificado',
    'result.nomenclature': 'Nomenclatura',
    'result.agent': 'Agente',
    'result.userStoryWriter': 'User Story Writer',
    'result.problemSolver': 'Problem Solver',
    'result.noAgent': 'Sin agente asignado',
    'result.continue': 'Continuar',
    'result.editAndResend': 'Editar y Re-enviar',
  },
  en: {
    // Header
    'header.title': 'TicketFlow',
    'header.newTicket': 'New Ticket',
    'header.tracking': 'Tracking',
    
    // Form
    'form.title': 'New Ticket',
    'form.subtitle': 'Describe your need and our system will classify it automatically',
    'form.need.label': 'What is your need?',
    'form.need.placeholder': 'Describe what you need clearly and in detail...',
    'form.need.hint': 'Be specific about the problem or functionality you require',
    'form.desiredFlow.label': 'What is the desired flow?',
    'form.desiredFlow.placeholder': 'Describe step by step how it should work...',
    'form.desiredFlow.hint': 'List the steps of the ideal process you expect',
    'form.context.label': 'Give us some context',
    'form.context.placeholder': 'Why is it important? Who is affected? Is there urgency?',
    'form.context.hint': 'Include business impact, affected users or dependencies',
    'form.desiredDate.label': 'Desired delivery time',
    'form.desiredDate.placeholder': 'Select a date',
    'form.desiredDate.hint': 'Only dates from tomorrow onwards are allowed',
    'form.desiredDate.error': 'Past dates or today are not allowed. Select a future date.',
    'form.submit': 'Submit Ticket',
    'form.submitting': 'Processing ticket...',
    'form.attachments': 'Attachments',
    'form.attachments.hint': 'Add photos, videos or links for more context',
    'form.addPhoto': 'Add photo',
    'form.addVideo': 'Add video',
    'form.addLink': 'Add link',
    'form.linkUrl': 'Link URL',
    'form.linkDescription': 'Description (optional)',
    
    // Validation
    'validation.need.min': 'Describe your need in at least 20 characters',
    'validation.desiredFlow.min': 'Describe the desired flow in at least 15 characters',
    'validation.context.min': 'Provide context in at least 10 characters',
    'validation.date.required': 'Select a date',
    
    // Helper
    'helper.title': 'How do we classify your ticket?',
    'helper.hotfix.title': 'Hot Fix',
    'helper.hotfix.desc': 'Situations on the platform or Back Office that directly affect operation or CX/platform usage. Will be solved within the day maximum.',
    'helper.bug.title': 'Bugs',
    'helper.bug.desc': 'Situation or condition of the platform or Back Office that affects the correct workflow and user experience. Will be solved from one day to another.',
    'helper.feature.title': 'Features',
    'helper.feature.desc': 'New flows, features or enhancements that improve the experience and operation.',
    
    // Table
    'table.title': 'Tracking Table',
    'table.subtitle': 'Manage and track all tickets',
    'table.newTicket': 'New Ticket',
    
    // Stats
    'stats.total': 'Total',
    'stats.hotfixes': 'Hot Fixes',
    'stats.bugs': 'Bugs',
    'stats.features': 'Features',
    'stats.errors': 'Errors',
    
    // Actions
    'action.edit': 'Edit and Re-submit',
    'action.linkCard': 'Link Manual Card',
    'action.close': 'Close Case',
    'action.moveToProgress': 'Move to In Progress',
    'action.moveToReview': 'Move to Review',
    'action.moveToProduction': 'Move to Production',
    'action.viewBasecamp': 'View in Basecamp',
    
    // Status
    'status.today': 'Today',
    'status.thisWeek': 'This Week',
    'status.backlog': 'Backlog',
    'status.inProgress': 'In Progress',
    'status.review': 'Review',
    'status.production': 'Production',
    'status.closed': 'Closed',
    
    // Types
    'type.userStory': 'User Story',
    'type.bugReport': 'Bug Report',
    'type.hotFix': 'Hot Fix',
    'type.error': 'Error',
    
    // Classification Result
    'result.analyzing': 'Analyzing your ticket...',
    'result.classified': 'Ticket Classified',
    'result.nomenclature': 'Nomenclature',
    'result.agent': 'Agent',
    'result.userStoryWriter': 'User Story Writer',
    'result.problemSolver': 'Problem Solver',
    'result.noAgent': 'No agent assigned',
    'result.continue': 'Continue',
    'result.editAndResend': 'Edit and Re-submit',
  },
  'pt-BR': {
    // Header
    'header.title': 'TicketFlow',
    'header.newTicket': 'Novo Ticket',
    'header.tracking': 'Acompanhamento',
    
    // Form
    'form.title': 'Novo Ticket',
    'form.subtitle': 'Descreva sua necessidade e nosso sistema irá classificá-la automaticamente',
    'form.need.label': 'Qual é a sua necessidade?',
    'form.need.placeholder': 'Descreva o que você precisa de forma clara e detalhada...',
    'form.need.hint': 'Seja específico sobre o problema ou funcionalidade que você requer',
    'form.desiredFlow.label': 'Qual é o fluxo desejado?',
    'form.desiredFlow.placeholder': 'Descreva passo a passo como deveria funcionar...',
    'form.desiredFlow.hint': 'Liste os passos do processo ideal que você espera',
    'form.context.label': 'Nos dê um pouco de contexto',
    'form.context.placeholder': 'Por que é importante? Quem é afetado? Há urgência?',
    'form.context.hint': 'Inclua impacto no negócio, usuários afetados ou dependências',
    'form.desiredDate.label': 'Tempo de entrega desejado',
    'form.desiredDate.placeholder': 'Selecione uma data',
    'form.desiredDate.hint': 'Apenas datas a partir de amanhã são permitidas',
    'form.desiredDate.error': 'Datas passadas ou hoje não são permitidas. Selecione uma data futura.',
    'form.submit': 'Enviar Ticket',
    'form.submitting': 'Processando ticket...',
    'form.attachments': 'Anexos',
    'form.attachments.hint': 'Adicione fotos, vídeos ou links para mais contexto',
    'form.addPhoto': 'Adicionar foto',
    'form.addVideo': 'Adicionar vídeo',
    'form.addLink': 'Adicionar link',
    'form.linkUrl': 'URL do link',
    'form.linkDescription': 'Descrição (opcional)',
    
    // Validation
    'validation.need.min': 'Descreva sua necessidade em pelo menos 20 caracteres',
    'validation.desiredFlow.min': 'Descreva o fluxo desejado em pelo menos 15 caracteres',
    'validation.context.min': 'Forneça contexto em pelo menos 10 caracteres',
    'validation.date.required': 'Selecione uma data',
    
    // Helper
    'helper.title': 'Como classificamos seu ticket?',
    'helper.hotfix.title': 'Hot Fix',
    'helper.hotfix.desc': 'Situações na plataforma ou Back Office que afetam diretamente a operação ou uso da CX/plataforma. Será resolvido dentro do dia no máximo.',
    'helper.bug.title': 'Bugs',
    'helper.bug.desc': 'Situação ou condição da plataforma ou Back Office que afeta o fluxo de trabalho correto e a experiência do usuário. Será resolvido de um dia para o outro.',
    'helper.feature.title': 'Features',
    'helper.feature.desc': 'Novos fluxos, funcionalidades ou melhorias que melhoram a experiência e a operação.',
    
    // Table
    'table.title': 'Tabela de Acompanhamento',
    'table.subtitle': 'Gerencie e acompanhe todos os tickets',
    'table.newTicket': 'Novo Ticket',
    
    // Stats
    'stats.total': 'Total',
    'stats.hotfixes': 'Hot Fixes',
    'stats.bugs': 'Bugs',
    'stats.features': 'Features',
    'stats.errors': 'Erros',
    
    // Actions
    'action.edit': 'Editar e Reenviar',
    'action.linkCard': 'Vincular Card Manual',
    'action.close': 'Fechar Caso',
    'action.moveToProgress': 'Mover para Em Progresso',
    'action.moveToReview': 'Mover para Revisão',
    'action.moveToProduction': 'Mover para Produção',
    'action.viewBasecamp': 'Ver no Basecamp',
    
    // Status
    'status.today': 'Hoje',
    'status.thisWeek': 'Esta Semana',
    'status.backlog': 'Backlog',
    'status.inProgress': 'Em Progresso',
    'status.review': 'Em Revisão',
    'status.production': 'Produção',
    'status.closed': 'Fechado',
    
    // Types
    'type.userStory': 'História de Usuário',
    'type.bugReport': 'Bug Report',
    'type.hotFix': 'Hot Fix',
    'type.error': 'Erro',
    
    // Classification Result
    'result.analyzing': 'Analisando seu ticket...',
    'result.classified': 'Ticket Classificado',
    'result.nomenclature': 'Nomenclatura',
    'result.agent': 'Agente',
    'result.userStoryWriter': 'User Story Writer',
    'result.problemSolver': 'Problem Solver',
    'result.noAgent': 'Sem agente atribuído',
    'result.continue': 'Continuar',
    'result.editAndResend': 'Editar e Reenviar',
  },
} as const;

export type TranslationKey = keyof typeof translations.es;
