import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import SEOHead from '@/components/SEOHead';
import { useTranslation } from 'react-i18next';
import createDiagnostics from '@/utils/systemDiagnostics';

const statusStyles = {
  idle: 'bg-slate-200 text-slate-700',
  running: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-rose-100 text-rose-700',
};

const dotStyles = {
  idle: 'bg-slate-400',
  running: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
};

const formatLatency = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} s`;
  }

  return `${Math.round(value)} ms`;
};

const formatTimestamp = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
};

const createEmptyState = (definitions) => {
  return definitions.reduce((acc, definition) => {
    acc[definition.id] = {
      status: 'idle',
      data: null,
      messageId: null,
      messageParams: null,
      latency: null,
      lastRun: null,
    };
    return acc;
  }, {});
};

const CheckPage = () => {
  const { t, i18n } = useTranslation();
  const diagnostics = useMemo(() => createDiagnostics(), []);
  const [results, setResults] = useState(() => createEmptyState(diagnostics));
  const [isRunning, setIsRunning] = useState(false);
  const [lastCompletedAt, setLastCompletedAt] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, success, warning, error
  const [showDetails, setShowDetails] = useState(false);

  const seo = useMemo(
    () => ({
      title: t('check.seo.title'),
      description: t('check.seo.description'),
      keywords: t('check.seo.keywords'),
    }),
    [t, i18n.language]
  );

  useEffect(() => {
    setResults(createEmptyState(diagnostics));
  }, [diagnostics]);



  const runDiagnostics = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);

    for (const definition of diagnostics) {
      setResults((prev) => ({
        ...prev,
        [definition.id]: {
          ...prev[definition.id],
          status: 'running',
          data: null,
          messageId: null,
          messageParams: null,
          latency: null,
        },
      }));

      try {
        // eslint-disable-next-line no-await-in-loop
        const outcome = await definition.run();
        setResults((prev) => ({
          ...prev,
          [definition.id]: {
            status: outcome.status ?? 'error',
            data: outcome.data ?? null,
            messageId: outcome.messageId || null,
            messageParams: outcome.messageParams || null,
            latency: typeof outcome.latency === 'number' ? outcome.latency : null,
            lastRun: new Date().toISOString(),
          },
        }));
      } catch (error) {
        setResults((prev) => ({
          ...prev,
          [definition.id]: {
            status: 'error',
            data: null,
            messageId: 'unexpected',
            messageParams: { message: error?.message || 'Unknown error' },
            latency: null,
            lastRun: new Date().toISOString(),
          },
        }));
      }
    }

    setLastCompletedAt(new Date().toISOString());
    setIsRunning(false);
  }, [diagnostics, isRunning]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const resetResults = () => {
    if (isRunning) return;
    setResults(createEmptyState(diagnostics));
    setLastCompletedAt(null);
  };

  const getOverallStatus = () => {
    const statuses = Object.values(results).map(r => r.status);
    if (statuses.some(s => s === 'error')) return 'error';
    if (statuses.some(s => s === 'warning')) return 'warning';
    if (statuses.every(s => s === 'success')) return 'success';
    if (statuses.some(s => s === 'running')) return 'running';
    return 'idle';
  };

  const getStatusCounts = () => {
    const counts = { success: 0, warning: 0, error: 0, idle: 0, running: 0 };
    Object.values(results).forEach(r => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  };

  const filteredDiagnostics = useMemo(() => {
    if (filterStatus === 'all') return diagnostics;
    return diagnostics.filter(d => {
      const result = results[d.id];
      return result?.status === filterStatus;
    });
  }, [diagnostics, results, filterStatus]);

  const exportResults = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      clinic: 'Clínica Saraiva Vision',
      location: 'Caratinga, MG',
      overallStatus: getOverallStatus(),
      statusCounts: getStatusCounts(),
      tests: Object.entries(results).map(([id, result]) => ({
        id,
        name: t(`check.diagnostics.${id}.title`),
        status: result.status,
        latency: result.latency,
        data: result.status === 'success' ? null : result.data, // Only include data for failed tests
        lastRun: result.lastRun,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saraiva-vision-diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SEOHead {...seo} />
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                {t('check.badge')}
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
                {t('check.title')}
              </h1>
              <p className="mt-4 text-base md:text-lg text-slate-600 max-w-3xl">
                {t('check.subtitle')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-slate-600">
                  {lastCompletedAt
                    ? t('check.lastUpdated', { timestamp: formatTimestamp(lastCompletedAt) })
                    : t('check.neverRun')}
                </div>

                {/* Overall Status Summary */}
                {Object.keys(results).length > 0 && (
                  <div className="flex gap-4 text-xs text-slate-500">
                    {Object.entries(getStatusCounts()).map(([status, count]) =>
                      count > 0 ? (
                        <span key={status} className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${dotStyles[status] || dotStyles.idle}`} />
                          {count} {t(`check.status.${status}`).toLowerCase()}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">


                <button
                  type="button"
                  onClick={runDiagnostics}
                  disabled={isRunning}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${isRunning
                    ? 'bg-emerald-200 text-emerald-700 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                >
                  {isRunning ? t('check.running') : t('check.runButton')}
                </button>

                <button
                  type="button"
                  onClick={exportResults}
                  disabled={isRunning || !lastCompletedAt}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {t('check.exportReport')}
                </button>

                <button
                  type="button"
                  onClick={resetResults}
                  disabled={isRunning}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {t('check.resetButton')}
                </button>
              </div>
            </div>

            {/* Filter and Display Options */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-slate-100 rounded-lg">
              <div className="flex gap-2 items-center">
                <label className="text-sm font-medium text-slate-700">{t('check.filterByStatus')}:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="all">{t('check.filter.all')}</option>
                  <option value="success">{t('check.filter.success')}</option>
                  <option value="warning">{t('check.filter.warning')}</option>
                  <option value="error">{t('check.filter.error')}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-slate-600 hover:text-slate-900 underline"
              >
                {showDetails ? t('check.hideDetails') : t('check.showDetails')}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {filteredDiagnostics.map((definition) => {
              const result = results[definition.id];
              const status = result?.status || 'idle';
              const statusLabel = t(`check.status.${status}`);
              const translationParams = {
                ...definition.defaultParams,
                ...(result?.data || {}),
              };
              const latencyLabel = formatLatency(result?.latency);
              if (latencyLabel) {
                translationParams.latency = latencyLabel;
              }
              const countValue =
                typeof result?.data?.count === 'number'
                  ? result.data.count
                  : Array.isArray(result?.data?.records)
                    ? result.data.records.length
                    : undefined;
              if (typeof countValue === 'number') {
                translationParams.count = countValue;
              }
              if (typeof result?.data?.totalRoutes === 'number') {
                translationParams.totalRoutes = result.data.totalRoutes;
              }
              const missingRoutes = Array.isArray(result?.data?.missingRoutes)
                ? result.data.missingRoutes.join(', ')
                : result?.messageParams?.missing;
              if (missingRoutes) {
                translationParams.missing = missingRoutes;
              }

              const detailsKey = `check.diagnostics.${definition.id}.${status}`;
              const detailsText = t(detailsKey, {
                defaultValue: '',
                ...translationParams,
              });
              const hasCustomDetails = detailsText && detailsText !== detailsKey;

              const messageText = result?.messageId
                ? t(`check.messages.${result.messageId}`, {
                  ...definition.defaultParams,
                  ...(result?.messageParams || {}),
                  ...(result?.data || {}),
                  missing: translationParams.missing,
                  hostname: result?.data?.hostname || definition.defaultParams?.expected,
                })
                : null;

              return (
                <div
                  key={definition.id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {t(`check.diagnostics.${definition.id}.title`)}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {t(`check.diagnostics.${definition.id}.description`, definition.defaultParams)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.idle
                        }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${dotStyles[status] || dotStyles.idle}`} />
                      {statusLabel}
                    </span>
                  </div>

                  <div className="text-sm text-slate-700">
                    {status === 'idle' ? t('check.waiting') : null}
                    {status === 'running' ? t('check.running') : null}
                    {status !== 'idle' && status !== 'running' && hasCustomDetails ? (
                      <p>{detailsText}</p>
                    ) : null}
                    {status !== 'idle' && status !== 'running' && !hasCustomDetails && messageText ? (
                      <p>{messageText}</p>
                    ) : null}
                  </div>

                  {messageText && (status === 'success' || status === 'warning') && hasCustomDetails ? (
                    <div className="text-xs text-slate-500">
                      {messageText}
                    </div>
                  ) : null}

                  {definition.id === 'dns' && Array.isArray(result?.data?.records) && result.data.records.length > 0 ? (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                        {t('check.diagnostics.dns.recordsLabel')}
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {result.data.records.map((record) => (
                          <li key={record} className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md inline-block">
                            {record}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {definition.id === 'ip' && (result?.data?.ipv4?.length || result?.data?.ipv6?.length) ? (
                    <div className="grid gap-2 text-sm text-slate-700">
                      {Array.isArray(result?.data?.ipv4) && result.data.ipv4.length > 0 ? (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                            {t('check.diagnostics.ip.ipv4Label')}
                          </p>
                          <ul className="mt-1 flex flex-wrap gap-2">
                            {result.data.ipv4.map((record) => (
                              <li key={`ipv4-${record}`} className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md">
                                {record}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {Array.isArray(result?.data?.ipv6) && result.data.ipv6.length > 0 ? (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                            {t('check.diagnostics.ip.ipv6Label')}
                          </p>
                          <ul className="mt-1 flex flex-wrap gap-2">
                            {result.data.ipv6.map((record) => (
                              <li key={`ipv6-${record}`} className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md">
                                {record}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {definition.id === 'php' && typeof result?.data?.routes === 'number' ? (
                    <p className="text-xs text-slate-500">
                      {t('check.diagnostics.php.routesLabel', { routes: result.data.routes })}
                    </p>
                  ) : null}

                  {definition.id === 'nginx' && result?.data?.server ? (
                    <p className="text-xs text-slate-500">
                      {t('check.diagnostics.nginx.serverLabel', { server: result.data.server })}
                    </p>
                  ) : null}

                  {definition.id === 'database' && result?.data?.lastModified ? (
                    <p className="text-xs text-slate-500">
                      {t('check.diagnostics.database.lastModifiedLabel', {
                        date: new Date(result.data.lastModified).toLocaleDateString()
                      })}
                    </p>
                  ) : null}

                  {definition.id === 'assets' && typeof result?.data?.availability === 'string' ? (
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>{t('check.diagnostics.assets.availability')}: {result.data.availability}%</p>
                      <p>{t('check.diagnostics.assets.functionalResources', { successful: result.data.successful, total: result.data.assetsChecked })}</p>
                    </div>
                  ) : null}

                  {definition.id === 'security' && typeof result?.data?.score === 'number' ? (
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>{t('check.diagnostics.security.score')}: {result.data.score}%</p>
                      <p>{result.data.presentHeaders}/{result.data.totalHeaders} cabeçalhos presentes</p>
                      {result?.data?.missingHeaders && result.data.missingHeaders.length > 0 ? (
                        <p className="text-amber-600">
                          {t('check.diagnostics.security.missing')}: {result.data.missingHeaders.join(', ')}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {definition.id === 'performance' && result?.data?.grade ? (
                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>Nota de performance:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${result.data.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                          result.data.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            result.data.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                          }`}>
                          {result.data.grade}
                        </span>
                      </div>
                      <p>
                        Média: {result.data.averageLatency}ms
                        (min: {result.data.minLatency}ms, max: {result.data.maxLatency}ms)
                      </p>
                    </div>
                  ) : null}
                  {result?.lastRun ? (
                    <p className="text-xs text-slate-500">
                      {t('check.perCheckUpdated', { timestamp: formatTimestamp(result.lastRun) })}
                    </p>
                  ) : null}

                  {showDetails && result?.data && (
                    <details className="mt-3">
                      <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                        Dados técnicos
                      </summary>
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default CheckPage;
