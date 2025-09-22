// WhatsApp Configuration for Saraiva Vision Clinic
export const whatsappConfig = {
    // Clinic's official WhatsApp number (Brazil format)
    phoneNumber: "5511999999999", // Replace with actual clinic number

    // Default greeting messages
    messages: {
        default: "Olá! Gostaria de agendar uma consulta ou tirar dúvidas sobre os serviços da Clínica Saraiva Vision.",
        appointment: "Olá! Gostaria de agendar uma consulta com Dr. Philipe Saraiva. Quando seria o melhor horário para você?",
        services: "Olá! Tenho interesse em conhecer mais sobre os serviços oftalmológicos da Clínica Saraiva Vision.",
        emergency: "Olá! Preciso de atendimento oftalmológico urgente. Vocês atendem emergências?",
        contact: "Olá! Gostaria de entrar em contato com a Clínica Saraiva Vision para mais informações."
    },

    // Widget appearance settings
    widget: {
        position: "bottom-right", // bottom-right, bottom-left, top-right, top-left
        showGreeting: true,
        greetingDelay: 3000, // 3 seconds
        greetingAutoHide: 10000, // 10 seconds
        pulseAnimation: true,
        showTooltip: true
    },

    // Professional greeting configuration
    greeting: {
        title: "Clínica Saraiva Vision",
        message: "Olá! 👋 Precisa de ajuda? Estamos aqui para esclarecer suas dúvidas sobre nossos serviços oftalmológicos.",
        avatar: "/img/drphilipe_perfil.webp", // Doctor's profile image
        showAvatar: true,
        showOnlineStatus: true
    },

    // Business hours for automatic responses
    businessHours: {
        enabled: true,
        timezone: "America/Sao_Paulo",
        schedule: {
            monday: { open: "08:00", close: "18:00" },
            tuesday: { open: "08:00", close: "18:00" },
            wednesday: { open: "08:00", close: "18:00" },
            thursday: { open: "08:00", close: "18:00" },
            friday: { open: "08:00", close: "18:00" },
            saturday: { closed: true },
            sunday: { closed: true }
        },
        afterHoursMessage: "Obrigado pelo contato! Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Responderemos sua mensagem no próximo dia útil."
    },

    // Analytics tracking
    analytics: {
        trackClicks: true,
        eventCategory: "engagement",
        eventAction: "whatsapp_click",
        eventLabel: "whatsapp_widget"
    },

    // Accessibility settings
    accessibility: {
        ariaLabel: "Entrar em contato via WhatsApp",
        tooltip: "Fale conosco no WhatsApp",
        closeButtonLabel: "Fechar mensagem",
        keyboardNavigation: true
    }
};

// Utility function to get message by type
export const getWhatsAppMessage = (type = 'default', customMessage = '') => {
    if (customMessage) return customMessage;
    return whatsappConfig.messages[type] || whatsappConfig.messages.default;
};

// Utility function to format phone number for WhatsApp URL
export const formatWhatsAppNumber = (number) => {
    // Remove all non-numeric characters
    const cleaned = number.replace(/\D/g, '');

    // Ensure it starts with country code (55 for Brazil)
    if (!cleaned.startsWith('55')) {
        return `55${cleaned}`;
    }

    return cleaned;
};

// Utility function to check if within business hours
export const isWithinBusinessHours = () => {
    if (!whatsappConfig.businessHours.enabled) return true;

    const now = new Date();
    const timezone = whatsappConfig.businessHours.timezone;
    const currentTime = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    }).format(now);

    const dayOfWeek = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'long'
    }).format(now).toLowerCase();

    const schedule = whatsappConfig.businessHours.schedule[dayOfWeek];

    if (!schedule || schedule.closed) return false;

    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [openHour, openMinute] = schedule.open.split(':').map(Number);
    const openMinutes = openHour * 60 + openMinute;

    const [closeHour, closeMinute] = schedule.close.split(':').map(Number);
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

export default whatsappConfig;