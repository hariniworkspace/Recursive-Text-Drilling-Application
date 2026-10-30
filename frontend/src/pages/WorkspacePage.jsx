import { useCallback, useEffect, useState } from "react";

import FileUploader from "../components/FileUploader.jsx";
import DrillFlow from "../components/DrillFlow.jsx";
import PropertiesPanel from "../components/PropertiesPanel.jsx";

import {
  drillDocument,
  loadDocuments,
  mutateDocument,
  uploadDocuments
} from "../services/api.js";

import { useDocumentSocket } from "../hooks/useDocumentSocket.js";


export default function WorkspacePage() {

  /*
   * ==========================================
   * STATE
   * ==========================================
   */

  const [documents, setDocuments] =
    useState([]);

  const [selected, setSelected] =
    useState(null);

  const [nodes, setNodes] =
    useState([]);

  const [level, setLevel] =
    useState("line");

  const [delimiter, setDelimiter] =
    useState("newline");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
   * ==========================================
   * SOCKET - DOCUMENT UPDATED
   * ==========================================
   */

  const handleUpdated = useCallback(
    (document) => {

      setDocuments(
        (current) =>
          current.map(
            (item) =>
              item.id === document.id
                ? document
                : item
          )
      );

      setSelected(
        (current) =>
          current?.id === document.id
            ? document
            : current
      );
    },
    []
  );


  /*
   * ==========================================
   * SOCKET - DOCUMENT DELETED
   * ==========================================
   */

  const handleDeleted = useCallback(
    ({ id }) => {

      setDocuments(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );

      setSelected(
        (current) =>
          current?.id === id
            ? null
            : current
      );

      setNodes([]);
    },
    []
  );


  /*
   * Connect to document socket.
   *
   * If your socket hook is not needed,
   * this can safely be removed later.
   */

  useDocumentSocket(
    selected?.id,
    handleUpdated,
    handleDeleted
  );


  /*
   * ==========================================
   * LOAD DOCUMENTS
   * ==========================================
   */

  useEffect(() => {

    let mounted = true;

    async function load() {

      try {

        setError("");

        const result =
          await loadDocuments();

        if (mounted) {
          setDocuments(
            result || []
          );
        }

      } catch (requestError) {

        console.error(
          "Load documents error:",
          requestError
        );

        if (mounted) {
          setError(
            requestError.response?.data
              ?.message ||
            "Unable to load documents."
          );
        }

      }
    }

    load();

    return () => {
      mounted = false;
    };

  }, []);


  /*
   * ==========================================
   * UPLOAD
   * ==========================================
   */

  async function handleUpload(files) {

    try {

      setError("");

      const created =
        await uploadDocuments(files);

      setDocuments(
        (current) => [
          ...created,
          ...current
        ]
      );

      /*
       * Automatically select the
       * first uploaded document.
       */

      if (created.length > 0) {

        setSelected(
          created[0]
        );

        setNodes([]);

        setLevel("line");

        setDelimiter("newline");
      }

    } catch (requestError) {

      console.error(
        "Upload error:",
        requestError
      );

      setError(
        requestError.response?.data
          ?.message ||
        requestError.message ||
        "Upload failed."
      );
    }
  }


  /*
   * ==========================================
   * SELECT DOCUMENT
   * ==========================================
   */

  function selectDocument(document) {

    setSelected(
      document
    );

    setNodes([]);

    setLevel("line");

    setDelimiter("newline");

    setError("");
  }


  /*
   * ==========================================
   * DRILL DOCUMENT
   * ==========================================
   *
   * This handles the main Drill button.
   *
   * line:
   * JSON → Lines
   */

  async function runDrill(
    nextLevel = level,
    parentValue = ""
  ) {

    if (!selected) {
      setError(
        "Please select a document first."
      );

      return;
    }

    try {

      setLoading(true);

      setError("");

      const result =
        await drillDocument(
          selected.id,
          {
            level: nextLevel,

            parentValue,

            delimiter:
              nextLevel === "line"
                ? delimiter
                : undefined
          }
        );

      console.log(
        "Drill response:",
        result
      );

      const drilledNodes =
        result?.nodes || [];

      setNodes(
        drilledNodes
      );

      setLevel(
        nextLevel
      );

    } catch (requestError) {

      console.error(
        "Drill error:",
        requestError
      );

      setNodes([]);

      setError(
        requestError.response?.data
          ?.message ||
        requestError.message ||
        "Unable to drill document."
      );

    } finally {

      setLoading(false);
    }
  }


  /*
   * ==========================================
   * DOUBLE-CLICK DRILL DOWN
   * ==========================================
   *
   * LINE → WORD
   *
   * WORD → CHARACTER
   */

  async function handleDrillDown(node) {

    if (!selected || !node) {
      return;
    }


    /*
     * LINE → WORD
     */

    if (node.type === "line") {

      await runDrill(
        "word",
        node.value
      );

      return;
    }


    /*
     * WORD → CHARACTER
     */

    if (node.type === "word") {

      await runDrill(
        "character",
        node.value
      );

      return;
    }

  }


  /*
   * ==========================================
   * REVERSE / REORDER
   * ==========================================
   */

  async function reorderNodes() {

    if (
      !selected ||
      nodes.length < 2
    ) {
      return;
    }

    try {

      setLoading(true);

      setError("");

      const reversed =
        [...nodes]
          .reverse()
          .map(
            (node) =>
              node.value
          );

      const updated =
        await mutateDocument(
          selected.id,
          {
            action: "reorder",

            values: reversed,

            delimiter:
              delimiter ===
              "character"
                ? "character"
                : delimiter
          }
        );

      /*
       * Update document list.
       */

      setDocuments(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item
          )
      );

      setSelected(
        updated
      );

      /*
       * Reload current drill view.
       */

      await runDrill(
        "line"
      );

    } catch (requestError) {

      console.error(
        "Reorder error:",
        requestError
      );

      setError(
        requestError.response?.data
          ?.message ||
        "Unable to reorder nodes."
      );

    } finally {

      setLoading(false);
    }
  }


  /*
   * ==========================================
   * RESET TO LINES
   * ==========================================
   */

  function resetToLines() {

    if (!selected) {
      return;
    }

    setLevel(
      "line"
    );

    setDelimiter(
      "newline"
    );

    setNodes([]);

    /*
     * Don't automatically call the API.
     * User can press Drill.
     */
  }


  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <header className="mb-6">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">
            Recursive Text Drilling
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            JSON → Lines → Words → Characters
          </p>

        </div>

      </header>


      {/* ===================================== */}
      {/* ERROR */}
      {/* ===================================== */}

      {error && (

        <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <span>
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
            className="ml-4 font-bold"
          >
            ×
          </button>

        </div>

      )}


      {/* ===================================== */}
      {/* MAIN GRID */}
      {/* ===================================== */}

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_280px]">


        {/* =================================== */}
        {/* LEFT PANEL */}
        {/* =================================== */}

        <aside className="space-y-4">

          {/* Upload */}

          <FileUploader
            onUpload={
              handleUpload
            }
          />


          {/* Documents */}

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="mb-3 flex items-center justify-between">

              <h2 className="font-semibold text-slate-900">
                Documents
              </h2>

              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                {documents.length}
              </span>

            </div>


            {documents.length === 0 ? (

              <p className="text-sm text-slate-500">
                No documents uploaded.
              </p>

            ) : (

              <div className="space-y-2">

                {documents.map(
                  (document) => (

                    <button
                      key={
                        document.id
                      }

                      onClick={() =>
                        selectDocument(
                          document
                        )
                      }

                      className={`
                        block
                        w-full
                        rounded-lg
                        border
                        p-3
                        text-left
                        transition
                        ${
                          selected?.id ===
                          document.id
                            ? "border-blue-300 bg-blue-50"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        }
                      `}
                    >

                      <div className="truncate text-sm font-medium text-slate-800">
                        {document.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Revision{" "}
                        {document.revision}
                      </div>

                    </button>

                  )
                )}

              </div>

            )}

          </section>

        </aside>


        {/* =================================== */}
        {/* CENTER PANEL */}
        {/* =================================== */}

        <section className="min-w-0 space-y-4">


          {/* Toolbar */}

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">


            {/* Selected document */}

            <div className="mr-auto min-w-0">

              {selected ? (

                <div>

                  <div className="truncate font-semibold text-slate-900">
                    {selected.name}
                  </div>

                  <div className="text-xs text-slate-500">
                    Current level:{" "}
                    <span className="font-medium capitalize">
                      {level}
                    </span>
                  </div>

                </div>

              ) : (

                <span className="text-sm text-slate-500">
                  Select a document
                </span>

              )}

            </div>


            {/* Level */}

            <select
              value={level}
              onChange={(event) =>
                setLevel(
                  event.target.value
                )
              }
              disabled={!selected}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >

              <option value="line">
                Lines
              </option>

              <option value="word">
                Words
              </option>

              <option value="character">
                Characters
              </option>

            </select>


            {/* Delimiter */}

            <select
              value={delimiter}
              onChange={(event) =>
                setDelimiter(
                  event.target.value
                )
              }
              disabled={!selected}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >

              <option value="newline">
                Newline
              </option>

              <option value="space">
                Space
              </option>

              <option value="character">
                Character
              </option>

            </select>


            {/* Drill */}

            <button
              onClick={() =>
                runDrill()
              }
              disabled={
                !selected ||
                loading
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading
                ? "Drilling..."
                : "Drill"}

            </button>


            {/* Reset */}

            <button
              onClick={
                resetToLines
              }
              disabled={
                !selected
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Reset
            </button>


            {/* Reverse */}

            <button
              onClick={
                reorderNodes
              }
              disabled={
                !selected ||
                nodes.length < 2 ||
                loading
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Reverse
            </button>

          </div>


          {/* Recursive flow */}

          <DrillFlow
            nodes={nodes}
            level={level}
            loading={loading}
            onDrillDown={
              handleDrillDown
            }
          />

        </section>


       

        <aside>

          <PropertiesPanel
            document={
              selected
            }
          />

        </aside>

      </div>

    </main>
  );
}