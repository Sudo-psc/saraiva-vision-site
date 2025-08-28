import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Accessibility as AccessibilityIcon,
  X,
  Type,
  Minus,
  Plus,
  Contrast,
  Eye,
  EyeOff,
  Highlighter,
  Volume2,
  VolumeX,
  Keyboard,
  MousePointer,
  SunMoon,
  Zap,
  RefreshCw,
  Globe2,
  BookOpen,
  PauseCircle,
  PlayCircle,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper to announce changes to screen readers
const ariaAnnounce = (msg) => {
  const el = document.createElement('div');
  el.className = 'sr-only';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1200);
};

// Default accessibility state
const defaultState = {
  fontScale: 1,
  letterSpacing: 0,
  wordSpacing: 0,
  contrast: 'normal', // normal | high | dark | invert
  readingRuler: false,
  highlightHeadings: false,
  highlightLinks: false,
  pauseAnimations: false,
  ttsEnabled: false,
  ttsSpeaking: false,
  libras: false,
  muteMedia: false,
  keyboardNav: true,
  virtualKeyboard: false,
  zoom: 1,
  profile: null,
  dyslexiaMode: false,
  adhdMode: false,
  colorBlindMode: false,
  epilepsySafe: false,
};

// Predefined profiles mapping
const profiles = {
  cegueira: { ttsEnabled: true, keyboardNav: true, highlightHeadings: true, highlightLinks: true, fontScale: 1.2, contrast: 'high' },
  'baixa-visao': { fontScale: 1.3, zoom: 1.2, contrast: 'high', letterSpacing: 1, wordSpacing: 2, highlightLinks: true },
  motor: { keyboardNav: true, fontScale: 1.1 },
  daltonismo: { colorBlindMode: true, contrast: 'high' },
  epilepsia: { epilepsySafe: true, pauseAnimations: true, contrast: 'normal' },
  tdah: { adhdMode: true, highlightHeadings: true },
  dislexia: { dyslexiaMode: true, letterSpacing: 1, wordSpacing: 2, fontScale: 1.15 },
  'deficiencia-auditiva': { muteMedia: false, libras: true },
};

const Accessibility = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });
  const panelRef = useRef(null);
  const rulerRef = useRef(null);
  const speechRef = useRef(null);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(state));
  }, [state]);

  // Apply global effects
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--a11y-font-scale', state.fontScale);
    root.style.fontSize = `${16 * state.fontScale}px`;
    root.style.setProperty('--a11y-letter-spacing', `${state.letterSpacing}px`);
    root.style.setProperty('--a11y-word-spacing', `${state.wordSpacing}px`);
    root.style.setProperty('--a11y-zoom', state.zoom);
    document.body.style.transform = `scale(${state.zoom})`;
    document.body.style.transformOrigin = 'top left';

    root.classList.toggle('a11y-contrast-high', state.contrast === 'high');
    root.classList.toggle('a11y-dark', state.contrast === 'dark');
    root.classList.toggle('a11y-invert', state.contrast === 'invert');
    root.classList.toggle('a11y-highlight-headings', state.highlightHeadings);
    root.classList.toggle('a11y-highlight-links', state.highlightLinks);
    root.classList.toggle('a11y-pause-animations', state.pauseAnimations);
    root.classList.toggle('a11y-dyslexia', state.dyslexiaMode);
    root.classList.toggle('a11y-adhd', state.adhdMode);
    root.classList.toggle('a11y-color-blind', state.colorBlindMode);
    root.classList.toggle('a11y-epilepsy-safe', state.epilepsySafe);

    if (state.muteMedia) {
      document.querySelectorAll('audio,video').forEach(el => { el.muted = true; });
    }
  }, [state]);

  // Reading ruler
  useEffect(() => {
    if (state.readingRuler) {
      const ruler = document.createElement('div');
      rulerRef.current = ruler;
      ruler.setAttribute('aria-hidden', 'true');
      ruler.style.cssText = 'position:fixed;left:0;right:0;height:2.2em;background:rgba(186,104,200,0.18);pointer-events:none;z-index:9998;mix-blend-mode:multiply;transition:top .05s ease;';
      document.body.appendChild(ruler);
      const move = (e) => { ruler.style.top = `${e.clientY - 18}px`; };
      window.addEventListener('mousemove', move);
      return () => { window.removeEventListener('mousemove', move); ruler.remove(); };
    } else if (rulerRef.current) {
      rulerRef.current.remove();
      rulerRef.current = null;
    }
  }, [state.readingRuler]);

  // Text to speech basic implementation (reads main content)
  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      ariaAnnounce('Leitor de texto não suportado no navegador.');
      return;
    }
    const synth = window.speechSynthesis;
    if (speechRef.current) {
      synth.cancel();
      speechRef.current = null;
      setState(s => ({ ...s, ttsSpeaking: false }));
      return;
    }
    const text = document.body.innerText.slice(0, 12000); // limit
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = i18n.language === 'pt' ? 'pt-BR' : 'en-US';
    speechRef.current = utter;
    utter.onend = () => { setState(s => ({ ...s, ttsSpeaking: false })); speechRef.current = null; };
    synth.speak(utter);
    setState(s => ({ ...s, ttsSpeaking: true }));
  }, [i18n.language]);

  // Libras (stub: inject VLibras script) – only once
  useEffect(() => {
    if (state.libras && !document.getElementById('vlibras-plugin')) {
      const script = document.createElement('script');
      script.id = 'vlibras-plugin';
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.onload = () => { window.VLibras && new window.VLibras.Widget('https://vlibras.gov.br/app'); };
      document.body.appendChild(script);
    }
  }, [state.libras]);

  const updateState = (patch) => setState(s => ({ ...s, ...patch }));

  const cycleContrast = () => {
    const order = ['normal', 'high', 'dark', 'invert'];
    const idx = order.indexOf(state.contrast);
    updateState({ contrast: order[(idx + 1) % order.length] });
  };

  const applyProfile = (key) => {
    const conf = profiles[key];
    if (!conf) return;
    updateState({ ...conf, profile: key });
    ariaAnnounce(`Perfil ${key} aplicado`);
  };

  const resetAll = () => {
    updateState({ ...defaultState });
    ariaAnnounce('Configurações de acessibilidade restauradas');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
      if (e.altKey && e.key.toLowerCase() === 'a') { e.preventDefault(); setOpen(o => !o); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Focus trap (simple)
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    first && first.focus();
    return () => document.removeEventListener('keydown', trap);
  }, [open]);

  const Section = ({ title, icon: Icon, children }) => (
    <div className="mb-6">
      <h4 className="flex items-center gap-2 font-semibold text-sm text-slate-700 mb-3">
        <Icon size={16} className="text-purple-600" /> {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );

  const ToggleButton = ({ active, onClick, children, ariaLabel }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white flex items-center gap-1 ${active ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow' : 'bg-white/60 backdrop-blur border-slate-300 text-slate-700 hover:bg-white'}`}
    >
      {children}
    </button>
  );

  return (
    <>
      {/* Floating Button - Positioned to avoid overlap with CTA buttons */}
      <div className="fixed z-[90] bottom-32 right-4 sm:bottom-40 sm:right-6 flex flex-col items-end gap-2">
        <div className="relative group">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(o => !o)}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={t('accessibility.toggle', 'Acessibilidade')}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-xl flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 text-white border border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-600 backdrop-blur-sm"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
          >
            <AccessibilityIcon size={28} strokeWidth={1.5} className="sm:w-8 sm:h-8" />
          </motion.button>
          <div className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            Acessibilidade
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            role="dialog"
            aria-label="Menu de Acessibilidade"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35 }}
            ref={panelRef}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-white via-fuchsia-50 to-purple-50 shadow-2xl border-l border-purple-200/50 z-[95] flex flex-col focus:outline-none"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-purple-200/50 bg-white/60 backdrop-blur-sm">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <AccessibilityIcon size={20} className="text-purple-600" />
                Menu de Acessibilidade
              </h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="p-2 rounded-md hover:bg-purple-100 text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 text-slate-700 text-sm" style={{ scrollbarWidth: 'thin' }}>
              {/* Controle de Legibilidade */}
              <Section title="Controle de Legibilidade" icon={Type}>
                <div className="flex flex-wrap gap-2">
                  <ToggleButton ariaLabel="Diminuir fonte" onClick={() => updateState({ fontScale: Math.max(0.85, +(state.fontScale - 0.05).toFixed(2)) })}><Minus size={14} /> Fonte</ToggleButton>
                  <ToggleButton ariaLabel="Aumentar fonte" onClick={() => updateState({ fontScale: Math.min(1.6, +(state.fontScale + 0.05).toFixed(2)) })}><Plus size={14} /> Fonte</ToggleButton>
                  <ToggleButton active={state.letterSpacing > 0} ariaLabel="Aumentar espaçamento letras" onClick={() => updateState({ letterSpacing: state.letterSpacing ? 0 : 1 })}>Esp. Letras</ToggleButton>
                  <ToggleButton active={state.wordSpacing > 0} ariaLabel="Aumentar espaçamento palavras" onClick={() => updateState({ wordSpacing: state.wordSpacing ? 0 : 3 })}>Esp. Palavras</ToggleButton>
                  <ToggleButton active={state.contrast !== 'normal'} ariaLabel="Alterar contraste" onClick={cycleContrast}><Contrast size={14} /> {state.contrast}</ToggleButton>
                </div>
              </Section>

              {/* Apoio à Leitura */}
              <Section title="Apoio à Leitura" icon={BookOpen}>
                <div className="flex flex-wrap gap-2">
                  <ToggleButton active={state.ttsSpeaking} ariaLabel="Leitor de texto" onClick={handleSpeak}>{state.ttsSpeaking ? <PauseCircle size={14} /> : <PlayCircle size={14} />} Leitor</ToggleButton>
                  <ToggleButton active={state.readingRuler} ariaLabel="Régua de leitura" onClick={() => updateState({ readingRuler: !state.readingRuler })}>Régua</ToggleButton>
                  <ToggleButton active={state.highlightHeadings} ariaLabel="Destacar títulos" onClick={() => updateState({ highlightHeadings: !state.highlightHeadings })}><Highlighter size={14} /> Títulos</ToggleButton>
                  <ToggleButton active={state.highlightLinks} ariaLabel="Destacar links" onClick={() => updateState({ highlightLinks: !state.highlightLinks })}>Links</ToggleButton>
                  <ToggleButton active={state.pauseAnimations} ariaLabel="Pausar animações" onClick={() => updateState({ pauseAnimations: !state.pauseAnimations })}>Animações</ToggleButton>
                </div>
              </Section>

              {/* Comunicação Alternativa */}
              <Section title="Comunicação Alternativa" icon={Volume2}>
                <div className="flex flex-wrap gap-2">
                  <ToggleButton active={state.libras} ariaLabel="Ativar Libras" onClick={() => updateState({ libras: !state.libras })}>Libras</ToggleButton>
                  <ToggleButton active={state.muteMedia} ariaLabel="Silenciar mídia" onClick={() => updateState({ muteMedia: !state.muteMedia })}>{state.muteMedia ? <VolumeX size={14} /> : <Volume2 size={14} />} Som</ToggleButton>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Integração Libras via VLibras (carrega script externo).</p>
              </Section>

              {/* Navegação e Entrada */}
              <Section title="Navegação e Entrada" icon={Keyboard}>
                <div className="flex flex-wrap gap-2">
                  <ToggleButton active={state.keyboardNav} ariaLabel="Navegação teclado" onClick={() => updateState({ keyboardNav: !state.keyboardNav })}><MousePointer size={14} /> Teclado</ToggleButton>
                  <ToggleButton active={state.virtualKeyboard} ariaLabel="Teclado virtual" onClick={() => updateState({ virtualKeyboard: !state.virtualKeyboard })}><Keyboard size={14} /> Virtual</ToggleButton>
                  <ToggleButton ariaLabel="Zoom -" onClick={() => updateState({ zoom: Math.max(1, +(state.zoom - 0.1).toFixed(2)) })}>- Zoom</ToggleButton>
                  <ToggleButton ariaLabel="Zoom +" onClick={() => updateState({ zoom: Math.min(1.8, +(state.zoom + 0.1).toFixed(2)) })}>+ Zoom</ToggleButton>
                </div>
              </Section>

              {/* Perfis Pré-definidos */}
              <Section title="Perfis Pré-definidos" icon={Wand2}>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(profiles).map(p => (
                    <ToggleButton key={p} active={state.profile === p} ariaLabel={`Aplicar perfil ${p}`} onClick={() => applyProfile(p)}>{p}</ToggleButton>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Aplica combinações recomendadas (pode sobrepor suas escolhas).</p>
              </Section>

              {/* Outros Recursos */}
              <Section title="Outros Recursos" icon={RefreshCw}>
                <div className="flex flex-wrap gap-2">
                  <ToggleButton ariaLabel="Restaurar" onClick={resetAll}><RefreshCw size={14} /> Restaurar</ToggleButton>
                  <ToggleButton ariaLabel="Trocar idioma" onClick={() => i18n.changeLanguage(i18n.language === 'pt' ? 'en' : 'pt')}><Globe2 size={14} /> {i18n.language.toUpperCase()}</ToggleButton>
                  <ToggleButton active={state.dyslexiaMode} ariaLabel="Modo dislexia" onClick={() => updateState({ dyslexiaMode: !state.dyslexiaMode })}>Dislexia</ToggleButton>
                  <ToggleButton active={state.adhdMode} ariaLabel="Modo TDAH" onClick={() => updateState({ adhdMode: !state.adhdMode })}>TDAH</ToggleButton>
                  <ToggleButton active={state.colorBlindMode} ariaLabel="Modo daltonismo" onClick={() => updateState({ colorBlindMode: !state.colorBlindMode })}>Daltonismo</ToggleButton>
                  <ToggleButton active={state.epilepsySafe} ariaLabel="Modo epilepsia" onClick={() => updateState({ epilepsySafe: !state.epilepsySafe })}><Zap size={14} /> Epilepsia</ToggleButton>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Todos os recursos podem combinar-se. Use ESC para fechar rapidamente.</p>
              </Section>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Virtual Keyboard (basic) */}
      <AnimatePresence>
        {state.virtualKeyboard && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed bottom-0 inset-x-0 z-[92] bg-white/90 backdrop-blur border-t border-purple-200 px-4 py-3 grid grid-cols-14 gap-1 text-xs"
            aria-label="Teclado virtual"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
          >
            {'1234567890qwertyuiopasdfghjklçzxcvbnm'.split('').map(k => (
              <button key={k} className="px-2 py-2 rounded bg-purple-100 hover:bg-purple-200 text-slate-700 font-medium" onClick={() => {
                const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) { a.value += k; a.dispatchEvent(new Event('input', { bubbles: true })); }
              }}>{k}</button>
            ))}
            <button className="col-span-2 px-2 py-2 rounded bg-pink-500 text-white font-semibold" onClick={() => { const a = document.activeElement; if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) { a.value += ' '; a.dispatchEvent(new Event('input', { bubbles: true })); } }}>Espaço</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Styles */}
      <style jsx global>{`
        :root { --a11y-font-scale: 1; --a11y-letter-spacing: 0px; --a11y-word-spacing: 0px; --a11y-zoom:1; }
        body { letter-spacing: var(--a11y-letter-spacing); word-spacing: var(--a11y-word-spacing); }
        .a11y-contrast-high { filter: contrast(135%) brightness(105%); }
        .a11y-dark { background:#0f0f17 !important; color:#f1f5f9 !important; }
        .a11y-dark * { color: inherit !important; }
        .a11y-invert { filter: invert(1) hue-rotate(180deg); }
        .a11y-highlight-headings h1, .a11y-highlight-headings h2, .a11y-highlight-headings h3, .a11y-highlight-headings h4, .a11y-highlight-headings h5 { outline:3px solid #d946ef; outline-offset:2px; border-radius:4px; }
        .a11y-highlight-links a { outline:2px dashed #9333ea; outline-offset:2px; }
        .a11y-pause-animations *, .a11y-epilepsy-safe * { animation-play-state: paused !important; transition:none !important; }
        .a11y-dyslexia body, .a11y-dyslexia * { font-family: 'OpenDyslexic','Atkinson Hyperlegible', system-ui, sans-serif !important; }
        .a11y-adhd body { background-image: linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)), radial-gradient(circle at 10% 10%, #f5d0fe 0, transparent 60%), radial-gradient(circle at 90% 80%, #e0e7ff 0, transparent 55%); background-attachment: fixed; }
        .a11y-color-blind img { filter: saturate(120%) contrast(110%); }
        .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
        @media (prefers-reduced-motion: reduce) { * { animation-duration:0.01ms !important; animation-iteration-count:1 !important; transition-duration:0.01ms !important; } }
      `}</style>
    </>
  );
};

export default Accessibility;
