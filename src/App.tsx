import { useState, useEffect } from 'react';
import { Terminal, CloudSun, Copy, Check, ExternalLink, ShieldAlert, Zap, Globe, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'hacker' | 'weather'>('hacker');
  const [city, setCity] = useState('Bangkok');
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Detect user's system preference on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
  }, []);
  
  const [sigTheme, setSigTheme] = useState('ocean');
  // Removed scale and debouncedScale

  const [copied, setCopied] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{name: string, admin1?: string, country?: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState('Bangkok');

  // Fetch Autocomplete Suggestions
  useEffect(() => {
    if (searchInput.length < 2) {
      setSuggestions([]);
      return;
    }
    
    // Only fetch if they are actually typing, not just selected
    if (searchInput === city) return;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchInput)}&count=5&language=en&format=json`);
        const data = await res.json();
        if (data.results) {
          setSuggestions(data.results);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    }, 400); // 400ms debounce for typing

    return () => clearTimeout(timer);
  }, [searchInput, city]);

  // We use relative paths for internal previews to avoid URL resolution issues in dev/preview
  const previewHackerUrl = `/api/sig/hacker?theme=${sigTheme}`;
  const previewWeatherUrl = `/api/sig/weather?city=${encodeURIComponent(city)}&theme=${sigTheme}`;
  
  // For copied code and direct links, we need the full URL
  const getFullUrl = (path: string) => {
    const rawUrl = process.env.VITE_APP_URL;
    const base = (rawUrl && !rawUrl.includes('MY_APP_URL')) ? rawUrl : window.location.origin;
    return `${base.replace(/\/$/, '')}${path}`;
  };

  const fullHackerUrl = getFullUrl(previewHackerUrl);
  const fullWeatherUrl = getFullUrl(previewWeatherUrl);
  
  const getActiveUrl = () => {
    if (activeTab === 'hacker') return fullHackerUrl;
    return fullWeatherUrl;
  };
  const siteLink = getFullUrl('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Wrapped with links back to the website
  const bbCode = (url: string) => `[url=${siteLink}][img]${url}[/img][/url]`;
  const htmlCode = (url: string) => `<a href="${siteLink}" target="_blank"><img src="${url}" alt="Dynamic Sig" /></a>`;

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30 transition-colors duration-300 relative">
        
        {/* Background Decor */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        {/* Compact Navbar (Always at top) */}
        <header className="flex-none p-4 lg:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md z-20 shadow-sm">
          <div className="max-w-[1400px] w-full mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Forum <span className="text-emerald-500 dark:text-emerald-400 font-mono italic">Sig</span>Maker
                </h1>
                <div className="hidden sm:flex items-center px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-emerald-600 dark:text-emerald-400">V1.0</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Server-side dynamically generated signatures for strict forums.</p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Tab Switcher inside Header */}
              <div className="flex p-0.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-inner flex-1 sm:flex-none">
                <button
                  onClick={() => setActiveTab('hacker')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all text-[11px] uppercase tracking-wider font-bold whitespace-nowrap ${
                    activeTab === 'hacker' 
                      ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Hacker
                </button>
                <button
                  onClick={() => setActiveTab('weather')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all text-[11px] uppercase tracking-wider font-bold whitespace-nowrap ${
                    activeTab === 'weather' 
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <CloudSun className="w-3.5 h-3.5" />
                  Weather
                </button>
              </div>
              
              {/* Theme Switcher */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm shrink-0"
                title="Toggle Light/Dark Interface"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace (Beautifully spaced floating UI) */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:py-12 lg:px-8 flex flex-col lg:flex-row gap-8 relative z-10 items-start">
          
          {/* Left Column: Config */}
          <aside className="w-full lg:w-[380px] xl:w-[420px] flex flex-col shrink-0">
            <div className="p-6 md:p-8 bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl backdrop-blur-xl shadow-sm flex flex-col gap-8 min-h-[500px]">
              
              <div className="flex-1">
                <h3 className="text-xs uppercase font-mono tracking-widest text-slate-800 dark:text-white font-bold flex items-center gap-2 mb-6">
                   <ShieldAlert className="w-4 h-4 text-emerald-500" /> Options
                </h3>

                {activeTab === 'weather' && (
                  <div className="space-y-3 relative mb-6">
                    <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-widest">Location Select</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={searchInput}
                        onChange={(e) => {
                          setSearchInput(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                             setCity(e.currentTarget.value);
                             setShowSuggestions(false);
                          }
                        }}
                        placeholder="Search for a city..."
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                      />
                      <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 text-sm"
                          >
                            {suggestions.map((s, idx) => (
                              <button
                                key={idx}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800 flex flex-col transition-colors border-b border-slate-100 dark:border-zinc-800/50 last:border-0"
                                onClick={() => {
                                  setSearchInput(s.name);
                                  setCity(s.name);
                                  setShowSuggestions(false);
                                }}
                              >
                                <span className="text-slate-800 dark:text-zinc-200 font-medium">{s.name}</span>
                                <span className="text-[10px] text-slate-500">{[s.admin1, s.country].filter(Boolean).join(', ')}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {activeTab === 'hacker' && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5" /> Auto-Detection Active
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-zinc-400 leading-relaxed">
                      Dynamically extracts visitor's IP, geographic location, and ISP automatically on load. No configuration needed.
                    </p>
                  </div>
                )}

                <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-zinc-800/50">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-widest">Image Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'dark', name: 'Dark', colorClass: 'bg-[#09090b]' },
                      { id: 'ocean', name: 'Ocean', colorClass: 'bg-[#0ea5e9]' },
                      { id: 'emerald', name: 'Emerald', colorClass: 'bg-[#10b981]' },
                      { id: 'cyberpunk', name: 'Cyberpunk', colorClass: 'bg-[#ec4899]' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSigTheme(t.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                          sigTheme === t.id 
                            ? 'bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-300 dark:ring-zinc-500' 
                            : 'bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800/80 shadow-inner'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full shadow-sm border border-black/10 ${t.colorClass}`} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

               <div className="mt-auto pt-8 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest border-t border-slate-200 dark:border-zinc-800/50">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                     Service Health: Optimal
                  </div>
                </div>
            </div>
          </aside>

          {/* Right Column: Preview (Top) & Output Codes (Bottom) */}
          <section className="flex-1 flex flex-col gap-6 w-full min-w-0">
            
            {/* Top: Massive Preview Area with Natural Aspect */}
            <div className="w-full bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl backdrop-blur-xl shadow-sm flex flex-col overflow-hidden relative min-h-[300px] lg:min-h-[400px]">
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none px-4">
                 <h2 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 dark:text-zinc-500 bg-white/60 dark:bg-zinc-900/60 px-3 py-1 rounded-full backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 shadow-sm">Live Adaptive Scaling</h2>
              </div>
              <div className="flex-1 relative flex items-center justify-center p-8 lg:p-16 overflow-hidden bg-slate-100/50 dark:bg-black/20">
                 {/* Decorative glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                 
                 <div className="relative w-full max-w-4xl flex justify-center items-center">
                    <img 
                      src={getActiveUrl()} 
                      alt="Preview Signature" 
                      className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-300"
                      key={activeTab + city + sigTheme}
                    />
                 </div>
              </div>
            </div>

            {/* Bottom: Fast Copy Codes in a beautiful grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              
              {/* BBCode */}
              <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl backdrop-blur-xl p-6 flex flex-col gap-4 shadow-sm">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-950 px-3 py-1.5 rounded-lg uppercase border border-slate-200 dark:border-zinc-800/80">BBCode (Forums)</span>
                    <button 
                      onClick={() => copyToClipboard(bbCode(getActiveUrl()), 'bbcode')}
                      className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {copied === 'bbcode' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copied === 'bbcode' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center shadow-inner overflow-x-auto relative mt-auto">
                    <code className="font-mono text-xs text-slate-600 dark:text-zinc-400 whitespace-nowrap pl-1 pr-4 w-full select-all">{bbCode(getActiveUrl())}</code>
                  </div>
              </div>

              {/* HTML */}
              <div className="bg-white/80 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-3xl backdrop-blur-xl p-6 flex flex-col gap-4 shadow-sm">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-950 px-3 py-1.5 rounded-lg uppercase border border-slate-200 dark:border-zinc-800/80">HTML (Websites)</span>
                    <div className="flex items-center gap-4">
                      <a href={getActiveUrl()} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-500 hover:text-blue-500 transition-colors">
                        Test Link <ExternalLink className="w-3 h-3" />
                      </a>
                      <button 
                        onClick={() => copyToClipboard(htmlCode(getActiveUrl()), 'html')}
                        className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {copied === 'html' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copied === 'html' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center shadow-inner overflow-x-auto relative mt-auto">
                    <code className="font-mono text-xs text-slate-600 dark:text-zinc-400 whitespace-nowrap pl-1 pr-4 w-full select-all">{htmlCode(getActiveUrl())}</code>
                  </div>
              </div>

            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
