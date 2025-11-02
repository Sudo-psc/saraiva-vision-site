/**
 * LLM Information Endpoint
 * Author: Dr. Philipe Saraiva Cruz
 *
 * Provides structured information about Saraiva Vision for LLMs and AI agents.
 * This endpoint is specifically designed to be easily parsable by AI systems.
 */

import express from 'express';
import { clinicInfo } from '../lib/clinicInfo.js';

const router = express.Router();

/**
 * GET /api/llm-info
 * Returns comprehensive clinic information in a structured format optimized for LLMs
 */
router.get('/', (req, res) => {
  const llmInfo = {
    // Business Information
    business: {
      name: clinicInfo.name,
      legalName: clinicInfo.legalName,
      type: 'Medical Clinic',
      specialty: 'Ophthalmology',
      description: 'Clínica oftalmológica em Caratinga, MG. Consultas, exames e tratamentos com tecnologia de ponta e atendimento humanizado.',
      foundingDate: clinicInfo.foundingDate,
      taxId: clinicInfo.taxId,
      website: 'https://saraivavision.com.br',
    },

    // Location Information (NAP - Name, Address, Phone)
    location: {
      address: {
        street: clinicInfo.streetAddress,
        neighborhood: clinicInfo.neighborhood,
        city: clinicInfo.city,
        state: clinicInfo.state,
        postalCode: clinicInfo.postalCode,
        country: clinicInfo.country,
        fullAddress: `${clinicInfo.streetAddress} - ${clinicInfo.neighborhood}, ${clinicInfo.city} - ${clinicInfo.state}, ${clinicInfo.postalCode}`,
      },
      coordinates: {
        latitude: clinicInfo.latitude,
        longitude: clinicInfo.longitude,
      },
      timezone: 'America/Sao_Paulo',
    },

    // Contact Information
    contact: {
      phone: {
        main: clinicInfo.phoneDisplay,
        e164: clinicInfo.phone,
        whatsapp: clinicInfo.whatsapp,
        whatsappLink: clinicInfo.whatsapp24h,
      },
      email: {
        main: clinicInfo.email,
        dpo: clinicInfo.dpoEmail, // LGPD Data Protection Officer
      },
      social: {
        instagram: clinicInfo.instagram,
        facebook: clinicInfo.facebook,
        linkedin: clinicInfo.linkedin,
        twitter: clinicInfo.x,
        spotify: clinicInfo.spotify,
      },
      chatbot: {
        url: clinicInfo.chatbotUrl,
        description: 'AI Assistant powered by ChatGPT for appointment booking and general questions',
      },
    },

    // Medical Staff Information
    staff: {
      responsiblePhysician: {
        name: clinicInfo.responsiblePhysician,
        crm: clinicInfo.responsiblePhysicianCRM,
        title: clinicInfo.responsiblePhysicianTitle,
        specialty: 'Oftalmologia',
      },
      responsibleNurse: {
        name: clinicInfo.responsibleNurse,
        coren: clinicInfo.responsibleNurseCOREN,
        title: clinicInfo.responsibleNurseTitle,
        phone: clinicInfo.responsibleNursePhone,
      },
    },

    // Services Offered
    services: {
      main: clinicInfo.servicesKeywords,
      categories: [
        {
          category: 'Consultas',
          items: ['Consultas oftalmológicas completas', 'Consultas de rotina', 'Consultas emergenciais'],
        },
        {
          category: 'Exames',
          items: [
            'Exames de refração',
            'Tonometria (pressão ocular)',
            'Fundoscopia',
            'Biomicroscopia',
            'Campimetria',
          ],
        },
        {
          category: 'Tratamentos',
          items: [
            'Prescrição de óculos',
            'Adaptação de lentes de contato',
            'Tratamento de doenças oculares',
            'Acompanhamento pós-operatório',
          ],
        },
        {
          category: 'Especialidades',
          items: [
            'Catarata',
            'Glaucoma',
            'Retinopatia diabética',
            'Oftalmologia pediátrica',
            'Cirurgias oftalmológicas',
          ],
        },
      ],
    },

    // Business Hours
    hours: {
      weekdays: {
        display: 'Segunda a Sexta: 08:00 às 18:00',
        opens: '08:00',
        closes: '18:00',
        timezone: 'America/Sao_Paulo',
      },
      saturday: {
        display: 'Sábado: Fechado',
        opens: null,
        closes: null,
      },
      sunday: {
        display: 'Domingo: Fechado',
        opens: null,
        closes: null,
      },
    },

    // Appointment Booking
    appointments: {
      onlineBooking: {
        available: true,
        url: clinicInfo.onlineSchedulingUrl,
        systems: ['NinSaúde', 'WhatsApp', 'Website Form'],
      },
      methods: [
        'Website: https://saraivavision.com.br/agendamento',
        'WhatsApp: ' + clinicInfo.whatsapp,
        'Phone: ' + clinicInfo.phoneDisplay,
        'NinSaúde: ' + clinicInfo.onlineSchedulingUrl,
      ],
    },

    // Payment Information
    payment: {
      methods: ['Cartão de crédito', 'Cartão de débito', 'Dinheiro', 'PIX', 'Transferência bancária'],
      insuranceAccepted: true,
      processor: 'ASAAS',
      subscriptionPlans: true,
    },

    // Healthcare Compliance (Brazil)
    compliance: {
      cfm: {
        registered: true,
        crm: clinicInfo.responsiblePhysicianCRM,
      },
      lgpd: {
        compliant: true,
        dpoEmail: clinicInfo.dpoEmail,
        privacyPolicy: 'https://saraivavision.com.br/privacy',
      },
      anvisa: {
        compliant: true,
      },
    },

    // Technology Stack
    technology: {
      ehr: 'NinSaúde', // Electronic Health Records
      payment: 'ASAAS',
      website: 'React + Vite',
      analytics: ['Google Analytics', 'PostHog'],
    },

    // Additional Resources
    resources: {
      blog: 'https://saraivavision.com.br/blog',
      podcast: 'https://saraivavision.com.br/podcast',
      faq: 'https://saraivavision.com.br/faq',
      plans: 'https://saraivavision.com.br/planos',
      sitemap: 'https://saraivavision.com.br/sitemap.xml',
    },

    // Meta Information
    meta: {
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
      language: 'pt-BR',
      country: 'BR',
      region: 'Minas Gerais',
      city: 'Caratinga',
    },
  };

  res.json(llmInfo);
});

export default router;
