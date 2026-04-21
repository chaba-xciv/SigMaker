# SigMaker - Dynamic Forum Signatures

**SigMaker** is a full-stack web application designed to generate dynamic HTML and BBCode signatures for forum users. It overcomes the limitations of forums that block custom scripts by using server-side generated SVG images.

## 🚀 Features

- **Hacker Mode (IP Signature):** A dynamic signature that greets the viewer with their own IP address, location (City, Country), and ISP information. Perfect for tech enthusiasts and "hacker" themed profiles.
- **Weather Mode:** A live-updating weather signature for any city in the world. Displays temperature, humidity, and weather description.
- **Script-Block Bypass:** Uses standard `<img>` tags or `[img]` BBCode. Since the output is a standard image (SVG), it bypasses forum security settings that disable JavaScript or `<script>` tags.
- **Responsive Previews:** Real-time preview of your signature as you configure it.
- **Copy-Paste Ready:** One-click copy for BBCode and HTML formats.

## 🛠 Tech Stack

- **Frontend:** React 19, Tailwind CSS 4, Lucide React (Icons), Motion (Animations).
- **Backend:** Express (Node.js), Axios (API requests), Vite (Development & Middleware).
- **APIs:** 
  - `ip-api.com` for Geo-IP localization.
  - `wttr.in` for live weather data.

## 📦 How it Works

1. The user selects a mode on the website.
2. The website generates a URL pointing to our Express server endpoints (`/api/sig/hacker` or `/api/sig/weather`).
3. When the forum (or valid visitor's browser) requests that image URL, our server:
   - Fetches the required data (IP or Weather).
   - Renders a custom SVG string with that data.
   - Sends the SVG back with the correct MIME type (`image/svg+xml`).
   - Disables caching to ensure information stays fresh.

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server (Full-stack)
npm run dev
```

## 🌐 Deployment (GitHub + Vercel)

This project is built to be compatible with Vercel's serverless functions.
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Ensure the Environment Variable `APP_URL` is set to your Vercel deployment URL (e.g., `https://my-app.vercel.app`).
