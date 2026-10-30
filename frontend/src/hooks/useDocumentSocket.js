import { useEffect } from "react";

import {
  connectSocket
} from "../services/socket.js";

export function useDocumentSocket(
  documentId,
  onUpdated,
  onDeleted
) {
  useEffect(() => {
    if (!documentId) {
      return;
    }

    const socket =
      connectSocket();

    socket.emit(
      "document:join",
      documentId
    );

    socket.on(
      "document:updated",
      onUpdated
    );

    socket.on(
      "document:deleted",
      onDeleted
    );

    return () => {
      socket.emit(
        "document:leave",
        documentId
      );

      socket.off(
        "document:updated",
        onUpdated
      );

      socket.off(
        "document:deleted",
        onDeleted
      );
    };
  }, [
    documentId,
    onUpdated,
    onDeleted
  ]);
}