import React from 'react';
import { useTranslation } from 'react-i18next';
import { clinicInfo } from '@/lib/clinicInfo';

// Placeholder privacy policy (expand via legal review)
const PrivacyPolicyPage = () => {
  const { t } = useTranslation();
  return (
    <main className="container mx-auto px-4 md:px-6 py-16 prose max-w-3xl">
      <h1>{t('privacy.title')}</h1>
      <p className="text-sm text-slate-500">{t('privacy.last_updated', { date: new Date().toISOString().slice(0,10) })}</p>
      <p>{t('privacy.intro')}</p>
      <h2>{t('privacy.data_collected_title')}</h2>
      <ul>
        <li>{t('privacy.data_item_contact')}</li>
        <li>{t('privacy.data_item_usage')}</li>
        <li>{t('privacy.data_item_cookies')}</li>
      </ul>
      <h2>{t('privacy.purposes_title')}</h2>
      <p>{t('privacy.purposes_desc')}</p>
      <h2>{t('privacy.rights_title')}</h2>
      <p>{t('privacy.rights_desc')}</p>
      <h2>{t('privacy.consent_title')}</h2>
      <p>{t('privacy.consent_desc')}</p>
      <h2>{t('privacy.dpo_title')}</h2>
      <p>{t('privacy.dpo_desc', { email: clinicInfo.dpoEmail })}</p>
      <h2>{t('privacy.security_title')}</h2>
      <p>{t('privacy.security_desc')}</p>
      <h2>{t('privacy.retention_title')}</h2>
      <p>{t('privacy.retention_desc')}</p>
      <h2>{t('privacy.third_parties_title')}</h2>
      <p>{t('privacy.third_parties_desc')}</p>
      <h2>{t('privacy.updates_title')}</h2>
      <p>{t('privacy.updates_desc')}</p>
    </main>
  );
};

export default PrivacyPolicyPage;
