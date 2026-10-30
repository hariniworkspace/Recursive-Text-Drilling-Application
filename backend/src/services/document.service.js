import { randomUUID } from "crypto";

import {
  drillParagraph,
  drillNode,
  rebuildParagraph
} from "./drilling.service.js";


const DEFAULT_DELIMITERS = {
  line: "newline",
  word: "space",
  character: "character"
};


/*
 * ==========================================
 * IN-MEMORY STORAGE
 * ==========================================
 */

const documents = new Map();


/*
 * ==========================================
 * METADATA
 * ==========================================
 */

function normalizeMetadata(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const metadata = {
    ...value
  };

  delete metadata.paragraph;

  return metadata;
}


/*
 * ==========================================
 * PARSE JSON FILE
 * ==========================================
 */

function parseJsonFile(file) {
  let parsed;

  try {
    parsed = JSON.parse(
      file.buffer.toString("utf8")
    );
  } catch {
    const error = new Error(
      `Invalid JSON in file "${file.originalname}"`
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    const error = new Error(
      `File "${file.originalname}" must contain a JSON object`
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    typeof parsed.paragraph !== "string"
  ) {
    const error = new Error(
      `File "${file.originalname}" must contain a string paragraph field`
    );

    error.statusCode = 400;

    throw error;
  }

  return {
    name: file.originalname,

    paragraph: parsed.paragraph,

    metadata:
      normalizeMetadata(parsed)
  };
}


/*
 * ==========================================
 * SERIALIZE DOCUMENT
 * ==========================================
 */

function serializeDocument(document) {
  return {
    id: document.id,

    name: document.name,

    paragraph: document.paragraph,

    metadata:
      document.metadata || {},

    revision:
      document.revision,

    createdAt:
      document.createdAt,

    updatedAt:
      document.updatedAt
  };
}


/*
 * ==========================================
 * GET FROM MEMORY
 * ==========================================
 */

function getStoredDocument(
  documentId
) {
  const document =
    documents.get(documentId);

  if (!document) {
    const error = new Error(
      "Document not found"
    );

    error.statusCode = 404;

    throw error;
  }

  return document;
}


/*
 * ==========================================
 * CREATE DOCUMENTS
 * ==========================================
 */

export function createDocumentsFromFiles(
  files
) {
  if (
    !Array.isArray(files) ||
    files.length === 0
  ) {
    const error = new Error(
      "At least one JSON file is required"
    );

    error.statusCode = 400;

    throw error;
  }

  const created = [];

  for (const file of files) {
    const parsed =
      parseJsonFile(file);

    const now =
      new Date().toISOString();

    const document = {
      id: randomUUID(),

      name: parsed.name,

      paragraph:
        parsed.paragraph,

      metadata:
        parsed.metadata,

      revision: 1,

      createdAt: now,

      updatedAt: now
    };

    documents.set(
      document.id,
      document
    );

    created.push(
      serializeDocument(document)
    );
  }

  return created;
}


/*
 * ==========================================
 * LIST DOCUMENTS
 * ==========================================
 */

export function listDocuments() {
  return Array.from(
    documents.values()
  )
    .sort(
      (a, b) =>
        new Date(b.updatedAt) -
        new Date(a.updatedAt)
    )
    .map(
      serializeDocument
    );
}


/*
 * ==========================================
 * GET DOCUMENT
 * ==========================================
 */

export function getDocument(
  documentId
) {
  return serializeDocument(
    getStoredDocument(documentId)
  );
}


/*
 * ==========================================
 * UPDATE DOCUMENT
 * ==========================================
 */

export function updateDocumentParagraph(
  documentId,
  paragraph,
  metadata
) {
  if (
    typeof paragraph !== "string"
  ) {
    const error = new Error(
      "Paragraph must be a string"
    );

    error.statusCode = 400;

    throw error;
  }

  const document =
    getStoredDocument(
      documentId
    );

  document.paragraph =
    paragraph;

  document.revision += 1;

  if (
    metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata)
  ) {
    document.metadata = {
      ...document.metadata,
      ...normalizeMetadata(
        metadata
      )
    };
  }

  document.updatedAt =
    new Date().toISOString();

  return serializeDocument(
    document
  );
}


/*
 * ==========================================
 * DELETE DOCUMENT
 * ==========================================
 */

export function deleteDocument(
  documentId
) {
  getStoredDocument(
    documentId
  );

  documents.delete(
    documentId
  );

  return {
    id: documentId
  };
}


/*
 * ==========================================
 * DRILL DOCUMENT
 * ==========================================
 */

export function drillDocument(
  documentId,
  level = "line",
  parentValue = "",
  delimiter
) {
  const document =
    getStoredDocument(
      documentId
    );


  /*
   * ----------------------------------------
   * LINE
   * ----------------------------------------
   */

  if (level === "line") {
    const effectiveDelimiter =
      delimiter ||
      DEFAULT_DELIMITERS.line;

    const nodes =
      drillParagraph(
        document.paragraph,
        effectiveDelimiter
      );

    return {
      document:
        serializeDocument(
          document
        ),

      level: "line",

      delimiter:
        effectiveDelimiter,

      nodes
    };
  }


  /*
   * ----------------------------------------
   * WORD
   * ----------------------------------------
   */

  if (level === "word") {
    const nodes =
      drillNode(
        parentValue,
        "word"
      );

    return {
      document:
        serializeDocument(
          document
        ),

      level: "word",

      delimiter:
        "space",

      parentValue,

      nodes
    };
  }


  /*
   * ----------------------------------------
   * CHARACTER
   * ----------------------------------------
   */

  if (level === "character") {
    const nodes =
      drillNode(
        parentValue,
        "character"
      );

    return {
      document:
        serializeDocument(
          document
        ),

      level: "character",

      delimiter:
        "character",

      parentValue,

      nodes
    };
  }


  /*
   * ----------------------------------------
   * INVALID LEVEL
   * ----------------------------------------
   */

  const error = new Error(
    "Level must be line, word, or character"
  );

  error.statusCode = 400;

  throw error;
}


/*
 * ==========================================
 * DOCUMENT OPERATIONS
 * ==========================================
 */

export function applyNodeOperation(
  documentId,
  operation
) {
  const document =
    getStoredDocument(
      documentId
    );

  const {
    action,
    values,
    delimiter = "newline"
  } = operation || {};


  if (
    ![
      "insert",
      "delete",
      "reorder"
    ].includes(action)
  ) {
    const error = new Error(
      "Operation must be insert, delete, or reorder"
    );

    error.statusCode = 400;

    throw error;
  }


  if (!Array.isArray(values)) {
    const error = new Error(
      "Operation values must be an array"
    );

    error.statusCode = 400;

    throw error;
  }


  if (
    values.some(
      (value) =>
        typeof value !== "string"
    )
  ) {
    const error = new Error(
      "All operation values must be strings"
    );

    error.statusCode = 400;

    throw error;
  }


  /*
   * INSERT
   */

  if (action === "insert") {
    const existing =
      drillParagraph(
        document.paragraph,
        delimiter
      );

    const newNodes = [
      ...existing,

      ...values.map(
        (value, index) => ({
          id: `insert-${index}`,
          type: "line",
          value,
          index,
          children: []
        })
      )
    ];

    document.paragraph =
      rebuildParagraph(
        newNodes,
        delimiter
      );
  }


  /*
   * DELETE
   */

  if (action === "delete") {
    document.paragraph =
      rebuildParagraph(
        values.map(
          (value, index) => ({
            id: `node-${index}`,
            type: "line",
            value,
            index,
            children: []
          })
        ),
        delimiter
      );
  }


  /*
   * REORDER
   */

  if (action === "reorder") {
    document.paragraph =
      rebuildParagraph(
        values.map(
          (value, index) => ({
            id: `node-${index}`,
            type: "line",
            value,
            index,
            children: []
          })
        ),
        delimiter
      );
  }


  document.revision += 1;

  document.updatedAt =
    new Date().toISOString();

  return serializeDocument(
    document
  );
}