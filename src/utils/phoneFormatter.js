// Safe phone formatter: strips non-digits or returns empty string
export const safePhoneFormat = (phoneValue) => {
  if (typeof phoneValue !== 'string' || !phoneValue) return '';
  try { return phoneValue.replace(/\D/g, ''); } catch { return ''; }
};

// Backward-compat data-aware formatter for objects like { phone_whatsapp }
export const formatWhatsappPhone = (data) => {
  if (!data || typeof data.phone_whatsapp !== 'string') {
    console.warn('Invalid phone_whatsapp data:', data);
    return '';
  }
  return safePhoneFormat(data.phone_whatsapp);
};

