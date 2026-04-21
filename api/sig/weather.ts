import axios from "axios";

export default async function handler(req: any, res: any) {
  try {
    const city = (req.query.city as string) || "Bangkok";
    
    let weather = { temp: '?', desc: 'Unknown', humidity: '?' };
    let serviceStatus = "Online";

    try {
      const weatherRes = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { 
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
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
    res.setHeader("Cache-Control", "max-age=0, s-maxage=60, no-cache, no-store, must-revalidate");
    res.send(svg.trim());
  } catch (error) {
    const errorSvg = `<svg width="450" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="450" height="80" fill="#200" /><text x="50%" y="50%" fill="white" font-family="sans-serif" text-anchor="middle">Weather Signature Error</text></svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(errorSvg);
  }
}
