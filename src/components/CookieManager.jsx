import { useState, useEffect } from 'react';
import ConsentBanner from './ConsentBanner';
import CookieConsentModal from './CookieConsentModal';
import { shouldShowConsentBanner } from '@/utils/consentMode';

const CookieManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (shouldShowConsentBanner()) {
      setShowBanner(true);
    }

    const handleOpenModal = () => {
      setShowModal(true);
    };

    window.addEventListener('open-cookie-modal', handleOpenModal);

    return () => {
      window.removeEventListener('open-cookie-modal', handleOpenModal);
    };
  }, []);

  const handleOpenModal = () => {
    setShowBanner(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {showBanner && <ConsentBanner onOpenModal={handleOpenModal} />}
      <CookieConsentModal isOpen={showModal} onClose={handleCloseModal} />
    </>
  );
};

export default CookieManager;
