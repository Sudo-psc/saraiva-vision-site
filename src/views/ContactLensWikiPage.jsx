import React, { useMemo, useState } from 'react';
import { Search, Filter, Tag, BookOpenCheck, ShieldCheck, Sparkles, AlertTriangle, Bookmark } from 'lucide-react';
import SEOHead from '@/components/SEOHead.jsx';
import EnhancedFooter from '@/components/EnhancedFooter.jsx';
import {
  wikiCategories,
  wikiTags,
  wikiFilters,
  wikiTopics,
  wikiFaq,
  wikiGlossary,
  safetyChecklist,
  imageResources,
  editorialPlan,
  quickLinks,
  updateLog,
  crossReferences
} from '@/content/contactLensWikiData.js';

const ContactLensWikiPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLensType, setSelectedLensType] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const seoData = useMemo(
    () => ({
      title: 'Enciclopédia de Lentes de Contato | Guia Completo Saraiva Vision',
      description:
        'Wiki interativa sobre lentes de contato com busca inteligente, filtros avançados, protocolos clínicos e cuidados baseados em evidências.',
      keywords: [
        'lentes de contato',
        'guia completo',
        'cuidados com lentes',
        'adaptação de lentes',
        'segurança ocular'
      ]
    }),
    []
  );

  const suggestions = useMemo(() => {
    const items = new Set();
    wikiTopics.forEach((topic) => {
      items.add(topic.title);
      topic.tags.forEach((tagId) => {
        const tagObj = wikiTags.find((t) => t.id === tagId);
        if (tagObj) items.add(tagObj.label);
      });
      topic.conditions.forEach((condition) => items.add(condition));
      topic.lensTypes.forEach((lens) => items.add(lens));
    });
    wikiFaq.forEach((faq) => items.add(faq.question));
    wikiGlossary.forEach((entry) => items.add(entry.term));
    return Array.from(items).sort((a, b) => a.localeCompare(b));
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredTopics = useMemo(() => {
    return wikiTopics.filter((topic) => {
      const matchesSearch =
        !normalizedSearch ||
        topic.title.toLowerCase().includes(normalizedSearch) ||
        topic.summary.toLowerCase().includes(normalizedSearch) ||
        topic.tags.some((tagId) => {
          const tagObj = wikiTags.find((t) => t.id === tagId);
          return tagObj && tagObj.label.toLowerCase().includes(normalizedSearch);
        });
      const matchesLens = !selectedLensType || topic.lensTypes.includes(selectedLensType);
      const matchesCondition = !selectedCondition || topic.conditions.includes(selectedCondition);
      const matchesBrand = !selectedBrand || topic.brands.includes(selectedBrand);
      const matchesRoutine = !selectedRoutine || topic.routines.includes(selectedRoutine);
      const matchesLevel = !selectedLevel || topic.level === selectedLevel;
      return matchesSearch && matchesLens && matchesCondition && matchesBrand && matchesRoutine && matchesLevel;
    });
  }, [normalizedSearch, selectedLensType, selectedCondition, selectedBrand, selectedRoutine, selectedLevel]);

  const groupedTopics = useMemo(() => {
    const groups = new Map();
    filteredTopics.forEach((topic) => {
      const category = wikiCategories.find((cat) => cat.id === topic.categoryId);
      if (!category) {
        return;
      }
      if (!groups.has(category.id)) {
        groups.set(category.id, { category, topics: [] });
      }
      groups.get(category.id).topics.push(topic);
    });
    return Array.from(groups.values()).sort((a, b) => a.category.name.localeCompare(b.category.name));
  }, [filteredTopics]);

  const activeFilters = [
    selectedLensType,
    selectedCondition,
    selectedBrand,
    selectedRoutine,
    selectedLevel
  ].filter(Boolean).length;

  const tagUsage = useMemo(() => {
    const counts = new Map();
    wikiTopics.forEach((topic) => {
      topic.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return wikiTags.map((tag) => ({
      ...tag,
      count: counts.get(tag.id) || 0
    }));
  }, []);

  const crossLinkMap = useMemo(() => {
    return crossReferences.reduce((acc, item) => {
      if (!acc[item.fromId]) {
        acc[item.fromId] = [];
      }
      acc[item.fromId].push(item);
      return acc;
    }, {});
  }, []);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedLensType('');
    setSelectedCondition('');
    setSelectedBrand('');
    setSelectedRoutine('');
    setSelectedLevel('');
  };

  const renderContentSection = (section, sectionIndex) => {
    if (section.kind === 'paragraph') {
      return (
        <p key={sectionIndex} className="text-slate-600 leading-relaxed">{section.content}</p>
      );
    }
    if (section.kind === 'list') {
      return (
        <div key={sectionIndex} className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-800">{section.title}</h4>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
    if (section.kind === 'grid') {
      return (
        <div key={sectionIndex} className="space-y-3">
          <h4 className="text-lg font-semibold text-slate-800">{section.title}</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 shadow-sm">
                <h5 className="text-base font-semibold text-cyan-900">{item.heading}</h5>
                <p className="mt-2 text-sm text-cyan-900/90">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (section.kind === 'table') {
      return (
        <div key={sectionIndex} className="space-y-3 overflow-hidden rounded-2xl border border-slate-200">
          <h4 className="px-4 pt-4 text-lg font-semibold text-slate-800">{section.title}</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {section.headers.map((header, headerIndex) => (
                    <th
                      key={headerIndex}
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {section.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50/70">
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 text-sm text-slate-600">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    if (section.kind === 'callout') {
      return (
        <div
          key={sectionIndex}
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 ${
            section.tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-cyan-200 bg-cyan-50 text-cyan-900'
          }`}
        >
          <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0" />
          <p className="text-sm leading-relaxed">{section.content}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <SEOHead {...seoData} />
      <main className="flex-1 bg-gradient-to-br from-slate-50 via-white to-cyan-50 pt-32 md:pt-36">
        <header className="mx-auto w-full max-w-6xl px-6 md:px-10">
          <div className="rounded-3xl bg-white/90 p-8 shadow-xl ring-1 ring-cyan-100">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  <Sparkles className="h-4 w-4" />
                  Enciclopédia das Lentes de Contato
                </span>
                <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                  Guia prático, clínico e visual para usuários de lentes de contato
                </h1>
                <p className="max-w-2xl text-base text-slate-600 md:text-lg">
                  Explore fundamentos, materiais avançados, protocolos de adaptação, rotinas de higiene e estratégias de segurança em um só lugar. Busque por condição ocular, rotina de uso, marcas ou nível de experiência e encontre respostas rápidas com base em evidências.
                </p>
              </div>
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-6 py-5 text-center text-cyan-800 md:w-64">
                <ShieldCheck className="h-10 w-10" />
                <p className="text-sm font-semibold">Conteúdo revisado clinicamente</p>
                <p className="text-xs text-cyan-900/80">Última atualização registrada em {updateLog[0].date}</p>
              </div>
            </div>
            <form className="mt-8 space-y-6" onSubmit={(event) => event.preventDefault()}>
              <div className="relative">
                <label htmlFor="wiki-search" className="sr-only">
                  Buscar conteúdo na enciclopédia
                </label>
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-500" />
                <input
                  id="wiki-search"
                  type="search"
                  list="wiki-suggestions"
                  className="w-full rounded-2xl border border-cyan-100 bg-white px-12 py-4 text-base text-slate-800 shadow-inner focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                  placeholder="Busque por tipo de lente, condição ocular ou tema"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-describedby="search-helper"
                />
                <datalist id="wiki-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <option key={index} value={suggestion} />
                  ))}
                </datalist>
                <p id="search-helper" className="mt-2 text-xs text-slate-500">
                  Use filtros combinados para refinar resultados. Digite ao menos três letras para sugestões imediatas.
                </p>
              </div>
              <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <legend className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
                  <Filter className="h-4 w-4" />
                  Filtros avançados
                </legend>
                <div className="mt-4 grid gap-4 md:grid-cols-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="filter-lens" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tipo de lente
                    </label>
                    <select
                      id="filter-lens"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                      value={selectedLensType}
                      onChange={(event) => setSelectedLensType(event.target.value)}
                    >
                      <option value="">Todas</option>
                      {wikiFilters.lensTypes.map((lens, index) => (
                        <option key={index} value={lens}>
                          {lens}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="filter-condition" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Condição ocular
                    </label>
                    <select
                      id="filter-condition"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                      value={selectedCondition}
                      onChange={(event) => setSelectedCondition(event.target.value)}
                    >
                      <option value="">Todas</option>
                      {wikiFilters.conditions.map((condition, index) => (
                        <option key={index} value={condition}>
                          {condition}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="filter-brand" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Marca
                    </label>
                    <select
                      id="filter-brand"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                      value={selectedBrand}
                      onChange={(event) => setSelectedBrand(event.target.value)}
                    >
                      <option value="">Todas</option>
                      {wikiFilters.brands.map((brand, index) => (
                        <option key={index} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="filter-routine" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rotina de uso
                    </label>
                    <select
                      id="filter-routine"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                      value={selectedRoutine}
                      onChange={(event) => setSelectedRoutine(event.target.value)}
                    >
                      <option value="">Todas</option>
                      {wikiFilters.routines.map((routine, index) => (
                        <option key={index} value={routine}>
                          {routine}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="filter-level" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nível de experiência
                    </label>
                    <select
                      id="filter-level"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                      value={selectedLevel}
                      onChange={(event) => setSelectedLevel(event.target.value)}
                    >
                      <option value="">Todos</option>
                      {wikiFilters.experienceLevels.map((level, index) => (
                        <option key={index} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{activeFilters} filtros ativos</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-full border border-cyan-200 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    Limpar filtros
                  </button>
                </div>
              </fieldset>
            </form>
          </div>
        </header>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6 md:px-10">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Acesso rápido</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {quickLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
              >
                <BookOpenCheck className="h-6 w-6 text-cyan-600 group-hover:text-cyan-700" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.label}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6 md:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Taxonomia de categorias</h2>
              <p className="text-slate-600">
                Navegue por tópicos clínicos, de cuidado diário ou estilo de vida. Cada categoria exibe o volume de conteúdos disponíveis e integra links cruzados para aprofundamento.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {wikiCategories.map((category) => {
                  const relatedCount = wikiTopics.filter((topic) => topic.categoryId === category.id).length;
                  return (
                    <a
                      key={category.id}
                      href={`#categoria-${category.id}`}
                      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold uppercase tracking-wide text-cyan-600">{category.name}</span>
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                          {relatedCount} tópicos
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{category.description}</p>
                    </a>
                  );
                })}
              </div>
            </div>
            <aside className="w-full max-w-xs space-y-4 rounded-3xl border border-cyan-100 bg-white p-5 shadow-md">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Tag className="h-5 w-5 text-cyan-600" />
                Sistema de tags
              </h3>
              <p className="text-sm text-slate-600">Filtre rapidamente por finalidade clínica, material ou nível de experiência.</p>
              <div className="flex flex-wrap gap-2">
                {tagUsage.map((tag) => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      tag.count > 0 ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    #{tag.label}
                    <span className="rounded-full bg-white/70 px-2 text-[10px] font-bold text-slate-700">{tag.count}</span>
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-6xl px-6 md:px-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Resultados</h2>
            <span className="text-sm text-slate-500">{filteredTopics.length} tópicos encontrados</span>
          </div>
          <div className="mt-6 space-y-10">
            {groupedTopics.map((group) => (
              <article key={group.category.id} id={`categoria-${group.category.id}`} className="space-y-6">
                <header className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-cyan-600">{group.category.name}</span>
                  <h3 className="text-xl font-bold text-slate-900">{group.category.description}</h3>
                </header>
                <div className="space-y-8">
                  {group.topics.map((topic) => (
                    <section key={topic.id} id={topic.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                              {topic.level}
                            </span>
                            {topic.lensTypes.map((lens) => (
                              <span key={lens} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {lens}
                              </span>
                            ))}
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900">{topic.title}</h4>
                          <p className="text-base text-slate-600">{topic.summary}</p>
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-slate-500 md:w-64">
                          <div>
                            <span className="font-semibold text-slate-700">Condições: </span>
                            {topic.conditions.join(', ')}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Rotinas: </span>
                            {topic.routines.join(', ')}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Marcas destaque: </span>
                            {topic.brands.join(', ')}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 space-y-6">
                        {topic.contentSections.map((section, sectionIndex) => renderContentSection(section, sectionIndex))}
                      </div>
                      <div className="mt-6 flex flex-wrap items-center gap-2">
                        {topic.tags.map((tagId, tagIndex) => {
                          const tagObj = wikiTags.find((t) => t.id === tagId);
                          const tagLabel = tagObj ? tagObj.label : tagId;
                          return (
                            <span key={tagIndex} className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                              #{tagLabel}
                            </span>
                          );
                        })}
                      </div>
                      {crossLinkMap[topic.id] && (
                        <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                          <h5 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-700">
                            <Bookmark className="h-4 w-4" />
                            Sugestões relacionadas
                          </h5>
                          <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-cyan-900">
                            {crossLinkMap[topic.id].map((link) => (
                              <li key={link.toId}>
                                <a href={`#${link.toId}`} className="font-semibold text-cyan-700 underline-offset-2 hover:underline">
                                  {link.description}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  ))}
                </div>
              </article>
            ))}
            {groupedTopics.length === 0 && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                Nenhum resultado encontrado. Ajuste a busca ou redefina os filtros.
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-6xl px-6 md:px-10" id="checklist-seguranca">
          <div className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-red-800 md:text-3xl">
              <ShieldCheck className="h-7 w-7" />
              Checklist de segurança imprimível
            </h2>
            <p className="mt-2 text-sm text-red-900/90">
              Revise diariamente e imprima para manter próximo ao kit de lentes. Clique para gerar uma versão amigável para impressão.
            </p>
            <button
              type="button"
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Imprimir checklist
            </button>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {safetyChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 text-sm text-red-900">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-6xl px-6 md:px-10">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Galeria de recursos visuais</h2>
          <p className="mt-2 text-sm text-slate-600">
            Imagens, diagramas e infográficos obtidos após curadoria em repositórios profissionais, fabricantes e entidades de saúde ocular.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {imageResources.map((resource) => (
              <figure key={resource.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <img src={resource.url} alt={resource.description} className="h-56 w-full object-cover" loading="lazy" />
                <figcaption className="space-y-2 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{resource.title}</h3>
                  <p className="text-sm text-slate-600">{resource.description}</p>
                  <p className="text-xs text-slate-500">Fonte: {resource.source}</p>
                  <p className="text-xs text-slate-400">Licença: {resource.license} • Atualizado em {resource.lastUpdated}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-6xl px-6 md:px-10" id="faq">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Perguntas frequentes</h2>
          <div className="mt-6 space-y-4">
            {wikiFaq.map((faq) => (
              <details key={faq.question} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="cursor-pointer text-base font-semibold text-slate-800 transition group-open:text-cyan-700">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-6xl px-6 md:px-10" id="glossario">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Glossário técnico</h2>
          <dl className="mt-6 grid gap-4 md:grid-cols-2">
            {wikiGlossary.map((entry) => (
              <div key={entry.term} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <dt className="text-lg font-semibold text-cyan-700">{entry.term}</dt>
                <dd className="mt-2 text-sm text-slate-600">{entry.definition}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto mt-16 w-full max-w-6xl px-6 md:px-10" id="plano-editorial">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Plano editorial e governança</h2>
          <p className="mt-2 text-sm text-slate-600">{editorialPlan.cadence}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {editorialPlan.owners.map((owner) => (
              <div key={owner.role} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-700">{owner.role}</h3>
                <p className="mt-1 text-base font-semibold text-slate-900">{owner.name}</p>
                <p className="mt-2 text-sm text-slate-600">{owner.focus}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Marco</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Periodicidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Entregáveis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {editorialPlan.schedule.map((item) => (
                  <tr key={item.milestone} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-sm text-slate-600">{item.milestone}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.due}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.deliverables}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BookOpenCheck className="h-5 w-5 text-cyan-600" />
              Fontes principais consultadas
            </h3>
            <ul className="mt-3 list-disc list-inside space-y-2 text-sm text-slate-600">
              {editorialPlan.sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto mt-16 w-full max-w-6xl px-6 md:px-10">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Histórico de atualizações</h2>
          <ul className="mt-6 space-y-3">
            {updateLog.map((entry) => (
              <li key={entry.date} className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{entry.date}:</span> {entry.summary}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
};

export default ContactLensWikiPage;
