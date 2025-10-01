import { AlertCircle, Info, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * SkipLink - Link para pular navegação (WCAG 2.4.1)
 * Deve ser o primeiro elemento focável da página
 */
export function SkipLink({ targetId = "main-content" }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 focus:z-50 focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white 
                 focus:font-bold focus:rounded-lg focus:shadow-2xl
                 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
    >
      Pular para o conteúdo principal
    </a>
  );
}

/**
 * Callout - Componente de destaque acessível
 * 
 * @param {string} type - Tipo do callout: info, warning, tip, danger, success
 * @param {string} title - Título do callout (opcional)
 * @param {ReactNode} children - Conteúdo do callout
 * @param {Component} icon - Ícone customizado (opcional)
 */
export function Callout({ 
  type = 'info', 
  title, 
  children, 
  icon: CustomIcon 
}) {
  const configs = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      icon: 'text-blue-600',
      heading: 'text-blue-900',
      text: 'text-blue-800',
      ariaLabel: 'Informação importante',
      Icon: Info
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-400',
      icon: 'text-amber-600',
      heading: 'text-amber-900',
      text: 'text-amber-800',
      ariaLabel: 'Aviso',
      Icon: AlertTriangle
    },
    tip: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      icon: 'text-green-600',
      heading: 'text-green-900',
      text: 'text-green-800',
      ariaLabel: 'Dica',
      Icon: Lightbulb
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      icon: 'text-red-600',
      heading: 'text-red-900',
      text: 'text-red-800',
      ariaLabel: 'Atenção crítica',
      Icon: AlertCircle
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-400',
      icon: 'text-emerald-600',
      heading: 'text-emerald-900',
      text: 'text-emerald-800',
      ariaLabel: 'Sucesso',
      Icon: CheckCircle
    }
  };

  const config = configs[type] || configs.info;
  const IconComponent = CustomIcon || config.Icon;

  return (
    <aside
      role="note"
      aria-label={config.ariaLabel}
      className={`my-6 p-5 ${config.bg} border-l-4 ${config.border} rounded-r-lg shadow-sm`}
    >
      <div className="flex gap-4">
        <IconComponent 
          className={`w-6 h-6 ${config.icon} flex-shrink-0 mt-0.5`}
          aria-hidden="true"
        />
        <div className="flex-1 space-y-2">
          {title && (
            <h3 className={`font-bold text-lg ${config.heading}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.text} leading-relaxed prose prose-sm max-w-none`}>
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * AccessibleImage - Wrapper para imagens com suporte a caption e créditos
 */
export function AccessibleImage({ 
  src, 
  alt, 
  caption, 
  credit,
  width,
  height,
  className = ""
}) {
  // Gerar ID único para associar caption com imagem
  const imageId = `img-${src.split('/').pop()?.replace(/\W/g, '-')}`;
  const captionId = `caption-${imageId}`;

  return (
    <figure className={`my-8 ${className}`} role="figure">
      <img
        id={imageId}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="rounded-xl shadow-md w-full h-auto"
        aria-describedby={caption ? captionId : undefined}
      />
      {(caption || credit) && (
        <figcaption 
          id={captionId}
          className="mt-3 text-sm text-gray-600 text-center space-y-1"
        >
          {caption && <p>{caption}</p>}
          {credit && (
            <p className="text-xs text-gray-500">
              Crédito: {credit}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * KeyboardShortcutsHelp - Atalhos de teclado para navegação
 */
export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { key: 'Tab', action: 'Navegar entre elementos focáveis' },
    { key: 'Enter', action: 'Ativar link ou botão focado' },
    { key: 'Space', action: 'Rolar página para baixo' },
    { key: 'Shift + Space', action: 'Rolar página para cima' },
    { key: 'Home', action: 'Ir para o topo da página' },
    { key: 'End', action: 'Ir para o rodapé da página' }
  ];

  return (
    <details className="my-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <summary className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600">
        ⌨️ Atalhos de Teclado
      </summary>
      <div className="mt-4 space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold">
              {shortcut.key}
            </kbd>
            <span className="text-sm text-gray-700">{shortcut.action}</span>
          </div>
        ))}
      </div>
    </details>
  );
}

/**
 * ProgressiveList - Lista com animação progressiva e semântica clara
 */
export function ProgressiveList({ 
  items, 
  ordered = false, 
  icon = "•",
  className = "" 
}) {
  const ListTag = ordered ? 'ol' : 'ul';
  
  return (
    <ListTag className={`my-6 space-y-3 ${className}`}>
      {items.map((item, index) => (
        <li 
          key={index}
          className="flex items-start gap-3 text-gray-700 leading-relaxed"
        >
          {ordered ? (
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 
                           rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
          ) : (
            <span className="text-blue-600 font-bold mt-1" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ListTag>
  );
}

/**
 * ExpandableSection - Seção expansível acessível (accordion)
 */
export function ExpandableSection({ 
  title, 
  children, 
  defaultOpen = false,
  icon 
}) {
  return (
    <details 
      className="my-6 p-5 bg-white border-2 border-gray-200 rounded-xl shadow-sm"
      open={defaultOpen}
    >
      <summary className="font-bold text-lg text-gray-900 cursor-pointer 
                         hover:text-blue-600 transition-colors flex items-center gap-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">
        {icon && <span className="text-2xl" aria-hidden="true">{icon}</span>}
        <span>{title}</span>
      </summary>
      <div className="mt-4 pt-4 border-t border-gray-200 text-gray-700 leading-relaxed prose prose-sm max-w-none">
        {children}
      </div>
    </details>
  );
}

/**
 * HighlightBox - Caixa de destaque com borda e ícone
 */
export function HighlightBox({ 
  title, 
  children, 
  color = "blue",
  icon
}) {
  const colors = {
    blue: "border-blue-400 bg-blue-50 text-blue-900",
    green: "border-green-400 bg-green-50 text-green-900",
    purple: "border-purple-400 bg-purple-50 text-purple-900",
    orange: "border-orange-400 bg-orange-50 text-orange-900"
  };

  return (
    <div className={`my-6 p-6 border-l-4 rounded-r-xl ${colors[color] || colors.blue}`}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex-shrink-0 text-3xl" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="flex-1 space-y-3">
          {title && (
            <h3 className="font-bold text-xl">
              {title}
            </h3>
          )}
          <div className="text-sm leading-relaxed prose prose-sm max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * QuickFacts - Lista de fatos rápidos com ícones
 */
export function QuickFacts({ facts, title = "Fatos Rápidos" }) {
  return (
    <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 
                   border-2 border-blue-200 rounded-xl">
      <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">⚡</span>
        {title}
      </h3>
      <ul className="space-y-3">
        {facts.map((fact, index) => (
          <li 
            key={index}
            className="flex items-start gap-3 text-gray-800"
          >
            <CheckCircle 
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" 
              aria-hidden="true" 
            />
            <span className="flex-1 leading-relaxed">{fact}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * DefinitionBox - Caixa de definição de termos médicos
 */
export function DefinitionBox({ term, definition }) {
  return (
    <div className="my-6 p-5 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg"
         role="definition">
      <dt className="font-bold text-lg text-indigo-900 mb-2">
        📖 {term}
      </dt>
      <dd className="text-sm text-indigo-800 leading-relaxed">
        {definition}
      </dd>
    </div>
  );
}
