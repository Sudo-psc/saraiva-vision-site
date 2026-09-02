import React from 'react';
import ClinicClosedNotice from '@/components/ClinicClosedNotice';

const ActionButtons = ({
  showPDF = false,
  pdfUrl = null,
  pdfTitle = 'Guia Completo',
  className = ''
}) => {
  return (
    <div className={className} role="complementary" aria-label="Informações da clínica">
      <ClinicClosedNotice variant="card" />
      {showPDF && pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          {pdfTitle}
        </a>
      )}
    </div>
  );
};

export default ActionButtons;
