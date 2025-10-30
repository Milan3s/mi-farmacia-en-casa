import multer from "multer";
import path from "path";
import fs from "fs";

// ============================================================
// 📁 Directorio de destino absoluto (seguro para cualquier entorno)
// ============================================================
const uploadDir = path.join(process.cwd(), "public", "uploads");

// Si no existe la carpeta, la creamos
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Carpeta 'public/uploads' creada automáticamente.");
}

// ============================================================
// ⚙️ Configuración del almacenamiento con Multer
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext);
    const safeName = baseName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, `${safeName}_${unique}${ext}`);
  },
});

// ============================================================
// 🧱 Filtro para validar solo imágenes
// ============================================================
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Solo se permiten imágenes (jpg, jpeg, png, webp)."), false);
};

// ============================================================
// 📦 Middleware de subida listo para exportar
// ============================================================
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
