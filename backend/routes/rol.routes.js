import express from "express";
import {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
} from "../controllers/rol.controller.js";

const router = express.Router();

/**
 * @route   GET /api/roles
 * @desc    Obtener todos los roles
 */
router.get("/", getRoles);

/**
 * @route   GET /api/roles/:id
 * @desc    Obtener un rol por su ID
 */
router.get("/:id", getRolById);

/**
 * @route   POST /api/roles
 * @desc    Crear un nuevo rol
 */
router.post("/", createRol);

/**
 * @route   PUT /api/roles/:id
 * @desc    Actualizar un rol existente
 */
router.put("/:id", updateRol);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Eliminar un rol
 */
router.delete("/:id", deleteRol);

export default router;
