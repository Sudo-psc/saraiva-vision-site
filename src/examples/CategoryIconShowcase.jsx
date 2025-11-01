import React from 'react';
import CategoryIcon from '@/components/blog/CategoryIcon';

const CategoryIconShowcase = () => {
  const categories = [
    { name: 'Tecnologia', description: 'Ícone de chip/circuito tecnológico', color: 'Cyan' },
    { name: 'Tecnologia e Inovação', description: 'Mesmo ícone de Tecnologia', color: 'Cyan' },
    { name: 'Tratamento', description: 'Cruz médica com círculo', color: 'Green' },
    { name: 'Prevenção', description: 'Escudo de proteção com check', color: 'Blue' },
    { name: 'Guias Práticos', description: 'Documento com linhas', color: 'Purple' },
    { name: 'Mitos e Verdades', description: 'Círculo de alerta', color: 'Amber' },
    { name: 'Dúvidas Frequentes', description: 'Ponto de interrogação', color: 'Indigo' },
    { name: 'Categoria Padrão', description: 'Ícone de olho (oftalmologia)', color: 'Slate' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Ícones Temáticos do Blog
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Ícones SVG personalizados para cada categoria do blog, exibidos quando posts não têm imagem de capa.
          </p>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              {/* Icon Display */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-lg h-32 flex items-center justify-center mb-4">
                <CategoryIcon category={category.name} className="w-16 h-16" />
              </div>

              {/* Category Info */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {category.description}
              </p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {category.color}
              </span>
            </div>
          ))}
        </div>

        {/* Size Variations */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Variações de Tamanho
          </h2>
          <div className="flex flex-wrap items-end gap-8 justify-center">
            <div className="text-center">
              <CategoryIcon category="Tecnologia" className="w-8 h-8 mx-auto mb-2" />
              <span className="text-xs text-slate-600 dark:text-slate-400">w-8 h-8</span>
            </div>
            <div className="text-center">
              <CategoryIcon category="Tratamento" className="w-12 h-12 mx-auto mb-2" />
              <span className="text-xs text-slate-600 dark:text-slate-400">w-12 h-12 (default)</span>
            </div>
            <div className="text-center">
              <CategoryIcon category="Prevenção" className="w-16 h-16 mx-auto mb-2" />
              <span className="text-xs text-slate-600 dark:text-slate-400">w-16 h-16</span>
            </div>
            <div className="text-center">
              <CategoryIcon category="Guias Práticos" className="w-24 h-24 mx-auto mb-2" />
              <span className="text-xs text-slate-600 dark:text-slate-400">w-24 h-24 (card)</span>
            </div>
            <div className="text-center">
              <CategoryIcon category="Mitos e Verdades" className="w-32 h-32 mx-auto mb-2" />
              <span className="text-xs text-slate-600 dark:text-slate-400">w-32 h-32</span>
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Exemplo de Uso
          </h2>
          <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 overflow-x-auto">
            <pre className="text-sm text-slate-100">
{`import CategoryIcon from '@/components/blog/CategoryIcon';

// Uso básico (tamanho padrão: w-12 h-12)
<CategoryIcon category="Tecnologia" />

// Com tamanho customizado
<CategoryIcon 
  category="Tratamento" 
  className="w-24 h-24" 
/>

// Em um card de blog sem imagem
{!post.image && (
  <div className="h-48 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
    <CategoryIcon 
      category={post.category}
      className="w-24 h-24 opacity-90"
    />
  </div>
)}`}
            </pre>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">SVG Puro</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Zero dependências externas</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Performático</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">&lt;2KB cada ícone</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">♿</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Acessível</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">aria-hidden para decoração</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🌙</div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Dark Mode</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Cores adaptadas automaticamente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryIconShowcase;
