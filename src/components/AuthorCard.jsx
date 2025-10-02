import { NAP_CANONICAL } from '@/lib/napCanonical';

export default function AuthorCard({ variant = 'compact', showCRM = true, className = '' }) {
  const doctor = NAP_CANONICAL.doctor;

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-2 text-sm ${className}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-semibold">
          PS
        </div>
        <span className="font-medium text-gray-700">
          {doctor.name}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
          PS
        </div>
        <div>
          <p className="font-semibold text-gray-900">{doctor.name}</p>
          {showCRM && (
            <p className="text-sm text-gray-600">{doctor.crm}</p>
          )}
          <p className="text-xs text-gray-500">{doctor.specialty}</p>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            PS
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {doctor.name}
            </h3>
            {showCRM && (
              <p className="text-sm text-gray-700 font-medium mb-2">
                {doctor.crm}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-3">
              {doctor.title} especializado em {doctor.specialty}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Atendimento humanizado com tecnologia de ponta em {NAP_CANONICAL.address.city}, MG.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <p className="text-sm text-gray-600">
        {showCRM ? doctor.displayName : doctor.name}
      </p>
    </div>
  );
}
