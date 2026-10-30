import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});


/*
 * ==========================================
 * UPLOAD DOCUMENTS
 * ==========================================
 *
 * Sends one or multiple JSON files.
 *
 * Backend:
 * POST /api/documents/upload
 *
 * Form field:
 * files
 */
export async function uploadDocuments(files) {
  if (!files || files.length === 0) {
    throw new Error("Please select at least one JSON file.");
  }

  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  const response = await api.post(
    "/documents/upload",
    formData
  );

  return response.data.documents || [];
}


/*
 * ==========================================
 * LOAD ALL DOCUMENTS
 * ==========================================
 *
 * Backend:
 * GET /api/documents
 */
export async function loadDocuments() {
  const response = await api.get(
    "/documents"
  );

  return response.data.documents || [];
}


/*
 * ==========================================
 * GET SINGLE DOCUMENT
 * ==========================================
 *
 * Backend:
 * GET /api/documents/:id
 */
export async function getDocument(id) {
  const response = await api.get(
    `/documents/${id}`
  );

  return response.data.document;
}


/*
 * ==========================================
 * DRILL DOCUMENT
 * ==========================================
 *
 * Levels:
 *
 * line
 * word
 * character
 *
 * Examples:
 *
 * drillDocument(id, {
 *   level: "line",
 *   delimiter: "newline"
 * });
 *
 *
 * drillDocument(id, {
 *   level: "word",
 *   parentValue: "Hello"
 * });
 *
 *
 * drillDocument(id, {
 *   level: "character",
 *   parentValue: "Hello"
 * });
 *
 * Backend:
 * GET /api/documents/:id/drill
 */
export async function drillDocument(
  id,
  {
    level = "line",
    parentValue = "",
    delimiter
  } = {}
) {
  const params = {
    level,
    parentValue
  };

  if (
    delimiter !== undefined &&
    delimiter !== null &&
    delimiter !== ""
  ) {
    params.delimiter = delimiter;
  }

  const response = await api.get(
    `/documents/${id}/drill`,
    {
      params
    }
  );

  /*
   * Backend response:
   *
   * {
   *   success: true,
   *   document: {...},
   *   level: "line",
   *   delimiter: "newline",
   *   nodes: [...]
   * }
   */

  return response.data;
}


/*
 * ==========================================
 * MUTATE DOCUMENT
 * ==========================================
 *
 * Supported actions:
 *
 * insert
 * delete
 * reorder
 *
 * Backend:
 * POST /api/documents/:id/operation
 */
export async function mutateDocument(
  id,
  operation
) {
  const response = await api.post(
    `/documents/${id}/operation`,
    operation
  );

  return response.data.document;
}


/*
 * ==========================================
 * UPDATE DOCUMENT
 * ==========================================
 *
 * Backend:
 * PUT /api/documents/:id
 */
export async function updateDocument(
  id,
  paragraph,
  metadata = {}
) {
  const response = await api.put(
    `/documents/${id}`,
    {
      paragraph,
      metadata
    }
  );

  return response.data.document;
}


/*
 * ==========================================
 * DELETE DOCUMENT
 * ==========================================
 *
 * Backend:
 * DELETE /api/documents/:id
 */
export async function deleteDocument(id) {
  const response = await api.delete(
    `/documents/${id}`
  );

  return response.data;
}


/*
 * ==========================================
 * ERROR HELPER
 * ==========================================
 *
 * Converts Axios errors into a
 * consistent message.
 */
export function getApiErrorMessage(
  error,
  fallback = "Something went wrong"
) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}


/*
 * ==========================================
 * AXIOS INSTANCE
 * ==========================================
 */

export default api;