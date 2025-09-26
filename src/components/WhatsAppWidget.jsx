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

  return (
    <>
      <a
        href={whatsappUrl}
        className="wa-float-img-circle"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contatar via WhatsApp"
        {...props}
      >
        <img
          src="https://cdn.sendpulse.com/img/messengers/sp-i-small-forms-wa.svg"
          alt="WhatsApp"
          loading="lazy"
        />
      </a>
      <style jsx>{`
        .wa-float-img-circle {
          width: 56px;
          height: 56px;
          bottom: 20px;
          right: 20px;
          border-radius: 100%;
          position: fixed;
          z-index: 99999;
          display: flex;
          transition: all .3s;
          align-items: center;
          justify-content: center;
          background: #25D366;
          box-shadow: 0 2px 10px rgba(37, 211, 102, 0.3);
        }

        .wa-float-img-circle img {
          width: 24px;
          height: 24px;
          position: relative;
          filter: brightness(0) invert(1);
        }

        .wa-float-img-circle:before {
          position: absolute;
          content: '';
          background-color: #25D366;
          width: 70px;
          height: 70px;
          bottom: -7px;
          right: -7px;
          border-radius: 100%;
          animation: wa-float-circle-fill-anim 2.3s infinite ease-in-out;
          transform-origin: center;
          opacity: .2;
        }

        .wa-float-img-circle:hover {
          box-shadow: 0px 3px 16px rgba(37, 211, 102, 0.4);
          transform: scale(1.05);
        }

        .wa-float-img-circle:focus {
          box-shadow: 0px 0 0 3px rgba(37, 211, 102, 0.3);
          outline: none;
        }

        .wa-float-img-circle:hover:before,
        .wa-float-img-circle:focus:before {
          display: none;
        }

        @keyframes wa-float-circle-fill-anim {
          0% {
            transform: rotate(0deg) scale(0.7) skew(1deg);
          }
          50% {
            transform: rotate(0deg) scale(1) skew(1deg);
          }
          100% {
            transform: rotate(0deg) scale(0.7) skew(1deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .wa-float-img-circle {
            width: 50px;
            height: 50px;
            bottom: 15px;
            right: 15px;
          }

          .wa-float-img-circle img {
            width: 20px;
            height: 20px;
          }
        }

        /* Ensure widget stays above other elements */
        .wa-float-img-circle {
          z-index: 99999 !important;
        }
      `}</style>
    </>
  );
};

export default React.memo(WhatsAppWidget);