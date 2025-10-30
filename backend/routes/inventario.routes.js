import express from "express";
import upload from "../middlewares/upload.js";
import {
  getAllMedicinas,
  getMedicinaById,
  createMedicina,
  updateMedicina,
  updateManyMedicinas, // ✅ nuevo controlador
  deleteMedicina,
} from "../controllers/inventario_de_medicinas.controller.js";

const router = express.Router();

/* ============================================================
   📋 Rutas del Inventario de Medicinas
============================================================ */

// Obtener todas las medicinas
router.get("/", getAllMedicinas);

// Obtener una medicina por ID
router.get("/:id", getMedicinaById);

// Crear una nueva medicina (con imagen)
router.post("/", upload.single("foto"), createMedicina);

// Actualizar múltiples medicinas (bulk update con JSON)
router.put("/", updateManyMedicinas); // ✅ nuevo endpoint

// Actualizar una medicina existente (con opción de cambiar imagen)
router.put("/:id", upload.single("foto"), updateMedicina);

// Eliminar una medicina
router.delete("/:id", deleteMedicina);

export default router;
