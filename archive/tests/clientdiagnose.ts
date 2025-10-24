const divider = () => console.log('─'.repeat(60));

const logSection = (title: string) => {
  console.log(`\n${title}`);
  divider();
};

type StorageStatus = { suporte: string; escrita: string; leitura: string; detalhe?: string };

type PerformanceMemory = Performance & {
  memory?: {
    totalJSHeapSize: number;
    usedJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
};

const formatBoolean = (value: boolean | undefined) => (value ? '✅' : '❌');

const runEnvironmentCheck = () => {
  logSection('🌐 Ambiente do Navegador');
  const nav = navigator;
  const perf = performance as PerformanceMemory;
  const memory = perf.memory
    ? `${Math.round((perf.memory.usedJSHeapSize / 1048576) * 100) / 100}MB / ${Math.round((perf.memory.jsHeapSizeLimit / 1048576) * 100) / 100}MB`
    : 'N/D';
  const info = {
    agente: nav.userAgent,
    plataforma: nav.platform,
    idiomas: nav.languages?.join(', ') ?? nav.language,
    online: formatBoolean(nav.onLine),
    fusoHorario: Intl.DateTimeFormat().resolvedOptions().timeZone,
    horaLocal: new Date().toString(),
    memoria: memory,
    processadores: navigator.hardwareConcurrency ?? 'N/D',
    touch: formatBoolean('ontouchstart' in window)
  };
  console.table(info);
};

const safeStorageTest = (storage: Storage | undefined, key: string): StorageStatus => {
  if (!storage) {
    return { suporte: '❌', escrita: '❌', leitura: '❌' };
  }
  const testKey = `${key}_diagnose`;
  const payload = `${Date.now()}_${Math.random()}`;
  try {
    storage.setItem(testKey, payload);
    const readBack = storage.getItem(testKey);
    storage.removeItem(testKey);
    return {
      suporte: '✅',
      escrita: readBack === payload ? '✅' : '❌',
      leitura: readBack === payload ? '✅' : '❌'
    };
  } catch (error) {
    return { suporte: '⚠️', escrita: '❌', leitura: '❌', detalhe: (error as Error).message };
  }
};

const runStorageCheck = () => {
  logSection('💾 Armazenamento Local');
  const localResult = safeStorageTest(window.localStorage, 'local');
  const sessionResult = safeStorageTest(window.sessionStorage, 'session');
  const cookieKey = `diagnose_cookie_${Date.now()}`;
  let cookieStatus: StorageStatus = { suporte: formatBoolean(navigator.cookieEnabled), escrita: 'N/D', leitura: 'N/D' };
  try {
    document.cookie = `${cookieKey}=1; path=/`;
    const canRead = document.cookie.includes(`${cookieKey}=1`);
    document.cookie = `${cookieKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    cookieStatus = { suporte: formatBoolean(navigator.cookieEnabled), escrita: formatBoolean(canRead), leitura: formatBoolean(canRead) };
  } catch (error) {
    cookieStatus = { suporte: '⚠️', escrita: '❌', leitura: '❌', detalhe: (error as Error).message };
  }
  console.table({ localStorage: localResult, sessionStorage: sessionResult, cookies: cookieStatus });
};

const runGraphicsCheck = () => {
  logSection('🎨 Gráficos e Renderização');
  const canvas = document.createElement('canvas');
  const webgl2 = canvas.getContext('webgl2');
  const webgl = webgl2 ? null : canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const ctx2d = canvas.getContext('2d');
  const support = {
    webgl2: formatBoolean(Boolean(webgl2)),
    webgl: formatBoolean(Boolean(webgl2 || webgl)),
    canvas2d: formatBoolean(Boolean(ctx2d)),
    pixelRatio: window.devicePixelRatio ?? 'N/D',
    largura: window.innerWidth,
    altura: window.innerHeight,
    profundidadeCor: window.screen.colorDepth
  };
  console.table(support);
};

const runNetworkCheck = () => {
  logSection('📡 Conectividade');
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection;
  const status = {
    tipoEfetivo: connection?.effectiveType ?? 'N/D',
    velocidade: connection?.downlink ? `${connection.downlink} Mbps` : 'N/D',
    latencia: connection?.rtt ? `${connection.rtt} ms` : 'N/D',
    economiaDados: connection?.saveData !== undefined ? formatBoolean(connection.saveData) : 'N/D',
    statusOnline: formatBoolean(navigator.onLine)
  };
  console.table(status);
};

const runMediaCheck = () => {
  logSection('🎥 Mídia e Comunicação');
  const mediaDevices = navigator.mediaDevices;
  const rtcSupport = typeof RTCPeerConnection !== 'undefined';
  const notificationPermission = typeof Notification !== 'undefined' ? Notification.permission : 'N/D';
  const capabilities = {
    mediaDevices: formatBoolean(Boolean(mediaDevices)),
    getUserMedia: formatBoolean(Boolean(mediaDevices?.getUserMedia)),
    mediaDevicesEnumerate: formatBoolean(Boolean(mediaDevices?.enumerateDevices)),
    rtcPeerConnection: formatBoolean(rtcSupport),
    notificationAPI: notificationPermission,
    clipboard: formatBoolean(Boolean(navigator.clipboard)),
    shareAPI: formatBoolean(Boolean((navigator as Navigator & { share?: unknown }).share))
  };
  console.table(capabilities);
};

const runPerformanceCheck = () => {
  logSection('⚙️ Desempenho e Recursos');
  const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  const navigation = navigationEntries[0];
  const metrics = {
    tempoCarregamento: navigation ? `${Math.round(navigation.loadEventEnd - navigation.startTime)} ms` : 'N/D',
    domContentLoaded: navigation ? `${Math.round(navigation.domContentLoadedEventEnd - navigation.startTime)} ms` : 'N/D',
    responseTime: navigation ? `${Math.round(navigation.responseEnd - navigation.requestStart)} ms` : 'N/D',
    transferencia: navigation ? `${Math.round(navigation.transferSize / 1024)} KB` : 'N/D',
    recursosCarregados: performance.getEntriesByType('resource').length,
    tempoInterativo: navigation ? `${Math.round(navigation.domInteractive - navigation.startTime)} ms` : 'N/D'
  };
  console.table(metrics);
};

const runSecurityCheck = async () => {
  logSection('🔐 Segurança e Permissões');
  const serviceWorkers = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistrations().catch(() => []) : [];
  const permissions = (navigator as Navigator & { permissions?: Permissions }).permissions;
  const permissionQueries: PermissionDescriptor[] = [
    { name: 'geolocation' },
    { name: 'notifications' },
    { name: 'camera' },
    { name: 'microphone' }
  ];
  const results: Record<string, string> = {};
  if (permissions && permissions.query) {
    await Promise.all(
      permissionQueries.map(async descriptor => {
        try {
          const status = await permissions.query(descriptor);
          results[descriptor.name] = status.state;
        } catch (error) {
          results[descriptor.name] = `erro: ${(error as Error).message}`;
        }
      })
    );
  } else {
    permissionQueries.forEach(descriptor => {
      results[descriptor.name] = 'N/D';
    });
  }
  console.table({
    serviceWorkersRegistrados: serviceWorkers.length,
    scopes: serviceWorkers.map(worker => worker.scope).join(', ') || 'Nenhum',
    protocoloSeguro: formatBoolean(window.isSecureContext),
    permissoes: results
  });
};

const runDiagnostics = async () => {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║            SARAIVA VISION - Diagnóstico do Navegador           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  runEnvironmentCheck();
  runStorageCheck();
  runGraphicsCheck();
  runNetworkCheck();
  runMediaCheck();
  runPerformanceCheck();
  await runSecurityCheck();
  console.log('\nDiagnóstico concluído.');
};

void runDiagnostics();
