import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para exibição em português
 * @param {string|Date} date - Data em formato ISO ou objeto Date
 * @param {string} formatString - Formato desejado (opcional)
 * @returns {string} Data formatada
 */
export function formatDate(date, formatString = "d 'de' MMMM 'de' yyyy") {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Formata data de forma relativa (ex: "há 2 dias")
 * @param {string|Date} date - Data em formato ISO ou objeto Date
 * @returns {string} Data relativa
 */
export function formatRelativeDate(date) {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { 
      addSuffix: true, 
      locale: ptBR 
    });
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
}

/**
 * Formata data para SEO (ISO 8601)
 * @param {string|Date} date - Data em formato ISO ou objeto Date
 * @returns {string} Data em formato ISO 8601
 */
export function formatDateForSEO(date) {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error formatting date for SEO:', error);
    return new Date().toISOString();
  }
}
