import {
  createDocumentsFromFiles,
  listDocuments,
  getDocument,
  updateDocumentParagraph,
  deleteDocument,
  drillDocument,
  applyNodeOperation
} from "../services/document.service.js";

/*
 * POST /api/documents/upload
 */
export async function uploadDocuments(req, res, next) {
  try {
    const files = req.files;

    const documents =
      await createDocumentsFromFiles(files);

    res.status(201).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
}


/*
 * GET /api/documents
 */
export async function getDocuments(req, res, next) {
  try {
    const documents =
      await listDocuments();

    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
}


/*
 * GET /api/documents/:id
 */
export async function getSingleDocument(req, res, next) {
  try {
    const document =
      await getDocument(req.params.id);

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    next(error);
  }
}


/*
 * PUT /api/documents/:id
 */
export async function updateDocument(req, res, next) {
  try {
    const {
      paragraph,
      metadata
    } = req.body;

    const document =
      await updateDocumentParagraph(
        req.params.id,
        paragraph,
        metadata
      );

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    next(error);
  }
}


/*
 * DELETE /api/documents/:id
 */
export async function removeDocument(req, res, next) {
  try {
    const result =
      await deleteDocument(
        req.params.id
      );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}


/*
 * GET /api/documents/:id/drill
 */
export async function drillSingleDocument(
  req,
  res,
  next
) {
  try {
    const {
      level = "line",
      parentValue = "",
      delimiter
    } = req.query;

    const result =
      await drillDocument(
        req.params.id,
        level,
        parentValue,
        delimiter
      );

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
}


/*
 * POST /api/documents/:id/operation
 */
export async function operateOnDocument(
  req,
  res,
  next
) {
  try {
    const document =
      await applyNodeOperation(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    next(error);
  }
}