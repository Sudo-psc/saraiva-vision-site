export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  honeypot: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  consent?: string;
  honeypot?: string;
  general?: string;
}

export interface ContactFormState {
  success: boolean;
  message?: string;
  errors?: ContactFormErrors;
  messageId?: string;
}

export interface ContactAPIResponse {
  success: boolean;
  message?: string;
  errors?: ContactFormErrors;
  messageId?: string;
  code?: string;
}
