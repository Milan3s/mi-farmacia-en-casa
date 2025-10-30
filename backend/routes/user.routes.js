import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  assignRolToUser,
} from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @route   POST /api/users/login
 * @desc    Iniciar sesión de usuario
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/users/assign-role
 * @desc    Asignar un rol a un usuario
 */
router.post("/assign-role", assignRolToUser);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 */
router.get("/", getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 */
router.get("/:id", getUserById);

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 */
router.post("/", createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario existente
 */
router.put("/:id", updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario
 */
router.delete("/:id", deleteUser);

export default router;
