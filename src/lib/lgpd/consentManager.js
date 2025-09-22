/**
 * LGPD Consent Management System
 * Handles explicit consent collection and privacy notices
 */

export class ConsentManager {
    constructor() {
        this.consentKey = 'lgpd_consent';
        this.consentVersion = '1.0';
    }

    /**
     * Check if user has given valid consent
     */
    hasValidConsent() {
        try {
            const consent = localStorage.getItem(this.consentKey);
            if (!consent) return false;

            const consentData = JSON.parse(consent);
            return (
                consentData.version === this.consentVersion &&
                consentData.timestamp &&
                consentData.accepted === true &&
                this.isConsentStillValid(consentData.timestamp)
            );
        } catch (error) {
            console.error('Error checking consent:', error);
            return false;
        }
    }

    /**
     * Record user consent
     */
    recordConsent(consentDetails) {
        const consentData = {
            version: this.consentVersion,
            timestamp: new Date().toISOString(),
            accepted: true,
            purposes: consentDetails.purposes || [],
            ipHash: consentDetails.ipHash,
            userAgent: navigator.userAgent,
            ...consentDetails
        };

        try {
            localStorage.setItem(this.consentKey, JSON.stringify(consentData));
            return true;
        } catch (error) {
            console.error('Error recording consent:', error);
            return false;
        }
    }

    /**
     * Withdraw consent
     */
    withdrawConsent() {
        try {
            localStorage.removeItem(this.consentKey);
            // Clear any other stored personal data
            this.clearPersonalData();
            return true;
        } catch (error) {
            console.error('Error withdrawing consent:', error);
            return false;
        }
    }

    /**
     * Get current consent details
     */
    getConsentDetails() {
        try {
            const consent = localStorage.getItem(this.consentKey);
            return consent ? JSON.parse(consent) : null;
        } catch (error) {
            console.error('Error getting consent details:', error);
            return null;
        }
    }

    /**
     * Check if consent is still valid (not expired)
     */
    isConsentStillValid(timestamp) {
        const consentDate = new Date(timestamp);
        const now = new Date();
        const daysDiff = (now - consentDate) / (1000 * 60 * 60 * 24);

        // Consent expires after 365 days
        return daysDiff <= 365;
    }

    /**
     * Clear personal data from local storage
     */
    clearPersonalData() {
        const keysToRemove = [
            'contact_form_data',
            'appointment_data',
            'user_preferences'
        ];

        keysToRemove.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn(`Could not remove ${key}:`, error);
            }
        });
    }

    /**
     * Get privacy notice text
     */
    getPrivacyNotice() {
        return {
            title: 'Política de Privacidade e Proteção de Dados',
            content: `
        <h3>Coleta e Uso de Dados Pessoais</h3>
        <p>A Clínica Saraiva Vision coleta seus dados pessoais para:</p>
        <ul>
          <li>Agendamento de consultas e procedimentos</li>
          <li>Comunicação sobre serviços médicos</li>
          <li>Envio de lembretes de consultas</li>
          <li>Melhoria dos nossos serviços</li>
        </ul>

        <h3>Base Legal (LGPD)</h3>
        <p>O tratamento dos seus dados é baseado em:</p>
        <ul>
          <li>Consentimento explícito (Art. 7º, I da LGPD)</li>
          <li>Execução de contrato (Art. 7º, V da LGPD)</li>
          <li>Cuidados de saúde (Art. 11, II da LGPD)</li>
        </ul>

        <h3>Seus Direitos</h3>
        <p>Você tem direito a:</p>
        <ul>
          <li>Confirmação da existência de tratamento</li>
          <li>Acesso aos dados</li>
          <li>Correção de dados incompletos ou inexatos</li>
          <li>Anonimização ou eliminação de dados</li>
          <li>Portabilidade dos dados</li>
          <li>Revogação do consentimento</li>
        </ul>

        <h3>Segurança dos Dados</h3>
        <p>Utilizamos criptografia e medidas de segurança técnicas e administrativas para proteger seus dados.</p>

        <h3>Contato</h3>
        <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:</p>
        <p>Email: privacidade@saraivavision.com.br</p>
        <p>Telefone: (11) 99999-9999</p>
      `,
            lastUpdated: '2024-01-01'
        };
    }
}

// Singleton instance
export const consentManager = new ConsentManager();