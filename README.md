# Forum SigMaker

[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

**Forum SigMaker** is a full-stack web application designed to generate dynamic HTML and BBCode graphical signatures for forum users. By rendering data on the server and serving it entirely as native SVG images, SigMaker seamlessly bypasses tight forum security filters that block custom CSS, JavaScript, or `<iframe>` embeds.

## 🚀 Key Features

- **Hacker Mode (IP Auto-Detection):** A dynamic, personalized SVG signature that greets the viewer with their own IP address, geographic location (City, Country), and ISP. Delivers a classic "terminal" aesthetic.
- **Weather Mode:** A live-updating weather signature for any configured city worldwide. Displays precise temperature, humidity, and atmospheric conditions.
- **Script-Block Bypass:** Outputs a strictly typed `image/svg+xml` payload. Since the output is a standard image, it bypasses forum security settings that disable JavaScript or `<script>` tags entirely. Server-side caching constraints ensure the data stays fresh on every load.
- **Image Theming Framework:** Generated SVGs support built-in color-grading themes (Dark, Ocean, Emerald, Cyberpunk) mapped directly via URL parameters.
- **Adaptive Dashboard UI:** A clean, responsive 1080p-optimized dashboard interface featuring real-time adaptive scaling previews, dark mode support, and a seamless mobile layout.
- **Fast-Copy Code Snips:** One-click integration codes bridging both BBCode formats for forums and HTML embeddings for standard websites.

## 🛠 Tech Stack

- **Frontend Interface:** React 19, Tailwind CSS 4, Lucide React (Icons), Motion (Animations).
- **Backend / Renderer:** Express (Node.js), Vite (Development Middleware & Build Tool).
- **External Data Providers:** 
  - [Open-Meteo](https://open-meteo.com/) for global geocoding and reliable live weather data.
  - [IP-API](https://ip-api.com/) for accurate Geo-IP localization and ISP tracking.

## 📦 How it Works under the Hood

1. A user selects their preferred mode (Hacker/Weather), configuration, and visual theme via the dashboard.
2. The application provides an autonomous URL pointing directly to the Express server (e.g., `/api/sig/weather?city=Bangkok&theme=ocean`).
3. When a forum software (or a visitor's web browser) resolves the URL via an image tag, the Express Node server receives the request.
4. The server calls the necessary external APIs (Weather or IP lookups), injects the live values into an SVG template on the fly, and serves the response securely back to the forum.

## 💻 Local Development

### Prerequisites
- Node.js (v18+)

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/sigmaker.git
cd sigmaker

# Install dependencies
npm install

# Start the full-stack development server (Frontend + Express API)
npm run dev
```

Open a browser and navigate to `http://localhost:3000`. 

## 🌐 Deployment Guidelines

This project utilizes Express as a unified backend to serve both API routes and static production frontend assets. 
- It naturally works well on standard Node environments (e.g., VPS, Docker, Google Cloud Run, Railway, Render).
- Ensure your `package.json` effectively calls Node against `server.ts` or compiles it out to standard CommonJS/ESM.
- Be sure to set `VITE_APP_URL` to your production domain to ensure export configurations point to the correct live URLs.

## 📄 License

This repository is accessible for community adoption. Feel free to clone, edit, modify, and host your own dynamic signature generation instances!
