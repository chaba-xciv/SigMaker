import axios from "axios";
import http from "http";
import https from "https";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

export default async function handler(req: any, res: any) {
  try {
    // Parameters
    const theme = (req.query.theme as string) || 'dark';
    const width = 400;
    const height = 80;

    // Provide color palettes
    const themes: Record<string, any> = {
      dark: { bg: '#09090b', terminalBar: '#18181b', stroke: '#27272a', textMain: '#10b981', textDim: '#a1a1aa', textHighlight: '#34d399', sysText: '#18181b' },
      ocean: { bg: '#0f172a', terminalBar: '#1e293b', stroke: '#334155', textMain: '#38bdf8', textDim: '#94a3b8', textHighlight: '#7dd3fc', sysText: '#1e293b' },
      emerald: { bg: '#022c22', terminalBar: '#064e3b', stroke: '#065f46', textMain: '#34d399', textDim: '#6ee7b7', textHighlight: '#a7f3d0', sysText: '#064e3b' },
      cyberpunk: { bg: '#2e1065', terminalBar: '#4c1d95', stroke: '#5b21b6', textMain: '#f472b6', textDim: '#d8b4fe', textHighlight: '#f9a8d4', sysText: '#4c1d95' }
    };
    const t = themes[theme] || themes.dark;

    // Get IP (handling proxies)
    const ip = (req.headers["x-forwarded-for"] as string || req.socket?.remoteAddress || "127.0.0.1").split(",")[0];
    
    // Fetch Geo info (Free API, rate limited, handle gracefully)
    let geoData = { status: 'fail', country: 'Unknown', isp: 'Unknown', city: 'Classified' };
    try {
      const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,city,isp,query`, { 
        timeout: 3000,
        httpAgent,
        httpsAgent
      });
      if (geoRes.data && geoRes.data.status === 'success') {
        geoData = geoRes.data;
      } else if (geoRes.data && geoRes.data.message && geoRes.data.message.includes('limit')) {
        geoData.city = "[RATE_LIMITED]";
        geoData.country = "[NETWORK]";
        geoData.isp = "[ANONYMOUS_ISP]";
      }
    } catch (err: any) {
      console.error("Geo lookup failed:", err.message || err);
      // Give a cool hacker fallback instead of breaking the image
      geoData.city = "[ENCRYPTED]";
      geoData.country = "[SECURE_NODE]";
      geoData.isp = "PROXY_SERVER";
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Construct SVG (Hacker Style)
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="80" fill="${t.bg}" rx="6" />
        <rect width="396" height="76" x="2" y="2" fill="none" stroke="${t.stroke}" stroke-width="2" rx="4" />
        
        <!-- Terminal Header Bar -->
        <rect width="398" height="20" x="1" y="1" fill="${t.terminalBar}" rx="4" />
        <rect width="398" height="10" x="1" y="11" fill="${t.terminalBar}" /> <!-- square bottom corners -->
        
        <!-- Terminal Dots -->
        <circle cx="15" cy="11" r="3.5" fill="#ef4444" />
        <circle cx="28" cy="11" r="3.5" fill="#facc15" />
        <circle cx="41" cy="11" r="3.5" fill="#22c55e" />
        
        <text x="200" y="14" font-family="'Courier New', Courier, monospace" font-size="10" fill="#71717a" text-anchor="middle" font-weight="bold">root@sigmaker:~</text>

        <text x="15" y="42" font-family="'Courier New', Courier, monospace" font-size="12" fill="${t.textMain}" font-weight="bold">
          <tspan fill="#71717a">$ </tspan>traceroute <tspan fill="#e4e4e7">${ip}</tspan>
        </text>
        <text x="15" y="58" font-family="'Courier New', Courier, monospace" font-size="11" fill="${t.textDim}">
           [>] LOC: <tspan fill="${t.textHighlight}">${geoData.city}, ${geoData.country}</tspan> 
        </text>
        <text x="15" y="72" font-family="'Courier New', Courier, monospace" font-size="11" fill="${t.textDim}">
           [>] ISP: <tspan fill="${t.textHighlight}">${geoData.isp}</tspan>
        </text>

        <text x="385" y="65" font-family="'Courier New', Courier, monospace" font-size="28" fill="${t.sysText}" stroke="${t.stroke}" stroke-width="1" text-anchor="end" font-weight="900" opacity="0.5">_SYS</text>
        
        <text x="385" y="72" font-family="'Courier New', Courier, monospace" font-size="9" fill="${t.textDim}" text-anchor="end">UTC: ${timestamp}</text>
      </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "max-age=0, s-maxage=60, no-cache, no-store, must-revalidate");
    res.send(svg.trim());
  } catch (error) {
    const errorSvg = `<svg width="400" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="80" fill="#200" /><text x="50%" y="50%" fill="white" font-family="sans-serif" text-anchor="middle">Error Generating Signature</text></svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(errorSvg);
  }
}
