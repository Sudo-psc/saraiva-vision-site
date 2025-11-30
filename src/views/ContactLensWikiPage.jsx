import React, { useMemo, useState } from 'react';
import { Search, Filter, Tag, BookOpenCheck, ShieldCheck, Sparkles, AlertTriangle, Bookmark, Eye, Droplet, Sun, Clock, Users, Glasses, Award, TrendingUp } from 'lucide-react';
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
      topic.tags.forEach((tag) => items.add(tag));
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
        topic.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch));
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

  const renderContentSection = (section) => {
    if (section.kind === 'paragraph') {
      return (
        <p key={section.title} className="text-slate-600 leading-relaxed mb-4">{section.content}</p>
      );
    }
    if (section.kind === 'list') {
      return (
        <div key={section.title} className="mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">{section.title}</h4>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
    if (section.kind === 'grid') {
      return (
        <div key={section.title} className="mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-3">{section.title}</h4>
          <div className="grid gap-4 md:grid-cols-3">
            {section.items.map((item) => (
              <div key={item.heading} className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4 shadow-sm">
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
        <div key={section.title} className="mb-6 overflow-hidden rounded-2xl border border-slate-200">
          <h4 className="px-4 pt-4 text-lg font-semibold text-slate-800 mb-3">{section.title}</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {section.headers.map((header) => (
                    <th
                      key={header}
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
          key={section.content}
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 mb-6 ${
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
          <div className="rounded-3xl bg-gradient-to-br from-white via-cyan-50/30 to-white p-8 shadow-2xl ring-1 ring-cyan-200">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <Eye className="h-8 w-8 text-cyan-600" />
                  <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-700">
                    <Sparkles className="h-4 w-4" />
                    Enciclopédia Completa de Lentes de Contato
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold leading-tight bg-gradient-to-r from-slate-900 via-cyan-800 to-slate-900 bg-clip-text text-transparent md:text-5xl">
                  Guia Definitivo de Lentes de Contato
                </h1>
                <p className="max-w-2xl text-base text-slate-700 md:text-lg leading-relaxed">
                  Explore o conhecimento completo sobre lentes de contato: fundamentos científicos, materiais de última geração, protocolos clínicos validados, técnicas de adaptação profissional e práticas de segurança baseadas em evidências. Um recurso completo para usuários, profissionais e curiosos.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm text-cyan-900">
                    <BookOpenCheck className="h-4 w-4" />
                    <span className="font-semibold">{wikiTopics.length}+ tópicos</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
                    <Award className="h-4 w-4" />
                    <span className="font-semibold">Conteúdo validado</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-900">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold">Atualizado mensalmente</span>
                  </div>
                </div>
              </div>
              <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 px-8 py-6 text-center text-cyan-800 shadow-lg md:w-72">
                <ShieldCheck className="h-12 w-12 text-cyan-600" />
                <div>
                  <p className="text-base font-bold text-cyan-900">Conteúdo Clinicamente Revisado</p>
                  <p className="mt-1 text-xs text-cyan-800">Dr. Philipe Saraiva Cruz</p>
                  <p className="text-xs text-cyan-700">CRM-MG 69.870</p>
                </div>
                <div className="w-full border-t border-cyan-200 pt-3">
                  <p className="text-xs font-semibold text-cyan-900">Última atualização</p>
                  <p className="text-xs text-cyan-700">{updateLog[0].date}</p>
                </div>
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
                  {suggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
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
                      {wikiFilters.lensTypes.map((lens) => (
                        <option key={lens} value={lens}>
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
                      {wikiFilters.conditions.map((condition) => (
                        <option key={condition} value={condition}>
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
                      {wikiFilters.brands.map((brand) => (
                        <option key={brand} value={brand}>
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
                      {wikiFilters.routines.map((routine) => (
                        <option key={routine} value={routine}>
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
                      {wikiFilters.experienceLevels.map((level) => (
                        <option key={level} value={level}>
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-3">Acesso Rápido aos Tópicos</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Navegue diretamente para as seções mais importantes e encontre as informações que você precisa rapidamente.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {quickLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group relative flex flex-col gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400 hover:shadow-2xl"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <div className="inline-flex rounded-xl bg-cyan-100 p-3 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                    <BookOpenCheck className="h-6 w-6" />
                  </div>
                </div>
                <div className="relative">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-700 transition-colors duration-300">{item.label}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6 md:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-3">Explore por Categoria</h2>
                <p className="text-slate-600 max-w-xl">
                  Navegue por tópicos clínicos, cuidados diários e estilo de vida. Cada categoria apresenta conteúdo especializado com referências cruzadas para aprofundamento.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {wikiCategories.map((category, index) => {
                  const relatedCount = wikiTopics.filter((topic) => topic.categoryId === category.id).length;
                  const categoryIcons = [
                    <Glasses className="h-6 w-6" />,
                    <ShieldCheck className="h-6 w-6" />,
                    <Droplet className="h-6 w-6" />,
                    <Eye className="h-6 w-6" />,
                    <AlertTriangle className="h-6 w-6" />,
                    <Sparkles className="h-6 w-6" />,
                    <Sun className="h-6 w-6" />,
                    <Clock className="h-6 w-6" />,
                    <TrendingUp className="h-6 w-6" />,
                    <Users className="h-6 w-6" />
                  ];
                  return (
                    <a
                      key={category.id}
                      href={`#categoria-${category.id}`}
                      className="group flex flex-col gap-4 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 p-2.5 text-cyan-700 group-hover:from-cyan-600 group-hover:to-cyan-700 group-hover:text-white transition-all duration-300">
                            {categoryIcons[index % categoryIcons.length]}
                          </div>
                          <span className="text-sm font-bold uppercase tracking-wide text-cyan-700 group-hover:text-cyan-800">
                            {category.name}
                          </span>
                        </div>
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800 group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
                          {relatedCount} {relatedCount === 1 ? 'tópico' : 'tópicos'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700">
                        {category.description}
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>
            <aside className="w-full lg:w-80 space-y-4 rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-white to-cyan-50/30 p-6 shadow-lg sticky top-24">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-cyan-100 p-2">
                  <Tag className="h-5 w-5 text-cyan-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Sistema de Tags</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Filtre rapidamente por finalidade clínica, tipo de material ou nível de experiência para encontrar exatamente o que procura.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {tagUsage.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSearchTerm(tag.label)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      tag.count > 0 
                        ? 'bg-cyan-100 text-cyan-800 hover:bg-cyan-600 hover:text-white cursor-pointer shadow-sm hover:shadow-md' 
                        : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={tag.count === 0}
                  >
                    #{tag.label}
                    <span className="rounded-full bg-white/80 px-2 text-[10px] font-bold text-slate-700">
                      {tag.count}
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="mx-auto mt-8 w-full max-w-6xl px-6 md:px-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Resultados</h2>
            <span className="text-sm text-slate-500">{filteredTopics.length} tópicos encontrados</span>
          </div>
          <div className="mt-6 space-y-8">
            {groupedTopics.map((group) => (
              <article key={group.category.id} id={`categoria-${group.category.id}`} className="space-y-4">
                <header className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-cyan-600">{group.category.name}</span>
                  <h3 className="text-xl font-bold text-slate-900">{group.category.description}</h3>
                </header>
                <div className="space-y-6">
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
                      <div className="mt-4 space-y-4">
                        {topic.contentSections.map((section) => renderContentSection(section))}
                      </div>
                      <div className="mt-6 flex flex-wrap items-center gap-2">
                        {topic.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                            #{tag}
                          </span>
                        ))}
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

        <section className="mx-auto mt-12 w-full max-w-6xl px-6 md:px-10" id="checklist-seguranca">
          <div className="rounded-3xl bg-gradient-to-br from-red-50 via-orange-50 to-red-50 p-8 shadow-2xl border-2 border-red-200">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="inline-flex rounded-2xl bg-red-100 p-4">
                  <ShieldCheck className="h-12 w-12 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="flex items-center gap-3 text-3xl font-bold text-red-900 md:text-4xl mb-3">
                  Checklist de Segurança Essencial
                </h2>
                <p className="text-base text-red-800 mb-4 leading-relaxed">
                  Revise diariamente estas práticas fundamentais para manter a saúde dos seus olhos. Imprima e mantenha próximo ao seu kit de lentes para consulta rápida.
                </p>
                <button
                  type="button"
                  onClick={() => typeof window !== 'undefined' && window.print()}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-red-700 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Bookmark className="h-4 w-4" />
                  Imprimir Checklist Completo
                </button>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {safetyChecklist.map((item, index) => (
                <div key={item} className="flex items-start gap-4 rounded-2xl bg-white/90 p-5 shadow-md border border-red-100 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-sm text-red-900 leading-relaxed font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-white/80 p-6 border-2 border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">Importante:</h3>
                  <p className="text-sm text-red-800 leading-relaxed">
                    O não cumprimento destas diretrizes pode resultar em complicações graves, incluindo infecções oculares, úlceras de córnea e até perda de visão. Em caso de dúvida, sempre consulte seu oftalmologista.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6 md:px-10" id="faq">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-3">Perguntas Frequentes</h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Respostas claras e baseadas em evidências para as dúvidas mais comuns sobre lentes de contato.
            </p>
          </div>
          <div className="space-y-4">
            {wikiFaq.map((faq, index) => (
              <details 
                key={faq.question} 
                className="group rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-cyan-300"
              >
                <summary className="flex cursor-pointer items-start gap-4 text-base font-bold text-slate-800 transition-colors duration-200 group-open:text-cyan-700 list-none">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700 group-open:bg-cyan-600 group-open:text-white transition-colors duration-200">
                      {index + 1}
                    </div>
                  </div>
                  <span className="flex-1 leading-relaxed">{faq.question}</span>
                  <svg className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pl-12 text-sm leading-relaxed text-slate-600 border-l-4 border-cyan-200 pl-6">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6 md:px-10" id="glossario">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-3">Glossário Técnico</h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Termos técnicos e científicos explicados de forma clara e acessível.
            </p>
          </div>
          <dl className="grid gap-6 md:grid-cols-2">
            {wikiGlossary.map((entry) => (
              <div 
                key={entry.term} 
                className="group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-cyan-50/30 p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:border-cyan-300 hover:-translate-y-1"
              >
                <dt className="flex items-center gap-2 text-lg font-bold text-cyan-700 mb-3 group-hover:text-cyan-800">
                  <BookOpenCheck className="h-5 w-5" />
                  {entry.term}
                </dt>
                <dd className="text-sm text-slate-700 leading-relaxed pl-7">
                  {entry.definition}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6 md:px-10" id="plano-editorial">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-3">Plano Editorial e Governança</h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {editorialPlan.cadence}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {editorialPlan.owners.map((owner, index) => {
              const ownerIcons = [
                <Award className="h-6 w-6" />,
                <Users className="h-6 w-6" />,
                <BookOpenCheck className="h-6 w-6" />
              ];
              return (
                <div 
                  key={owner.role} 
                  className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
                      {ownerIcons[index % ownerIcons.length]}
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-700">
                      {owner.role}
                    </h3>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mb-2">{owner.name}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{owner.focus}</p>
                </div>
              );
            })}
          </div>
          <div className="overflow-hidden rounded-3xl border-2 border-slate-200 shadow-lg mb-8">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-100 to-cyan-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Marco</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Periodicidade</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-700">Entregáveis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {editorialPlan.schedule.map((item, index) => (
                  <tr key={item.milestone} className={`transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-cyan-50/30`}>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.milestone}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.due}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.deliverables}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-white to-cyan-50/30 p-8 shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="rounded-lg bg-cyan-100 p-3">
                <BookOpenCheck className="h-6 w-6 text-cyan-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Fontes Principais Consultadas
              </h3>
            </div>
            <ul className="grid md:grid-cols-2 gap-3">
              {editorialPlan.sources.map((source) => (
                <li key={source} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-600 flex-shrink-0" />
                  <span>{source}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6 md:px-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl mb-3">Histórico de Atualizações</h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Acompanhe as melhorias e novos conteúdos adicionados à enciclopédia.
            </p>
          </div>
          <div className="space-y-4">
            {updateLog.map((entry, index) => (
              <div 
                key={entry.date} 
                className="group relative rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-cyan-300"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 text-sm font-bold text-cyan-700 group-hover:from-cyan-600 group-hover:to-cyan-700 group-hover:text-white transition-all duration-300">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                        <Clock className="h-3 w-3" />
                        {entry.date}
                      </span>
                      {index === 0 && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          Mais recente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{entry.summary}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
};

export default ContactLensWikiPage;
