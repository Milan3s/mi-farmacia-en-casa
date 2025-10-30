import Rol from "../models/rol.model.js";
import { createRolSchema, updateRolSchema } from "../schemas/rol.schemas.js";

// ============================================================
// Obtener todos los roles
// ============================================================
export const getRoles = async (req, res) => {
  try {
    const roles = await Rol.find().sort({ createdAt: -1 }); // ordenados por fecha descendente
    res.status(200).json(roles);
  } catch (error) {
    console.error("❌ Error en getRoles:", error);
    res.status(500).json({
      message: "Error al obtener los roles",
      error: error.message,
    });
  }
};

// ============================================================
// Obtener un rol por ID
// ============================================================
export const getRolById = async (req, res) => {
  try {
    const { id } = req.params;
    const rol = await Rol.findById(id);

    if (!rol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    res.status(200).json(rol);
  } catch (error) {
    console.error("❌ Error en getRolById:", error);
    res.status(500).json({
      message: "Error al obtener el rol",
      error: error.message,
    });
  }
};

// ============================================================
// Crear un nuevo rol
// ============================================================
export const createRol = async (req, res) => {
  try {
    const { error } = createRolSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, isAdmin = false, defaultRoute = "/dashboard" } = req.body;

    // Evitar duplicados
    const rolExists = await Rol.findOne({ name });
    if (rolExists) {
      return res.status(400).json({ message: "El rol ya existe" });
    }

    const newRol = new Rol({ name, description, isAdmin, defaultRoute });
    const savedRol = await newRol.save();

    res.status(201).json({
      message: "Rol creado correctamente",
      rol: savedRol,
    });
  } catch (error) {
    console.error("❌ Error en createRol:", error);
    res.status(500).json({
      message: "Error al crear el rol",
      error: error.message,
    });
  }
};

// ============================================================
// Actualizar un rol existente
// ============================================================
export const updateRol = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = updateRolSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, description, isAdmin, defaultRoute } = req.body;

    const updatedRol = await Rol.findByIdAndUpdate(
      id,
      { name, description, isAdmin, defaultRoute },
      { new: true }
    );

    if (!updatedRol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    res.status(200).json({
      message: "Rol actualizado correctamente",
      rol: updatedRol,
    });
  } catch (error) {
    console.error("❌ Error en updateRol:", error);
    res.status(500).json({
      message: "Error al actualizar el rol",
      error: error.message,
    });
  }
};

// ============================================================
// Eliminar un rol
// ============================================================
export const deleteRol = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRol = await Rol.findByIdAndDelete(id);
    if (!deletedRol) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    res.status(200).json({ message: "Rol eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error en deleteRol:", error);
    res.status(500).json({
      message: "Error al eliminar el rol",
      error: error.message,
    });
  }
};
