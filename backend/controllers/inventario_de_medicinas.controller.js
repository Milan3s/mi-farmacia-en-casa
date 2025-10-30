import Inventario from "../models/inventario_de_medicinas.model.js";
import fs from "fs";
import path from "path";

/* ============================================================
   📋 Obtener todos los medicamentos
============================================================ */
export const getAllMedicinas = async (req, res) => {
  try {
    const medicinas = await Inventario.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Lista de medicinas obtenida correctamente",
      medicinas,
    });
  } catch (error) {
    console.error("❌ Error en getAllMedicinas:", error);
    res.status(500).json({ message: "Error al obtener las medicinas" });
  }
};

/* ============================================================
   🔍 Obtener una medicina por ID
============================================================ */
export const getMedicinaById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicina = await Inventario.findById(id);

    if (!medicina) {
      return res.status(404).json({ message: "Medicina no encontrada" });
    }

    res.status(200).json({
      message: "Medicina obtenida correctamente",
      medicina,
    });
  } catch (error) {
    console.error("❌ Error en getMedicinaById:", error);
    res.status(500).json({ message: "Error al obtener la medicina" });
  }
};

/* ============================================================
   ➕ Crear una o varias medicinas (con imagen)
============================================================ */
export const createMedicina = async (req, res) => {
  try {
    const data = req.body;

    // ✅ Si es un array, insertar múltiples registros
    if (Array.isArray(data)) {
      const result = await Inventario.insertMany(data);
      return res.status(201).json({
        message: `✅ ${result.length} medicinas creadas correctamente`,
        medicinas: result,
      });
    }

    const {
      nombre,
      descripcion,
      fecha_compra,
      fecha_caducidad,
      cantidad,
      proveedor,
      precio,
      precio_por_unidad,
    } = data;

    if (!nombre || !fecha_compra || !fecha_caducidad || !precio) {
      return res.status(400).json({
        message:
          "Los campos 'nombre', 'fecha_compra', 'fecha_caducidad' y 'precio' son obligatorios.",
      });
    }

    // 💰 Calcular automáticamente el precio por unidad si no se envía
    const precioUnidad =
      precio_por_unidad && precio_por_unidad > 0
        ? precio_por_unidad
        : cantidad > 0
        ? precio / cantidad
        : 0;

    const nuevaMedicina = new Inventario({
      nombre,
      descripcion,
      fecha_compra,
      fecha_caducidad,
      cantidad,
      proveedor,
      precio,
      precio_por_unidad: precioUnidad,
      foto: req.file ? req.file.filename : null, // ✅ Guarda solo el nombre de archivo
    });

    const saved = await nuevaMedicina.save();

    res.status(201).json({
      message: "✅ Medicina creada correctamente",
      medicina: saved,
    });
  } catch (error) {
    console.error("❌ Error en createMedicina:", error);
    res.status(500).json({ message: "Error al crear la medicina", error });
  }
};

/* ============================================================
   ✏️ Actualizar una medicina (con reemplazo de imagen)
============================================================ */
export const updateMedicina = async (req, res) => {
  try {
    const { id } = req.params;
    const medicina = await Inventario.findById(id);

    if (!medicina) {
      return res.status(404).json({ message: "Medicina no encontrada" });
    }

    // 📷 Si llega una nueva imagen, eliminar la anterior
    if (req.file) {
      const oldPath = path.join(process.cwd(), "public", "uploads", medicina.foto || "");
      if (medicina.foto && fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      medicina.foto = req.file.filename;
    }

    // 🧩 Actualizar campos
    const campos = [
      "nombre",
      "descripcion",
      "fecha_compra",
      "fecha_caducidad",
      "cantidad",
      "proveedor",
      "precio",
      "precio_por_unidad",
    ];

    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        medicina[campo] = req.body[campo];
      }
    });

    // 💰 Recalcular precio por unidad si el precio o cantidad cambian
    if (
      (!medicina.precio_por_unidad || medicina.precio_por_unidad === 0) &&
      medicina.cantidad > 0
    ) {
      medicina.precio_por_unidad = medicina.precio / medicina.cantidad;
    }

    const updated = await medicina.save();

    res.status(200).json({
      message: "✅ Medicina actualizada correctamente",
      medicina: updated,
    });
  } catch (error) {
    console.error("❌ Error en updateMedicina:", error);
    res.status(500).json({ message: "Error al actualizar la medicina" });
  }
};

/* ============================================================
   ✏️ Actualizar múltiples medicinas a la vez (bulk update)
============================================================ */
export const updateManyMedicinas = async (req, res) => {
  try {
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: "Debe enviar un array de medicinas para actualizar" });
    }

    let actualizadas = 0;
    let noEncontradas = [];

    for (const item of data) {
      // Buscar por ID o por nombre si no hay ID
      const query = item._id ? { _id: item._id } : { nombre: item.nombre };
      const medicina = await Inventario.findOne(query);

      if (!medicina) {
        noEncontradas.push(item.nombre || item._id);
        continue;
      }

      // Actualizar campos presentes
      Object.keys(item).forEach((campo) => {
        if (item[campo] !== undefined && campo !== "_id") {
          medicina[campo] = item[campo];
        }
      });

      // Calcular automáticamente el precio por unidad si corresponde
      if (
        (!medicina.precio_por_unidad || medicina.precio_por_unidad === 0) &&
        medicina.precio &&
        medicina.cantidad > 0
      ) {
        medicina.precio_por_unidad = medicina.precio / medicina.cantidad;
      }

      await medicina.save();
      actualizadas++;
    }

    res.status(200).json({
      message: `✅ ${actualizadas} medicinas actualizadas correctamente`,
      no_encontradas: noEncontradas,
    });
  } catch (error) {
    console.error("❌ Error en updateManyMedicinas:", error);
    res.status(500).json({ message: "Error al actualizar múltiples medicinas", error });
  }
};

/* ============================================================
   🗑️ Eliminar una medicina (y su imagen)
============================================================ */
export const deleteMedicina = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inventario.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Medicina no encontrada" });
    }

    // 📸 Eliminar imagen asociada si existe
    if (deleted.foto) {
      const imgPath = path.join(process.cwd(), "public", "uploads", deleted.foto);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    res.status(200).json({
      message: "🗑️ Medicina eliminada correctamente",
      medicina: deleted,
    });
  } catch (error) {
    console.error("❌ Error en deleteMedicina:", error);
    res.status(500).json({ message: "Error al eliminar la medicina" });
  }
};
