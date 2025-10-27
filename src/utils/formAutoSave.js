/**
 * Sistema de Auto-Save para Formulários
 *
 * Salva progresso automaticamente no localStorage
 * Permite retomar preenchimento após abandonar página
 * Expiração configurável de dados salvos
 *
 * @author Dr. Philipe Saraiva Cruz
 */

const STORAGE_PREFIX = 'form_autosave_';
const DEFAULT_EXPIRY_HOURS = 24;

/**
 * Salva dados do formulário no localStorage
 */
export const saveFormProgress = (formName, formData, expiryHours = DEFAULT_EXPIRY_HOURS) => {
  if (typeof window === 'undefined') return false;

  try {
    const saveData = {
      data: formData,
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem(`${STORAGE_PREFIX}${formName}`, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.warn('Failed to save form progress:', error);
    return false;
  }
};

/**
 * Carrega dados salvos do formulário
 */
export const loadFormProgress = (formName) => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${formName}`);
    if (!saved) return null;

    const { data, expiresAt } = JSON.parse(saved);

    // Verifica se expirou
    if (new Date(expiresAt) < new Date()) {
      clearFormProgress(formName);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to load form progress:', error);
    return null;
  }
};

/**
 * Verifica se há progresso salvo
 */
export const hasFormProgress = (formName) => {
  if (typeof window === 'undefined') return false;

  const saved = loadFormProgress(formName);
  return saved !== null && Object.keys(saved).length > 0;
};

/**
 * Limpa progresso salvo
 */
export const clearFormProgress = (formName) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${formName}`);
  } catch (error) {
    console.warn('Failed to clear form progress:', error);
  }
};

/**
 * Obtém informações sobre o save
 */
export const getFormProgressInfo = (formName) => {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${formName}`);
    if (!saved) return null;

    const { savedAt, expiresAt } = JSON.parse(saved);

    return {
      savedAt: new Date(savedAt),
      expiresAt: new Date(expiresAt),
      isExpired: new Date(expiresAt) < new Date(),
      timeUntilExpiry: Math.floor((new Date(expiresAt) - new Date()) / 1000 / 60) // minutos
    };
  } catch (error) {
    console.warn('Failed to get form progress info:', error);
    return null;
  }
};

/**
 * Hook React para auto-save
 */
export const useFormAutoSave = (formName, formData, { enabled = true, debounceMs = 1000, expiryHours = DEFAULT_EXPIRY_HOURS } = {}) => {
  if (typeof window === 'undefined') return;

  const React = require('react');

  React.useEffect(() => {
    if (!enabled || !formData) return;

    // Debounce para não salvar a cada keystroke
    const timeoutId = setTimeout(() => {
      // Só salva se houver algum campo preenchido
      const hasData = Object.values(formData).some(value =>
        value && String(value).trim().length > 0
      );

      if (hasData) {
        saveFormProgress(formName, formData, expiryHours);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [formName, formData, enabled, debounceMs, expiryHours]);
};

/**
 * Limpa todos os auto-saves expirados
 */
export const cleanExpiredFormProgress = () => {
  if (typeof window === 'undefined') return;

  try {
    const keys = Object.keys(localStorage);
    const formKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));

    formKeys.forEach(key => {
      const saved = localStorage.getItem(key);
      if (!saved) return;

      try {
        const { expiresAt } = JSON.parse(saved);
        if (new Date(expiresAt) < new Date()) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Se não consegue parsear, remove
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clean expired form progress:', error);
  }
};

// Executa limpeza ao carregar o módulo
if (typeof window !== 'undefined') {
  // Limpa expirados ao carregar a página
  cleanExpiredFormProgress();

  // Limpa expirados a cada hora
  setInterval(cleanExpiredFormProgress, 60 * 60 * 1000);
}
