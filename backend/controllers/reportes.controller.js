import Inventario from "../models/inventario_de_medicinas.model.js";
import Reporte from "../models/reportes.model.js";

// ============================================================
// 📊 Generar reporte del inventario (solo lectura)
// ============================================================
export const generarReporteInventario = async (req, res) => {
  try {
    // Obtener todas las medicinas del inventario
    const medicinas = await Inventario.find();

    // Si no hay medicinas, devolver estructura vacía
    if (!medicinas.length) {
      return res.status(200).json({
        message: "No hay medicinas registradas en el sistema.",
        reporte: {
          tipo: "inventario",
          total_medicinas: 0,
          disponibles: 0,
          agotadas: 0,
          caducadas: 0,
          valor_total_inventario: 0,
          detalle: { top_costosas: [], total_con_cantidad: 0 },
          fecha_generado: new Date(),
        },
        medicinas: [],
      });
    }

    // ============================================================
    // 🧩 Clasificar estados y actualizar estado si es necesario
    // ============================================================
    const hoy = new Date();
    medicinas.forEach((m) => {
      if (new Date(m.fecha_caducidad) < hoy) {
        m.estado = "Caducado";
      } else if (m.cantidad <= 0) {
        m.estado = "Agotado";
      } else {
        m.estado = "Disponible";
      }
    });

    // ============================================================
    // 📈 Cálculos principales
    // ============================================================
    const total_medicinas = medicinas.length;
    const disponibles = medicinas.filter((m) => m.estado === "Disponible").length;
    const agotadas = medicinas.filter((m) => m.estado === "Agotado").length;
    const caducadas = medicinas.filter((m) => m.estado === "Caducado").length;

    const valor_total_inventario = medicinas.reduce(
      (acc, m) => acc + (m.precio || 0),
      0
    );

    // ============================================================
    // 💰 Detalle: Top 5 medicinas más costosas
    // ============================================================
    const top_costosas = [...medicinas]
      .filter((m) => m.precio && m.precio > 0)
      .sort((a, b) => b.precio - a.precio)
      .slice(0, 5)
      .map((m) => ({
        nombre: m.nombre,
        precio: m.precio,
      }));

    const total_con_cantidad = medicinas.reduce(
      (a, m) => a + (m.cantidad || 0),
      0
    );

    // ============================================================
    // 🗂 Crear y guardar reporte en la colección "reportes"
    // ============================================================
    const reporte = new Reporte({
      tipo: "inventario",
      total_medicinas,
      disponibles,
      agotadas,
      caducadas,
      valor_total_inventario,
      detalle: {
        top_costosas,
        total_con_cantidad,
      },
      fecha_generado: new Date(),
    });

    await reporte.save();

    // ============================================================
    // 📦 Devolver estructura completa al frontend
    // ============================================================
    return res.status(200).json({
      message: "Reporte generado correctamente.",
      reporte,
      medicinas, // se devuelven las medicinas con sus datos completos
    });
  } catch (error) {
    console.error("❌ Error al generar el reporte:", error);
    res.status(500).json({
      message: "Error al generar el reporte del inventario.",
      error: error.message,
    });
  }
};
