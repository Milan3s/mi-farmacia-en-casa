import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Rol from "../models/rol.model.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.schemas.js";

/* ============================================================
   📘 Obtener todos los usuarios (sin contraseñas, con rol)
============================================================ */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("rol", "name description");
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error en getUsers:", error);
    res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

/* ============================================================
   📘 Obtener usuario por ID (incluye rol)
============================================================ */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ message: "ID de usuario no válido" });
    }

    const user = await User.findById(id)
      .select("-password")
      .populate("rol", "name description");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error en getUserById:", error);
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

/* ============================================================
   🧩 Registrar nuevo usuario (nombre único)
============================================================ */
export const createUser = async (req, res) => {
  try {
    console.log("📥 Datos recibidos en createUser:", req.body);

    const { error } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password } = req.body;

    // Validar unicidad del nombre y email
    const [userByName, userByEmail] = await Promise.all([
      User.findOne({ name }),
      User.findOne({ email }),
    ]);

    if (userByName)
      return res.status(400).json({ message: "El nombre ya está registrado" });
    if (userByEmail)
      return res.status(400).json({ message: "El email ya está registrado" });

    // Crear usuario (el modelo maneja el hash)
    const newUser = new User({ name, email, password });
    const savedUser = await newUser.save();

    console.log(`✅ Usuario creado: ${savedUser.name} (${savedUser.email})`);

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Error en createUser:", error);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
};

/* ============================================================
   ✏️ Actualizar usuario (solo nombre y email)
============================================================ */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    )
      .select("-password")
      .populate("rol", "name description");

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Usuario actualizado correctamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error en updateUser:", error);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
};

/* ============================================================
   🗑️ Eliminar usuario
============================================================ */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log(`🗑️ Usuario eliminado: ${deletedUser.name}`);
    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error en deleteUser:", error);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

/* ============================================================
   🔐 Login (autenticación por nombre y contraseña)
============================================================ */
export const loginUser = async (req, res) => {
  try {
    const { name, password } = req.body;

    console.log("🔐 Intento de login:", name);

    const user = await User.findOne({ name }).select("+password").populate("rol", "name");
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }

    console.log(`✅ Login exitoso: ${name}`);

    res.status(200).json({
      success: true,
      message: "Login correcto",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        rol: user.rol || null,
      },
    });
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
};

/* ============================================================
   🧱 Asignar un rol a un usuario
============================================================ */
export const assignRolToUser = async (req, res) => {
  try {
    const { userId, rolId } = req.body;

    if (!userId || !rolId) {
      return res.status(400).json({ message: "userId y rolId son obligatorios" });
    }

    const [user, rol] = await Promise.all([
      User.findById(userId),
      Rol.findById(rolId),
    ]);

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    if (!rol) return res.status(404).json({ message: "Rol no encontrado" });

    user.rol = rol._id;
    await user.save();

    const updatedUser = await user.populate("rol", "name description");

    res.status(200).json({
      message: `Rol '${rol.name}' asignado correctamente a '${user.name}'`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error al asignar rol:", error);
    res.status(500).json({ message: "Error al asignar el rol al usuario" });
  }
};
