import React, { useState } from 'react';

const HealthChecklist = ({ items = [] }) => {
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheck = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="health-checklist my-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Checklist de Saúde</h3>
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <input
              type="checkbox"
              id={`health-item-${index}`}
              checked={checkedItems[index] || false}
              onChange={() => handleCheck(index)}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label
              htmlFor={`health-item-${index}`}
              className="flex-1 text-slate-700 cursor-pointer"
            >
              {item}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthChecklist;
