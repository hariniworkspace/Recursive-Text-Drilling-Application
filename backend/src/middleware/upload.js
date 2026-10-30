import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (req, file, cb) => {
    const isJson =
      file.mimetype === "application/json" ||
      file.originalname
        .toLowerCase()
        .endsWith(".json");

    if (!isJson) {
      return cb(
        new Error(
          "Only JSON files are allowed"
        )
      );
    }

    cb(null, true);
  }
});

export default upload;