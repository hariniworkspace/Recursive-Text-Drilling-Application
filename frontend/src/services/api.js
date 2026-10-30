import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

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

export async function loadDocuments() {
  const response = await api.get(
    "/documents"
  );

  return response.data.documents || [];
}

export async function getDocument(id) {
  const response = await api.get(
    `/documents/${id}`
  );

  return response.data.document;
}

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


  return response.data;
}

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


export async function deleteDocument(id) {
  const response = await api.delete(
    `/documents/${id}`
  );

  return response.data;
}


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


export default api;