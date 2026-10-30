import express from "express";

import {
  uploadDocuments,
  getDocuments,
  getSingleDocument,
  updateDocument,
  removeDocument,
  drillSingleDocument,
  operateOnDocument
} from "../controllers/document.controller.js";

import upload from "../middleware/upload.js";

const router = express.Router();

/*
 * Upload one or multiple JSON files
 *
 * POST /api/documents/upload
 *
 * Form-data:
 * files = JSON file(s)
 */
router.post(
  "/upload",
  upload.array("files", 20),
  uploadDocuments
);

/*
 * List all documents
 *
 * GET /api/documents
 */
router.get(
  "/",
  getDocuments
);

/*
 * Drill document
 *
 * IMPORTANT:
 * This route must come BEFORE /:id
 *
 * GET /api/documents/:id/drill
 *
 * Examples:
 *
 * ?level=line
 * ?level=word&parentValue=Hello
 * ?level=character&parentValue=Hello
 */
router.get(
  "/:id/drill",
  drillSingleDocument
);

/*
 * Apply node operation
 *
 * POST /api/documents/:id/operation
 */
router.post(
  "/:id/operation",
  operateOnDocument
);

/*
 * Update document
 *
 * PUT /api/documents/:id
 */
router.put(
  "/:id",
  updateDocument
);

/*
 * Delete document
 *
 * DELETE /api/documents/:id
 */
router.delete(
  "/:id",
  removeDocument
);

/*
 * Get single document
 *
 * IMPORTANT:
 * Keep this AFTER all specific /:id/... routes.
 *
 * GET /api/documents/:id
 */
router.get(
  "/:id",
  getSingleDocument
);

export default router;