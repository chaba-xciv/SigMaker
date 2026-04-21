import { useState, useEffect } from 'react';
import { Terminal, CloudSun, Copy, Check, ExternalLink, ShieldAlert, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'hacker' | 'weather'>('hacker');
  const [city, setCity] = useState('Bangkok');
  const [copied, setCopied] = useState<string | null>(null);
  
  // We use relative paths for internal previews to avoid URL resolution issues in dev/preview
  const previewHackerUrl = `/api/sig/hacker`;
  const previewWeatherUrl = `/api/sig/weather?city=${encodeURIComponent(city)}`;
  
  // For copied code and direct links, we need the full URL
  const getFullUrl = (path: string) => {
    const rawUrl = process.env.VITE_APP_URL;
    const base = (rawUrl && !rawUrl.includes('MY_APP_URL')) ? rawUrl : window.location.origin;
    return `${base.replace(/\/$/, '')}${path}`;
  };

  const fullHackerUrl = getFullUrl(previewHackerUrl);
  const fullWeatherUrl = getFullUrl(previewWeatherUrl);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const bbCode = (url: string) => `[img]${url}[/img]`;
  const htmlCode = (url: string) => `<img src="${url}" alt="Dynamic Sig" />`;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">V1.0.0 Stable</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
            Forum <span className="text-emerald-400 font-mono italic">Sig</span>Maker
          </h1>
          <p className="text-zinc-400 max-w-xl text-lg leading-relaxed">
            Create dynamic signatures that work on strict forums. No scripts allowed? 
            No problem. We use server-side generated SVG images.
          </p>
        </header>

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-8 w-fit">
          <button
            onClick={() => setActiveTab('hacker')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === 'hacker' 
                ? 'bg-zinc-800 text-emerald-400 shadow-xl' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Hacker Mode
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all text-sm font-medium ${
              activeTab === 'weather' 
                ? 'bg-zinc-800 text-blue-400 shadow-xl' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CloudSun className="w-4 h-4" />
            Weather Mode
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Side: Preview */}
          <div className="space-y-6">
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs uppercase font-mono tracking-widest text-zinc-500">Live Preview</h2>
                <div className="flex gap-1.5 font-mono text-[9px] text-zinc-600 italic">
                  <span>450x80px SVG</span>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative overflow-hidden rounded-lg bg-black/40 p-4 border border-white/5 min-h-[114px] flex items-center justify-center">
                   <img 
                    src={activeTab === 'hacker' ? fullHackerUrl : fullWeatherUrl} 
                    alt="Preview" 
                    className="max-w-full drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    key={activeTab + (activeTab === 'weather' ? city : '')}
                  />
                </div>
              </div>

              {activeTab === 'weather' && (
                <div className="mt-6 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 px-1">Location Select</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter City Name..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hacker' && (
                <div className="mt-6 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex gap-3 italic">
                  <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-emerald-500/80 leading-snug">
                    This signature dynamically generates a personalized greeting for each visitor. 
                    It shows their IP, Location, and ISP info in real-time.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Code Output */}
          <div className="space-y-6">
            <div className="p-1 px-1.5 space-y-6">
              
              {/* BBCode Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded uppercase">BBCode (Forums)</span>
                  <button 
                    onClick={() => copyToClipboard(bbCode(activeTab === 'hacker' ? fullHackerUrl : fullWeatherUrl), 'bbcode')}
                    className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    {copied === 'bbcode' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied === 'bbcode' ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <div className="p-3 bg-black/50 border border-zinc-800 rounded-lg font-mono text-xs break-all text-zinc-300 leading-relaxed group relative">
                  {bbCode(activeTab === 'hacker' ? fullHackerUrl : fullWeatherUrl)}
                </div>
              </div>

              {/* HTML Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded uppercase">HTML Code</span>
                  <button 
                    onClick={() => copyToClipboard(htmlCode(activeTab === 'hacker' ? fullHackerUrl : fullWeatherUrl), 'html')}
                    className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    {copied === 'html' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied === 'html' ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <div className="p-3 bg-black/50 border border-zinc-800 rounded-lg font-mono text-xs break-all text-zinc-300 leading-relaxed">
                  {htmlCode(activeTab === 'hacker' ? fullHackerUrl : fullWeatherUrl)}
                </div>
              </div>

              {/* Direct Info */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 text-zinc-500">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                   Server Online
                </div>
                <a 
                  href={activeTab === 'hacker' ? fullHackerUrl : fullWeatherUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  Direct Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-zinc-800/50 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm">
            <h3 className="text-xs font-bold text-white mb-2 italic">Why SVG Images?</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Standard GIF or PNG images are static. SVG rendered by our Express server 
              allows real-time data injection. Because it's an image file format, 
              forums that block scripts still allow them to load.
            </p>
          </div>
          <p className="text-[10px] text-zinc-600 font-mono">
            &copy; {new Date().getFullYear()} SIGMAKER DYNAMIC SYSTEMS // BY PONGPAT
          </p>
        </footer>
      </main>
    </div>
  );
}
