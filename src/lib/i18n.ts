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
    'header.approvals': 'Aprobaciones',
    
    // Form - New friendly questions
    'form.title': 'Nuevo Ticket',
    'form.subtitle': 'Cuéntanos qué necesitas y te ayudaremos a resolverlo',
    'form.optional': 'Opcional',
    
    // Question 1: What's happening
    'form.whatIsHappening.label': '¿Qué está pasando o qué quieres cambiar?',
    'form.whatIsHappening.hint': 'Describe el problema, error o mejora que detectaste',
    'form.whatIsHappening.placeholder': 'Por ejemplo: "El botón de pago no funciona cuando intento completar una compra" o "Necesito que el reporte incluya la fecha de última compra"...',
    
    // Question 2: Expected flow
    'form.expectedFlow.label': '¿Cuál es el flujo esperado o qué debería pasar normalmente?',
    'form.expectedFlow.hint': 'Esto nos ayuda a entender la diferencia entre el comportamiento actual y el esperado',
    'form.expectedFlow.placeholder': 'Por ejemplo: "Debería mostrar una confirmación después de hacer clic en pagar y redirigir al resumen de la orden"...',
    
    // Question 3: Where
    'form.whereOccurs.label': '¿Dónde ocurre?',
    'form.whereOccurs.otherPlaceholder': 'Especifica dónde ocurre...',
    'form.location.app': 'App móvil',
    'form.location.salesforce': 'Salesforce',
    'form.location.web': 'Plataforma web',
    'form.location.internalProcess': 'Proceso interno',
    'form.location.other': 'Otro',
    
    // Question 4: Who's affected
    'form.affectedParty.label': '¿A quién está afectando?',
    'form.affected.customers': 'Clientes',
    'form.affected.internal': 'Equipo interno',
    'form.affected.both': 'Ambos',
    
    // Question 5: Urgency
    'form.urgency.label': '¿Qué tan urgente es para la operación?',
    'form.urgency.blocks': '🚨 Bloquea',
    'form.urgency.blocksDesc': 'No podemos operar hasta que se resuelva',
    'form.urgency.affects': '⚠️ Afecta',
    'form.urgency.affectsDesc': 'Podemos trabajar pero con dificultades',
    'form.urgency.notUrgent': '📋 No urgente',
    'form.urgency.notUrgentDesc': 'Es una mejora o puede esperar',
    
    // Question 6: Additional context
    'form.additionalContext.label': 'Danos un poco más de contexto',
    'form.additionalContext.hint': 'Pasos para replicar, ejemplos, links, screenshots, usuario afectado, etc.',
    'form.additionalContext.placeholder': 'Cualquier información adicional que nos ayude a entender mejor...',
    
    'form.submit': 'Enviar Ticket',
    'form.submitting': 'Procesando ticket...',
    'form.attachments': 'Adjuntos',
    'form.attachments.hint': 'Agrega fotos, videos o enlaces para dar más contexto',
    'form.addPhoto': 'Agregar foto',
    'form.addVideo': 'Agregar video',
    'form.addLink': 'Agregar enlace',
    'form.linkUrl': 'URL del enlace',
    'form.linkDescription': 'Descripción (opcional)',
    
    // Legacy form fields (for backward compatibility)
    'form.need': '¿Cuál es tu necesidad?',
    'form.need.label': '¿Cuál es tu necesidad?',
    'form.need.placeholder': 'Describe qué necesitas de manera clara y detallada...',
    'form.need.hint': 'Sé específico sobre el problema o funcionalidad que requieres',
    'form.desiredFlow': '¿Cuál es el flujo deseado?',
    'form.desiredFlow.label': '¿Cuál es el flujo deseado?',
    'form.desiredFlow.placeholder': 'Describe paso a paso cómo debería funcionar...',
    'form.desiredFlow.hint': 'Enumera los pasos del proceso ideal que esperas',
    'form.context': 'Contexto',
    'form.context.label': 'Danos un poco de contexto',
    'form.context.placeholder': '¿Por qué es importante? ¿Quiénes se ven afectados? ¿Hay urgencia?',
    'form.context.hint': 'Incluye impacto en el negocio, usuarios afectados o dependencias',
    'form.desiredDate.label': 'Tiempo deseado de entrega',
    'form.desiredDate.placeholder': 'Selecciona una fecha',
    'form.desiredDate.hint': 'Solo se permiten fechas a partir de mañana',
    'form.desiredDate.error': 'No se permiten fechas pasadas ni la fecha de hoy. Selecciona una fecha futura.',
    
    // Validation
    'validation.whatIsHappening.min': 'Describe qué está pasando en al menos 10 caracteres',
    'validation.expectedFlow.min': 'Describe el flujo esperado en al menos 10 caracteres',
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
    'stats.drafts': 'Borradores',
    
    // Actions
    'action.edit': 'Editar y Re-enviar',
    'action.linkCard': 'Vincular Card Manual',
    'action.close': 'Cerrar Caso',
    'action.moveToProgress': 'Mover a En Progreso',
    'action.moveToReview': 'Mover a Revisión',
    'action.moveToProduction': 'Mover a Producción',
    'action.viewBasecamp': 'Ver en Basecamp',
    'action.cancel': 'Cancelar',
    'action.delete': 'Eliminar',
    
    // Status
    'status.today': 'Hoy',
    'status.thisWeek': 'Esta semana',
    'status.backlog': 'Por definir',
    'status.inProgress': 'En progreso',
    'status.review': 'En revisión',
    'status.production': 'Producción',
    'status.closed': 'Cerrado',
    'status.draft': 'Borrador',
    'status.failedReport': 'Reporte Fallido',
    
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
    
    // Ticket
    'ticket.module': 'Módulo',
    
    // Approval Board
    'approvalBoard.title': 'Tablero de Aprobación',
    'approvalBoard.subtitle': 'Revisa y aprueba los borradores de tickets antes de enviarlos a Basecamp',
    'approvalBoard.empty': 'No hay borradores pendientes',
    'approvalBoard.emptyDescription': 'Los tickets clasificados aparecerán aquí para su aprobación antes de ser enviados a Basecamp.',
    'approvalBoard.pending': 'pendientes',
    'approvalBoard.approve': 'Aprobar',
    'approvalBoard.reject': 'Rechazar',
    'approvalBoard.confirmApprove': '¿Aprobar y enviar a Basecamp?',
    'approvalBoard.confirmReject': '¿Rechazar este ticket?',
    'approvalBoard.confirmDelete': '¿Eliminar este borrador?',
    'approvalBoard.approveDescription': 'Este ticket será enviado a Basecamp y pasará a la tabla de seguimiento.',
    'approvalBoard.rejectDescription': 'Este ticket será marcado como Reporte Fallido y no se enviará a Basecamp.',
    'approvalBoard.deleteDescription': 'Este borrador será eliminado permanentemente.',
    'approvalBoard.sendToBasecamp': 'Enviar a Basecamp',
    'approvalBoard.markAsFailed': 'Marcar como Fallido',
  },
  en: {
    // Header
    'header.title': 'TicketFlow',
    'header.newTicket': 'New Ticket',
    'header.tracking': 'Tracking',
    'header.approvals': 'Approvals',
    
    // Form - New friendly questions
    'form.title': 'New Ticket',
    'form.subtitle': 'Tell us what you need and we\'ll help you solve it',
    'form.optional': 'Optional',
    
    // Question 1: What's happening
    'form.whatIsHappening.label': 'What\'s happening or what do you want to change?',
    'form.whatIsHappening.hint': 'Describe the problem, error, or improvement you detected',
    'form.whatIsHappening.placeholder': 'For example: "The payment button doesn\'t work when I try to complete a purchase" or "I need the report to include the last purchase date"...',
    
    // Question 2: Expected flow
    'form.expectedFlow.label': 'What\'s the expected flow or what should normally happen?',
    'form.expectedFlow.hint': 'This helps us understand the difference between current and expected behavior',
    'form.expectedFlow.placeholder': 'For example: "It should show a confirmation after clicking pay and redirect to the order summary"...',
    
    // Question 3: Where
    'form.whereOccurs.label': 'Where does it occur?',
    'form.whereOccurs.otherPlaceholder': 'Specify where it occurs...',
    'form.location.app': 'Mobile app',
    'form.location.salesforce': 'Salesforce',
    'form.location.web': 'Web platform',
    'form.location.internalProcess': 'Internal process',
    'form.location.other': 'Other',
    
    // Question 4: Who's affected
    'form.affectedParty.label': 'Who is being affected?',
    'form.affected.customers': 'Customers',
    'form.affected.internal': 'Internal team',
    'form.affected.both': 'Both',
    
    // Question 5: Urgency
    'form.urgency.label': 'How urgent is it for operations?',
    'form.urgency.blocks': '🚨 Blocks',
    'form.urgency.blocksDesc': 'We can\'t operate until it\'s resolved',
    'form.urgency.affects': '⚠️ Affects',
    'form.urgency.affectsDesc': 'We can work but with difficulties',
    'form.urgency.notUrgent': '📋 Not urgent',
    'form.urgency.notUrgentDesc': 'It\'s an improvement or can wait',
    
    // Question 6: Additional context
    'form.additionalContext.label': 'Give us a bit more context',
    'form.additionalContext.hint': 'Steps to replicate, examples, links, screenshots, affected user, etc.',
    'form.additionalContext.placeholder': 'Any additional information that helps us understand better...',
    
    'form.submit': 'Submit Ticket',
    'form.submitting': 'Processing ticket...',
    'form.attachments': 'Attachments',
    'form.attachments.hint': 'Add photos, videos or links for more context',
    'form.addPhoto': 'Add photo',
    'form.addVideo': 'Add video',
    'form.addLink': 'Add link',
    'form.linkUrl': 'Link URL',
    'form.linkDescription': 'Description (optional)',
    
    // Legacy form fields
    'form.need': 'What is your need?',
    'form.need.label': 'What is your need?',
    'form.need.placeholder': 'Describe what you need clearly and in detail...',
    'form.need.hint': 'Be specific about the problem or functionality you require',
    'form.desiredFlow': 'What is the desired flow?',
    'form.desiredFlow.label': 'What is the desired flow?',
    'form.desiredFlow.placeholder': 'Describe step by step how it should work...',
    'form.desiredFlow.hint': 'List the steps of the ideal process you expect',
    'form.context': 'Context',
    'form.context.label': 'Give us some context',
    'form.context.placeholder': 'Why is it important? Who is affected? Is there urgency?',
    'form.context.hint': 'Include business impact, affected users or dependencies',
    'form.desiredDate.label': 'Desired delivery time',
    'form.desiredDate.placeholder': 'Select a date',
    'form.desiredDate.hint': 'Only dates from tomorrow onwards are allowed',
    'form.desiredDate.error': 'Past dates or today are not allowed. Select a future date.',
    
    // Validation
    'validation.whatIsHappening.min': 'Describe what\'s happening in at least 10 characters',
    'validation.expectedFlow.min': 'Describe the expected flow in at least 10 characters',
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
    'stats.drafts': 'Drafts',
    
    // Actions
    'action.edit': 'Edit and Re-submit',
    'action.linkCard': 'Link Manual Card',
    'action.close': 'Close Case',
    'action.moveToProgress': 'Move to In Progress',
    'action.moveToReview': 'Move to Review',
    'action.moveToProduction': 'Move to Production',
    'action.viewBasecamp': 'View in Basecamp',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    
    // Status
    'status.today': 'Today',
    'status.thisWeek': 'This Week',
    'status.backlog': 'Backlog',
    'status.inProgress': 'In Progress',
    'status.review': 'Review',
    'status.production': 'Production',
    'status.closed': 'Closed',
    'status.draft': 'Draft',
    'status.failedReport': 'Failed Report',
    
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
    
    // Ticket
    'ticket.module': 'Module',
    
    // Approval Board
    'approvalBoard.title': 'Approval Board',
    'approvalBoard.subtitle': 'Review and approve ticket drafts before sending to Basecamp',
    'approvalBoard.empty': 'No pending drafts',
    'approvalBoard.emptyDescription': 'Classified tickets will appear here for approval before being sent to Basecamp.',
    'approvalBoard.pending': 'pending',
    'approvalBoard.approve': 'Approve',
    'approvalBoard.reject': 'Reject',
    'approvalBoard.confirmApprove': 'Approve and send to Basecamp?',
    'approvalBoard.confirmReject': 'Reject this ticket?',
    'approvalBoard.confirmDelete': 'Delete this draft?',
    'approvalBoard.approveDescription': 'This ticket will be sent to Basecamp and moved to the tracking table.',
    'approvalBoard.rejectDescription': 'This ticket will be marked as Failed Report and will not be sent to Basecamp.',
    'approvalBoard.deleteDescription': 'This draft will be permanently deleted.',
    'approvalBoard.sendToBasecamp': 'Send to Basecamp',
    'approvalBoard.markAsFailed': 'Mark as Failed',
  },
  'pt-BR': {
    // Header
    'header.title': 'TicketFlow',
    'header.newTicket': 'Novo Ticket',
    'header.tracking': 'Acompanhamento',
    'header.approvals': 'Aprovações',
    
    // Form - New friendly questions
    'form.title': 'Novo Ticket',
    'form.subtitle': 'Conte-nos o que você precisa e vamos ajudá-lo a resolver',
    'form.optional': 'Opcional',
    
    // Question 1: What's happening
    'form.whatIsHappening.label': 'O que está acontecendo ou o que você quer mudar?',
    'form.whatIsHappening.hint': 'Descreva o problema, erro ou melhoria que você detectou',
    'form.whatIsHappening.placeholder': 'Por exemplo: "O botão de pagamento não funciona quando tento completar uma compra" ou "Preciso que o relatório inclua a data da última compra"...',
    
    // Question 2: Expected flow
    'form.expectedFlow.label': 'Qual é o fluxo esperado ou o que deveria acontecer normalmente?',
    'form.expectedFlow.hint': 'Isso nos ajuda a entender a diferença entre o comportamento atual e o esperado',
    'form.expectedFlow.placeholder': 'Por exemplo: "Deveria mostrar uma confirmação após clicar em pagar e redirecionar para o resumo do pedido"...',
    
    // Question 3: Where
    'form.whereOccurs.label': 'Onde ocorre?',
    'form.whereOccurs.otherPlaceholder': 'Especifique onde ocorre...',
    'form.location.app': 'App móvel',
    'form.location.salesforce': 'Salesforce',
    'form.location.web': 'Plataforma web',
    'form.location.internalProcess': 'Processo interno',
    'form.location.other': 'Outro',
    
    // Question 4: Who's affected
    'form.affectedParty.label': 'Quem está sendo afetado?',
    'form.affected.customers': 'Clientes',
    'form.affected.internal': 'Equipe interna',
    'form.affected.both': 'Ambos',
    
    // Question 5: Urgency
    'form.urgency.label': 'Qual a urgência para a operação?',
    'form.urgency.blocks': '🚨 Bloqueia',
    'form.urgency.blocksDesc': 'Não podemos operar até que seja resolvido',
    'form.urgency.affects': '⚠️ Afeta',
    'form.urgency.affectsDesc': 'Podemos trabalhar mas com dificuldades',
    'form.urgency.notUrgent': '📋 Não urgente',
    'form.urgency.notUrgentDesc': 'É uma melhoria ou pode esperar',
    
    // Question 6: Additional context
    'form.additionalContext.label': 'Dê-nos um pouco mais de contexto',
    'form.additionalContext.hint': 'Passos para replicar, exemplos, links, screenshots, usuário afetado, etc.',
    'form.additionalContext.placeholder': 'Qualquer informação adicional que nos ajude a entender melhor...',
    
    'form.submit': 'Enviar Ticket',
    'form.submitting': 'Processando ticket...',
    'form.attachments': 'Anexos',
    'form.attachments.hint': 'Adicione fotos, vídeos ou links para mais contexto',
    'form.addPhoto': 'Adicionar foto',
    'form.addVideo': 'Adicionar vídeo',
    'form.addLink': 'Adicionar link',
    'form.linkUrl': 'URL do link',
    'form.linkDescription': 'Descrição (opcional)',
    
    // Legacy form fields
    'form.need': 'Qual é a sua necessidade?',
    'form.need.label': 'Qual é a sua necessidade?',
    'form.need.placeholder': 'Descreva o que você precisa de forma clara e detalhada...',
    'form.need.hint': 'Seja específico sobre o problema ou funcionalidade que você requer',
    'form.desiredFlow': 'Qual é o fluxo desejado?',
    'form.desiredFlow.label': 'Qual é o fluxo desejado?',
    'form.desiredFlow.placeholder': 'Descreva passo a passo como deveria funcionar...',
    'form.desiredFlow.hint': 'Liste os passos do processo ideal que você espera',
    'form.context': 'Contexto',
    'form.context.label': 'Nos dê um pouco de contexto',
    'form.context.placeholder': 'Por que é importante? Quem é afetado? Há urgência?',
    'form.context.hint': 'Inclua impacto no negócio, usuários afetados ou dependências',
    'form.desiredDate.label': 'Tempo de entrega desejado',
    'form.desiredDate.placeholder': 'Selecione uma data',
    'form.desiredDate.hint': 'Apenas datas a partir de amanhã são permitidas',
    'form.desiredDate.error': 'Datas passadas ou hoje não são permitidas. Selecione uma data futura.',
    
    // Validation
    'validation.whatIsHappening.min': 'Descreva o que está acontecendo em pelo menos 10 caracteres',
    'validation.expectedFlow.min': 'Descreva o fluxo esperado em pelo menos 10 caracteres',
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
    'stats.drafts': 'Rascunhos',
    
    // Actions
    'action.edit': 'Editar e Reenviar',
    'action.linkCard': 'Vincular Card Manual',
    'action.close': 'Fechar Caso',
    'action.moveToProgress': 'Mover para Em Progresso',
    'action.moveToReview': 'Mover para Revisão',
    'action.moveToProduction': 'Mover para Produção',
    'action.viewBasecamp': 'Ver no Basecamp',
    'action.cancel': 'Cancelar',
    'action.delete': 'Excluir',
    
    // Status
    'status.today': 'Hoje',
    'status.thisWeek': 'Esta Semana',
    'status.backlog': 'Backlog',
    'status.inProgress': 'Em Progresso',
    'status.review': 'Em Revisão',
    'status.production': 'Produção',
    'status.closed': 'Fechado',
    'status.draft': 'Rascunho',
    'status.failedReport': 'Relatório Falhado',
    
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
    
    // Ticket
    'ticket.module': 'Módulo',
    
    // Approval Board
    'approvalBoard.title': 'Quadro de Aprovação',
    'approvalBoard.subtitle': 'Revise e aprove rascunhos de tickets antes de enviar ao Basecamp',
    'approvalBoard.empty': 'Nenhum rascunho pendente',
    'approvalBoard.emptyDescription': 'Tickets classificados aparecerão aqui para aprovação antes de serem enviados ao Basecamp.',
    'approvalBoard.pending': 'pendentes',
    'approvalBoard.approve': 'Aprovar',
    'approvalBoard.reject': 'Rejeitar',
    'approvalBoard.confirmApprove': 'Aprovar e enviar ao Basecamp?',
    'approvalBoard.confirmReject': 'Rejeitar este ticket?',
    'approvalBoard.confirmDelete': 'Excluir este rascunho?',
    'approvalBoard.approveDescription': 'Este ticket será enviado ao Basecamp e movido para a tabela de acompanhamento.',
    'approvalBoard.rejectDescription': 'Este ticket será marcado como Relatório Falhado e não será enviado ao Basecamp.',
    'approvalBoard.deleteDescription': 'Este rascunho será excluído permanentemente.',
    'approvalBoard.sendToBasecamp': 'Enviar ao Basecamp',
    'approvalBoard.markAsFailed': 'Marcar como Falhado',
  },
} as const;

export type TranslationKey = keyof typeof translations.es;
