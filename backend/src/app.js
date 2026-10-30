
import express from "express";
import cors from "cors";

import documentRoutes from "./routes/document.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL
    ].filter(Boolean)
  })
);

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true
  })
);

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Recursive Text Drilling API is running"
  });
});

// Document routes
app.use("/api/documents", documentRoutes);

// Error handler
app.use(errorHandler);

export default app;
