/**
 * Utilidades para Tracking de Formulários com Google Analytics 4
 *
 * Rastreia:
 * - Início de preenchimento
 * - Abandono de formulário
 * - Campos específicos preenchidos
 * - Tempo gasto
 * - Submissão bem-sucedida
 * - Erros de validação
 *
 * @author Dr. Philipe Saraiva Cruz
 */

// Track form start
export const trackFormStart = (formName, variant = null) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'form_start', {
    form_name: formName,
    form_variant: variant,
    timestamp: new Date().toISOString()
  });

  // Armazena tempo de início para calcular tempo gasto
  sessionStorage.setItem(`form_start_${formName}`, Date.now().toString());
};

// Track field interaction
export const trackFieldInteraction = (formName, fieldName, action = 'focus') => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'form_field_interaction', {
    form_name: formName,
    field_name: fieldName,
    action: action, // focus, blur, change
    timestamp: new Date().toISOString()
  });
};

// Track field completion
export const trackFieldCompletion = (formName, fieldName, hasValue) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'form_field_complete', {
    form_name: formName,
    field_name: fieldName,
    has_value: hasValue,
    timestamp: new Date().toISOString()
  });
};

// Track validation error
export const trackValidationError = (formName, fieldName, errorMessage) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'form_validation_error', {
    form_name: formName,
    field_name: fieldName,
    error_message: errorMessage,
    timestamp: new Date().toISOString()
  });
};

// Track form abandonment
export const trackFormAbandonment = (formName, fieldsCompleted, totalFields, variant = null) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const startTime = sessionStorage.getItem(`form_start_${formName}`);
  const timeSpent = startTime ? Math.floor((Date.now() - parseInt(startTime)) / 1000) : 0;

  const completionRate = totalFields > 0 ? (fieldsCompleted / totalFields) * 100 : 0;

  window.gtag('event', 'form_abandonment', {
    form_name: formName,
    form_variant: variant,
    fields_completed: fieldsCompleted,
    total_fields: totalFields,
    completion_rate: completionRate.toFixed(2),
    time_spent_seconds: timeSpent,
    timestamp: new Date().toISOString()
  });

  // Limpa storage
  sessionStorage.removeItem(`form_start_${formName}`);
};

// Track form submission
export const trackFormSubmission = (formName, success, variant = null, errorMessage = null) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const startTime = sessionStorage.getItem(`form_start_${formName}`);
  const timeSpent = startTime ? Math.floor((Date.now() - parseInt(startTime)) / 1000) : 0;

  window.gtag('event', success ? 'form_submit_success' : 'form_submit_error', {
    form_name: formName,
    form_variant: variant,
    time_spent_seconds: timeSpent,
    error_message: errorMessage,
    timestamp: new Date().toISOString()
  });

  if (success) {
    // Limpa storage após sucesso
    sessionStorage.removeItem(`form_start_${formName}`);
  }
};

// Track form progress (called periodically)
export const trackFormProgress = (formName, fieldsCompleted, totalFields, variant = null) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const completionRate = totalFields > 0 ? (fieldsCompleted / totalFields) * 100 : 0;

  // Só envia eventos em marcos específicos: 25%, 50%, 75%
  const milestones = [25, 50, 75];
  const currentMilestone = milestones.find(m =>
    completionRate >= m &&
    !sessionStorage.getItem(`form_milestone_${formName}_${m}`)
  );

  if (currentMilestone) {
    window.gtag('event', 'form_progress', {
      form_name: formName,
      form_variant: variant,
      milestone: currentMilestone,
      fields_completed: fieldsCompleted,
      total_fields: totalFields,
      timestamp: new Date().toISOString()
    });

    sessionStorage.setItem(`form_milestone_${formName}_${currentMilestone}`, 'true');
  }
};

// Setup abandonment tracking on page unload
export const setupAbandonmentTracking = (formName, getCompletedFields, getTotalFields, variant = null) => {
  if (typeof window === 'undefined') return;

  const handleBeforeUnload = () => {
    const fieldsCompleted = getCompletedFields();
    const totalFields = getTotalFields();
    const completionRate = totalFields > 0 ? (fieldsCompleted / totalFields) * 100 : 0;

    // Só trackeia abandono se usuário começou a preencher mas não completou
    if (fieldsCompleted > 0 && completionRate < 100) {
      trackFormAbandonment(formName, fieldsCompleted, totalFields, variant);
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Retorna função de cleanup
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

// Limpa tracking data ao completar formulário
export const clearFormTracking = (formName) => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(`form_start_${formName}`);

  // Limpa milestones
  [25, 50, 75].forEach(milestone => {
    sessionStorage.removeItem(`form_milestone_${formName}_${milestone}`);
  });
};

// Get form analytics summary
export const getFormAnalytics = (formName) => {
  if (typeof window === 'undefined') return null;

  const startTime = sessionStorage.getItem(`form_start_${formName}`);
  const timeSpent = startTime ? Math.floor((Date.now() - parseInt(startTime)) / 1000) : 0;

  const milestones = [25, 50, 75].map(m => ({
    milestone: m,
    reached: !!sessionStorage.getItem(`form_milestone_${formName}_${m}`)
  }));

  return {
    timeSpent,
    milestones,
    hasStarted: !!startTime
  };
};
