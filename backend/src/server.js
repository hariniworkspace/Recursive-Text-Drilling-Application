
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { Server } from "socket.io";

import app from "./app.js";
import { initializeSocket } from "./services/socket.service.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

initializeSocket(io);

// Frontend hosting configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.resolve(
  __dirname,
  "../../frontend/dist"
);

app.use(express.static(frontendPath));

// React Router fallback
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(
    path.join(frontendPath, "index.html"),
    (err) => {
      if (err) next(err);
    }
  );
});

server.listen(PORT, () => {
  console.log(`Application running on port ${PORT}`);
});
