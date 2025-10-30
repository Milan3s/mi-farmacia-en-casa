import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import methodOverride from "method-override";
import connectDB from "./config/db.js";

// =====================================================
// 📦 Importar rutas
// =====================================================
import userRoutes from "./routes/user.routes.js";
import rolRoutes from "./routes/rol.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";

// =====================================================
// ⚙️ Configuración inicial
// =====================================================
dotenv.config();
connectDB();

const app = express();

// =====================================================
// 🌍 Middlewares globales
// =====================================================
app.use(
  cors({
    origin: "http://localhost:5173", // frontend Vite
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Permitir sobrescribir métodos HTTP (para PUT con multipart/form-data)
app.use(methodOverride("_method"));

// =====================================================
// 🖼️ Servir archivos estáticos (imágenes subidas)
// =====================================================
const uploadsPath = path.resolve("public", "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📁 Carpeta 'public/uploads' creada automáticamente");
}

app.use("/uploads", express.static(uploadsPath));

// =====================================================
// 📦 Rutas principales del API
// =====================================================
app.use("/api/users", userRoutes);
app.use("/api/roles", rolRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/reportes", reportesRoutes);

// =====================================================
// 🧭 Ruta base (test del servidor)
// =====================================================
app.get("/api", (req, res) => {
  res.send("✅ API del Inventario de Medicinas funcionando correctamente");
});

// =====================================================
// ⚠️ Middleware global de manejo de errores (incluye Multer)
// =====================================================
app.use((err, req, res, next) => {
  if (err.message?.includes("Solo se permiten imágenes")) {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ message: "El archivo excede el tamaño máximo permitido (5 MB)." });
  }

  console.error("❌ Error global:", err);
  res.status(500).json({ message: "Error interno del servidor." });
});

// =====================================================
// 🚀 Inicio del servidor
// =====================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`🩺 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🖼️ Imágenes servidas desde: http://localhost:${PORT}/uploads`);
});

export default app;
