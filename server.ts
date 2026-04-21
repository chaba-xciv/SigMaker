import express from "express";
import path from "path";
import axios from "axios";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Dynamic Signature Endpoints ---

  // Hacker Signature: Shows Visitor IP, Country, ISP
  app.get("/api/sig/hacker", async (req, res) => {
    try {
      // Get IP (handling proxies)
      const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0];
      
      // Fetch Geo info (Free API, rate limited, handle gracefully)
      let geoData = { status: 'fail', country: 'Unknown', isp: 'Unknown', city: 'Unknown' };
      try {
        const geoRes = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,city,isp,query`, { timeout: 3000 });
        if (geoRes.data && geoRes.data.status === 'success') {
          geoData = geoRes.data;
        }
      } catch (err: any) {
        console.error("Geo lookup failed:", err.message || err);
      }

      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Construct SVG (Hacker Style)
      const svg = `
        <svg width="450" height="80" viewBox="0 0 450 80" xmlns="http://www.w3.org/2000/svg">
          <rect width="450" height="80" fill="#0c0d0e" rx="4" />
          <rect width="448" height="78" x="1" y="1" fill="none" stroke="#2a2d30" stroke-width="1" rx="4" />
          <defs>
            <filter id="hacker-glow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
              <feOffset dx="0" dy="0" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <text x="15" y="25" font-family="monospace" font-size="12" fill="#00ff00" font-weight="bold" filter="url(#hacker-glow)">
            [ACCESS_GRANTED] >> TARGET_LOCATED
          </text>
          
          <text x="15" y="45" font-family="monospace" font-size="11" fill="#888">IP: </text>
          <text x="45" y="45" font-family="monospace" font-size="11" fill="#fff">${ip}</text>
          
          <text x="15" y="60" font-family="monospace" font-size="11" fill="#888">LOC: </text>
          <text x="45" y="60" font-family="monospace" font-size="11" fill="#fff">${geoData.city}, ${geoData.country}</text>
          
          <text x="250" y="45" font-family="monospace" font-size="11" fill="#888">ISP: </text>
          <text x="280" y="45" font-family="monospace" font-size="11" fill="#fff">${geoData.isp.substring(0, 18)}</text>
          
          <text x="250" y="60" font-family="monospace" font-size="11" fill="#888">USR: </text>
          <text x="280" y="60" font-family="monospace" font-size="11" fill="#fff">ANONYMOUS</text>
          
          <text x="435" y="70" font-family="monospace" font-size="8" fill="#444" text-anchor="end">${timestamp} UTC</text>
          
          <line x1="0" y1="32" x2="450" y2="32" stroke="#222" stroke-width="1" />
          <circle cx="430" cy="15" r="3" fill="#ff5555" />
          <circle cx="415" cy="15" r="3" fill="#ffb86c" />
          <circle cx="400" cy="15" r="3" fill="#50fa7b" />
        </svg>
      `;

      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(svg.trim());
    } catch (error) {
      // Return a basic "Error" SVG instead of 500 status to allow image to show something
      const errorSvg = `<svg width="450" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="450" height="80" fill="#200" /><text x="50%" y="50%" fill="white" font-family="sans-serif" text-anchor="middle">Error Generating Signature</text></svg>`;
      res.setHeader("Content-Type", "image/svg+xml");
      res.send(errorSvg);
    }
  });

  // Weather Signature: Shows Weather for a specific city
  app.get("/api/sig/weather", async (req, res) => {
    try {
      const city = (req.query.city as string) || "Bangkok";
      
      let weather = { temp: '?', desc: 'Unknown', humidity: '?' };
      let serviceStatus = "Online";

      try {
        // Use wttr.in for easy weather JSON. Increased timeout for stability.
        const weatherRes = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { 
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0' } // Sometimes helps with stability
        });
        
        if (weatherRes.data && weatherRes.data.current_condition) {
          const data = weatherRes.data.current_condition[0];
          weather = {
            temp: data.temp_C,
            desc: data.weatherDesc[0].value,
            humidity: data.humidity
          };
        } else {
          throw new Error("Invalid data format from wttr.in");
        }
      } catch (err: any) {
        serviceStatus = "API Down";
        console.error(`Weather lookup failed for ${city}:`, err.message || err);
        
        // Try a very simple fallback if j1 format fails (sometimes simpler formats work better)
        try {
          const fallbackRes = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%h`, { timeout: 3000 });
          const parts = fallbackRes.data.split(' ');
          if (parts.length >= 2) {
            weather.desc = parts[0];
            weather.temp = parts[1].replace('+', '').replace('°C', '');
            weather.humidity = parts[2]?.replace('%', '') || '?';
            serviceStatus = "Fallback Mode";
          }
        } catch (fallbackErr) {
          // Both failed
        }
      }

      const timestamp = new Date().toLocaleTimeString();

      const svg = `
        <svg width="450" height="80" viewBox="0 0 450 80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="1" dy="1" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="450" height="80" fill="url(#grad)" rx="10" />
          
          <text x="20" y="38" font-family="sans-serif" font-size="22" fill="white" font-weight="bold" filter="url(#shadow)">${city.toUpperCase()}</text>
          <text x="20" y="62" font-family="sans-serif" font-size="14" fill="white" opacity="0.9">${weather.desc}</text>
          
          <text x="430" y="52" font-family="sans-serif" font-size="38" fill="white" font-weight="bold" text-anchor="end" filter="url(#shadow)">${weather.temp}°C</text>
          
          <text x="230" y="45" font-family="sans-serif" font-size="12" fill="white" opacity="0.8">Humidity: ${weather.humidity}%</text>
          <text x="230" y="65" font-family="sans-serif" font-size="10" fill="white" opacity="0.6">Status: ${serviceStatus} | Refreshed: ${timestamp}</text>
          
          <circle cx="410" cy="15" r="5" fill="white" opacity="0.3" />
          <circle cx="390" cy="15" r="3" fill="white" opacity="0.2" />
          <circle cx="375" cy="15" r="2" fill="white" opacity="0.1" />
        </svg>
      `;

      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(svg.trim());
    } catch (error) {
      // Return a basic "Error" SVG instead of 500 status
      const errorSvg = `<svg width="450" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="450" height="80" fill="#200" /><text x="50%" y="50%" fill="white" font-family="sans-serif" text-anchor="middle">Weather Signature Error</text></svg>`;
      res.setHeader("Content-Type", "image/svg+xml");
      res.send(errorSvg);
    }
  });

  // --- Vite & SPA Fallback ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
