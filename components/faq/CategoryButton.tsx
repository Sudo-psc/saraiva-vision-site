'use client';

import React from 'react';

interface CategoryButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
}

export function CategoryButton({ icon, title, description, count }: CategoryButtonProps) {
  const handleClick = () => {
    const element = document.getElementById('faq-main');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <button
      className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 text-left group"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          {icon}
        </div>
        <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
          {count} perguntas
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed">
        {description}
      </p>
    </button>
  );
}
