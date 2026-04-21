import axios from "axios";

export default async function handler(req: any, res: any) {
  try {
    // Get IP (handling proxies)
    const ip = (req.headers["x-forwarded-for"] as string || req.socket?.remoteAddress || "127.0.0.1").split(",")[0];
    
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
    res.setHeader("Cache-Control", "max-age=0, s-maxage=60, no-cache, no-store, must-revalidate");
    res.send(svg.trim());
  } catch (error) {
    const errorSvg = `<svg width="450" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="450" height="80" fill="#200" /><text x="50%" y="50%" fill="white" font-family="sans-serif" text-anchor="middle">Error Generating Signature</text></svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(errorSvg);
  }
}
