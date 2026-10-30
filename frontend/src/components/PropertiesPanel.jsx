function formatValue(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

export default function PropertiesPanel({ document }) {
  if (!document) {
    return (
      <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Properties</h2>
        <p className="mt-3 text-sm text-slate-500">
          Select a document to view its metadata.
        </p>
      </aside>
    );
  }

  const metadata = document.metadata || {};

  return (
    <aside className="flex max-h-[calc(100vh-10rem)] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Properties</h2>
        <p className="mt-1 break-all text-sm text-slate-500">
          {document.name}
        </p>
      </div>

      <div className="overflow-y-auto p-5">
        <dl className="space-y-4">
          {Object.entries(metadata).length === 0 ? (
            <p className="text-sm text-slate-500">No metadata fields.</p>
          ) : (
            Object.entries(metadata).map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {key}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
                  {formatValue(value)}
                </dd>
              </div>
            ))
          )}
        </dl>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Revision
          </p>
          <p className="mt-1 text-sm text-slate-800">
            {document.revision ?? 0}
          </p>
        </div>
      </div>
    </aside>
  );
}