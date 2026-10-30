import { useState } from "react";

export default function FileUploader({ onUpload, disabled = false }) {
  const [files, setFiles] = useState([]);

  function handleSubmit(event) {
    event.preventDefault();

    if (files.length > 0) {
      onUpload(files);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded border bg-white p-4">
      <label className="mb-2 block font-medium">
        JSON documents
      </label>

      <input
        type="file"
        accept=".json,application/json"
        multiple
        disabled={disabled}
        onChange={(event) => setFiles(Array.from(event.target.files || []))}
      />

      <button
        type="submit"
        disabled={disabled || files.length === 0}
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        Upload documents
      </button>
    </form>
  );
}