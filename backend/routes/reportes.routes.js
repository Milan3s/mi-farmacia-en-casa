// routes/reportes.routes.js
import express from "express";
import { generarReporteInventario } from "../controllers/reportes.controller.js";

const router = express.Router();

/* ============================================================
   📊 Reporte del Inventario de Medicinas
   Solo lectura: genera y devuelve estadísticas actualizadas
============================================================ */

// Obtener estadísticas del inventario
router.get("/inventario", generarReporteInventario);

export default router;
