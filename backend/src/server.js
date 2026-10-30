import http from "http";
import { Server } from "socket.io";

import app from "./app.js";

import {
  initializeSocket
} from "./services/socket.service.js";

const PORT =
  process.env.PORT || 5000;

/*
 * Create HTTP server
 */
const server =
  http.createServer(app);

/*
 * Create Socket.IO server
 */
const io = new Server(
  server,
  {
    cors: {
      origin:
        "http://localhost:5173",
      methods: [
        "GET",
        "POST",
        "PUT",
        "DELETE"
      ]
    }
  }
);

/*
 * Initialize Socket.IO
 */
initializeSocket(io);

/*
 * Start server
 */
server.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );

    console.log(
      `Socket.IO running on ws://localhost:${PORT}`
    );
  }
);