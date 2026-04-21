import axios from "axios";
import http from "http";
import https from "https";

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

export default async function handler(req: any, res: any) {
  try {
    // Parameters
    const theme = (req.query.theme as string) || 'ocean';
    const width = 450;
    const height = 80;

    // Provide color palettes
    const themes: Record<string, any> = {
      ocean: { bgStart: '#0f172a', bgEnd: '#1e293b', accentStart: '#38bdf8', accentEnd: '#0ea5e9', text: '#f8fafc', primary: '#38bdf8' },
      dark: { bgStart: '#09090b', bgEnd: '#18181b', accentStart: '#52525b', accentEnd: '#71717a', text: '#f8fafc', primary: '#a1a1aa' },
      emerald: { bgStart: '#022c22', bgEnd: '#064e3b', accentStart: '#34d399', accentEnd: '#10b981', text: '#ecfdf5', primary: '#34d399' },
      cyberpunk: { bgStart: '#2e1065', bgEnd: '#4c1d95', accentStart: '#f472b6', accentEnd: '#db2777', text: '#fdf4ff', primary: '#f472b6' }
    };
    const t = themes[theme] || themes.ocean;

    const city = (req.query.city as string) || "Bangkok";
    
    let weather = { temp: '?', desc: 'Unknown', humidity: '?', cityName: city.toUpperCase(), countryName: 'GLOBAL' };
    let serviceStatus = "Online";

    try {
      // Step 1: Geocoding via Open-Meteo
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`, {
        timeout: 5000,
        httpAgent,
        httpsAgent
      });
      
      const geoData = geoRes.data;
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }
      
      const location = geoData.results[0];
      const lat = location.latitude;
      const lon = location.longitude;
      
      // Extract nice location names
      weather.cityName = location.name.toUpperCase();
      weather.countryName = location.country ? location.country.toUpperCase() : 'GLOBAL';
      
      // Step 2: Weather data via Open-Meteo
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`, { 
        timeout: 5000,
        httpAgent,
        httpsAgent
      });
      
      const current = weatherRes.data.current;
      
      // Map WMO codes to text (simplified)
      const wmoCodes: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
        56: 'Light Freezing Drizzle', 57: 'Dense Freezing Drizzle',
        61: 'Slight Rain', 63: 'Rain', 65: 'Heavy Rain',
        66: 'Light Freezing Rain', 67: 'Heavy Freezing Rain',
        71: 'Slight Snow', 73: 'Snow', 75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Slight Rain Showers', 81: 'Rain Showers', 82: 'Violent Rain Showers',
        85: 'Slight Snow Showers', 86: 'Heavy Snow Showers',
        95: 'Thunderstorm', 96: 'Thunderstorm with Hail', 99: 'Heavy Thunderstorm with Hail'
      };
      
      weather.temp = Math.round(current.temperature_2m).toString();
      weather.humidity = current.relative_humidity_2m.toString();
      weather.desc = wmoCodes[current.weather_code] || 'Unknown';
      
    } catch (err: any) {
      serviceStatus = "API Error";
      console.error(`Weather lookup failed for ${city}:`, err.message || err);
    }

    const timestamp = new Date().toLocaleTimeString();

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 450 80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${t.bgStart};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${t.bgEnd};stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${t.accentStart};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${t.accentEnd};stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
            <feOffset dx="1" dy="1" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="450" height="80" fill="url(#grad)" rx="8" />
        
        <!-- Left Side Accent Line -->
        <rect width="6" height="80" x="0" y="0" fill="url(#accent)" rx="0" opacity="0.9"/>
        
        <text x="24" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif" font-size="22" fill="${t.text}" font-weight="700" filter="url(#shadow)">${weather.cityName}</text>
        <text x="24" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif" font-size="12" fill="#94a3b8" font-weight="500">${weather.countryName} • <tspan fill="${t.primary}">${weather.desc}</tspan></text>
        
        <text x="430" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif" font-size="36" fill="${t.text}" font-weight="800" text-anchor="end" filter="url(#shadow)">${weather.temp}°C</text>
        
        <text x="240" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif" font-size="12" fill="#cbd5e1" font-weight="500">HUMIDITY <tspan fill="${t.text}" font-weight="600">${weather.humidity}%</tspan></text>
        <text x="240" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, sans-serif" font-size="10" fill="#64748b" font-weight="500">SVC: ${serviceStatus} | REF: ${timestamp}</text>
        
        <!-- Minimal Decor -->
        <circle cx="415" cy="15" r="4" fill="${t.primary}" opacity="0.4" />
        <circle cx="400" cy="15" r="2.5" fill="${t.primary}" opacity="0.2" />
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
