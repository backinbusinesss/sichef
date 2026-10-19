import { handleUpload } from "@vercel/blob/client";
import { json, error, cors } from "./_lib/http.js";
import { requireAdmin } from "./_lib/auth.js";

/**
 * Upload immagini per il pannello admin.
 * Usa Vercel Blob con client upload: il browser carica direttamente,
 * la funzione firma soltanto il token (nessun limite di body 4.5MB).
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== "POST") return error(req, res, 405, "Metodo non consentito.");
  if (!requireAdmin(req, res, json)) return;

  try {
    const result = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
        maximumSizeInBytes: 8 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return json(req, res, 200, result);
  } catch (err) {
    console.error("upload error", err);
    return error(req, res, 500, "Upload non riuscito.");
  }
}
