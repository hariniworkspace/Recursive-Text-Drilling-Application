let io = null;

export function initializeSocket(socketServer) {
  io = socketServer;

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id}`
    );

    /*
     * Join a document room
     */
    socket.on(
      "document:join",
      (documentId) => {
        const room =
          `document:${documentId}`;

        socket.join(room);

        console.log(
          `${socket.id} joined ${room}`
        );
      }
    );

    /*
     * Leave document room
     */
    socket.on(
      "document:leave",
      (documentId) => {
        const room =
          `document:${documentId}`;

        socket.leave(room);

        console.log(
          `${socket.id} left ${room}`
        );
      }
    );

    /*
     * Disconnect
     */
    socket.on("disconnect", () => {
      console.log(
        `Socket disconnected: ${socket.id}`
      );
    });
  });
}

export function emitDocumentUpdated(
  documentId,
  document
) {
  if (!io) {
    return;
  }

  io.to(
    `document:${documentId}`
  ).emit(
    "document:updated",
    document
  );
}

export function emitDocumentDeleted(
  documentId
) {
  if (!io) {
    return;
  }

  io.to(
    `document:${documentId}`
  ).emit(
    "document:deleted",
    {
      id: documentId
    }
  );
}