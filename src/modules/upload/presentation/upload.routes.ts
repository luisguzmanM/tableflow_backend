import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { requireAuth, requireRole } from "../../auth/presentation/auth.middleware";

export function createUploadRouter(): Router {
  const router = Router();

  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, "../../../../public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Solo se permiten imágenes"));
      }
    },
  });

  router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    upload.single("image"),
    (req: Request, res: Response) => {
      if (!req.file) {
        res.status(400).json({ error: "No se ha proporcionado ninguna imagen" });
        return;
      }

      // Return the public URL for the uploaded file
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      res.status(201).json({ url: fileUrl });
    }
  );

  return router;
}
