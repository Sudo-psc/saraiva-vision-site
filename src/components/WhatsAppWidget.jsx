import React from 'react';

/**
 * WhatsApp Widget Component
 * Provides a floating WhatsApp button in the bottom-right corner
 * with predefined message for appointment scheduling
 */
const WhatsAppWidget = ({
  enabled = true,
  phoneNumber = '15558650874',
  message = 'Olá. Gostaria de mais informações de como agendar minha consulta.',
  ...props
}) => {
  if (!enabled || !phoneNumber) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const floatButtonStyle = {
    width: '56px',
    height: '56px',
    bottom: '20px',
    right: '20px',
    borderRadius: '100%',
    position: 'fixed',
    zIndex: 99999,
    display: 'flex',
    transition: 'all .3s',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#25D366',
    boxShadow: '0 2px 10px rgba(37, 211, 102, 0.3)',
    textDecoration: 'none'
  };

  const imgStyle = {
    width: '24px',
    height: '24px',
    position: 'relative',
    filter: 'brightness(0) invert(1)'
  };

  return (
    <>
      <a
        href={whatsappUrl}
        style={floatButtonStyle}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contatar via WhatsApp"
        onMouseEnter={(e) => {
          e.target.style.boxShadow = '0px 3px 16px rgba(37, 211, 102, 0.4)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = '0 2px 10px rgba(37, 211, 102, 0.3)';
          e.target.style.transform = 'scale(1)';
        }}
        {...props}
      >
        <img
          src="https://cdn.sendpulse.com/img/messengers/sp-i-small-forms-wa.svg"
          alt="WhatsApp"
          loading="lazy"
          style={imgStyle}
        />
      </a>
    </>
  );
};

export default React.memo(WhatsAppWidget);