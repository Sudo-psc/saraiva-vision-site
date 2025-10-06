import React from 'react';
import { motion } from 'framer-motion';
import { List, ChevronRight } from 'lucide-react';

const TableOfContents = ({ headings = [] }) => {
  const [activeId, setActiveId] = React.useState('');

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -35% 0%' }
    );

    // Observar todos os headings
    const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);
    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (!headings || headings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="sticky top-24 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg">
          <List className="w-4 h-4 text-cyan-600" />
        </div>
        <h3 className="text-sm font-bold bg-gradient-to-r from-cyan-700 to-blue-500 bg-clip-text text-transparent">
          Neste Artigo
        </h3>
      </div>

      <nav aria-label="Índice do artigo">
        <ul className="space-y-2">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id;
            const isH2 = heading.level === 2;

            return (
              <li key={heading.id || index}>
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`group w-full text-left text-sm transition-all duration-200 flex items-start gap-2 ${
                    isH2 ? 'font-medium' : 'font-normal pl-4'
                  } ${
                    isActive
                      ? 'text-cyan-600'
                      : 'text-slate-600 hover:text-cyan-600'
                  }`}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <ChevronRight
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-transform ${
                      isActive ? 'text-cyan-600 transform translate-x-1' : 'text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1'
                    }`}
                  />
                  <span className="line-clamp-2">{heading.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Progresso de leitura</span>
          <span className="font-medium text-cyan-600">
            {Math.round((headings.findIndex(h => h.id === activeId) + 1) / headings.length * 100)}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-600 to-blue-500"
            initial={{ width: 0 }}
            animate={{
              width: `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%`
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TableOfContents;
