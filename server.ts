import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import hackerHandler from "./api/sig/hacker.js";
import weatherHandler from "./api/sig/weather.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- Dynamic Signature Endpoints ---
  
  // Hacker Signature
  app.get("/api/sig/hacker", (req, res) => {
    hackerHandler(req, res);
  });

  // Weather Signature
  app.get("/api/sig/weather", (req, res) => {
    weatherHandler(req, res);
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
