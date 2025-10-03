'use server';

import type { ContactFormData, ContactFormState } from '@/types/contact';

export async function submitContactAction(formData: ContactFormData): Promise<ContactFormState> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Erro ao enviar mensagem',
        errors: data.details || {},
      };
    }

    return {
      success: true,
      message: data.message || 'Mensagem enviada com sucesso!',
      messageId: data.messageId,
    };
  } catch (error) {
    console.error('Server Action Error:', error);
    return {
      success: false,
      message: 'Erro ao processar sua solicitação. Tente novamente.',
      errors: { general: 'Erro de conexão. Verifique sua internet.' },
    };
  }
}
