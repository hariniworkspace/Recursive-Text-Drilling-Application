import express from "express";
import cors from "cors";

import documentRoutes from "./routes/document.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Recursive Text Drilling API is running"
  });
});

app.use(
  "/api/documents",
  documentRoutes
);

app.use(errorHandler);

export default app;