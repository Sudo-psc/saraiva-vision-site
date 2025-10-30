import React, { useState } from 'react';
import { Check } from 'lucide-react';

const HealthChecklist = ({ items = [], title = 'Lista de Verificação' }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="my-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <button
              onClick={() => toggleItem(index)}
              className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                checkedItems[index]
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white border-slate-300 hover:border-blue-400'
              }`}
              aria-label={`Marcar ${item}`}
            >
              {checkedItems[index] && <Check className="w-4 h-4 text-white" />}
            </button>
            <span className={`text-slate-700 ${checkedItems[index] ? 'line-through opacity-60' : ''}`}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthChecklist;