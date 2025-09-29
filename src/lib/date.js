// src/lib/date.js
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/pt-br";

dayjs.extend(localizedFormat);
dayjs.extend(updateLocale);

// Forçar pt-br como padrão
const APP_LOCALE = import.meta.env.VITE_DEFAULT_LOCALE ?? "pt-br";
dayjs.locale(APP_LOCALE);

// Exportar API segura
export const getWeekdays = () => {
    try {
        // Tentar diferentes abordagens para obter os dias da semana
        // Método 1: Usar dayjs com formatação direta
        const weekdays = [];
        for (let i = 0; i < 7; i++) {
            weekdays.push(dayjs().day(i).format('dddd'));
        }
        return weekdays;
    } catch (error) {
        // Fallback seguro caso algo falhe
        return ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
    }
};

/**
 * Formatar data para exibição em português brasileiro
 * @param {string | Date} input - Data a ser formatada
 * @param {string} format - Formato da data (default: "DD/MM/YYYY")
 * @returns {string} Data formatada ou string vazia se inválida
 */
export const formatDate = (input, format = "DD/MM/YYYY") => {
    if (!input) return '';

    try {
        const date = dayjs(input);
        if (!date.isValid()) return '';

        return date.format(format);
    } catch (error) {
        console.warn('Erro ao formatar data:', error);
        return '';
    }
};

export default dayjs;
