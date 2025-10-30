import Dashboard from "../models/dashboard.model.js";

/* ============================================================
   📘 Obtener el único dashboard
============================================================ */
export const getDashboard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne().populate(
      "cards.permissions",
      "name description"
    );
    if (!dashboard) {
      return res.status(404).json({ message: "No hay dashboard creado aún" });
    }

    res.status(200).json({
      message: "Dashboard obtenido correctamente",
      dashboard,
    });
  } catch (error) {
    console.error("❌ Error en getDashboard:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el dashboard", error: error.message });
  }
};

/* ============================================================
   🧩 Crear o actualizar el único dashboard
============================================================ */
export const createOrUpdateDashboard = async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne();

    if (dashboard) {
      dashboard.name = req.body.name || dashboard.name;
      dashboard.description = req.body.description || dashboard.description;

      // Si se envían nuevas cards, se reemplazan
      if (req.body.cards && Array.isArray(req.body.cards)) {
        dashboard.cards = req.body.cards.map((card) => ({
          title: card.title,
          icon: card.icon || "fas fa-square",
          color: card.color || "#0d6efd", // ✅ se incluye color
          description: card.description,
          path: card.path,
          component: card.component,
          position: card.position,
          size: card.size,
          permissions: card.permissions || [],
          isActive: card.isActive ?? true,
        }));
      }

      await dashboard.save();

      return res.status(200).json({
        message: "Dashboard actualizado correctamente",
        dashboard,
      });
    }

    // Si no existe, se crea uno nuevo
    dashboard = new Dashboard({
      name: req.body.name,
      description: req.body.description,
      cards:
        req.body.cards?.map((card) => ({
          title: card.title,
          icon: card.icon || "fas fa-square",
          color: card.color || "#0d6efd", // ✅ aquí también
          description: card.description,
          path: card.path,
          component: card.component,
          position: card.position,
          size: card.size,
          permissions: card.permissions || [],
          isActive: card.isActive ?? true,
        })) || [],
    });

    const saved = await dashboard.save();

    res.status(201).json({
      message: "Dashboard creado correctamente",
      dashboard: saved,
    });
  } catch (error) {
    console.error("❌ Error en createOrUpdateDashboard:", error);
    res
      .status(500)
      .json({ message: "Error al crear o actualizar el dashboard", error: error.message });
  }
};

/* ============================================================
   ➕ Añadir una nueva card al dashboard
============================================================ */
export const addCard = async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne();
    if (!dashboard) {
      return res
        .status(404)
        .json({ message: "No existe un dashboard para añadir la card" });
    }

    const {
      title,
      icon,
      color,
      description,
      path,
      component,
      position,
      size,
      permissions,
      isActive,
    } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ message: "El título de la card es obligatorio" });
    }

    const newCard = {
      title,
      icon: icon || "fas fa-square",
      color: color || "#0d6efd", // ✅ color incluido
      description,
      path,
      component,
      position,
      size,
      permissions: permissions || [],
      isActive: isActive ?? true,
    };

    dashboard.cards.push(newCard);
    await dashboard.save();

    res.status(201).json({
      message: "Card añadida correctamente",
      dashboard,
    });
  } catch (error) {
    console.error("❌ Error en addCard:", error);
    res
      .status(500)
      .json({ message: "Error al añadir la card", error: error.message });
  }
};

/* ============================================================
   ✏️ Actualizar una card específica
============================================================ */
export const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const dashboard = await Dashboard.findOne();

    if (!dashboard)
      return res.status(404).json({ message: "Dashboard no encontrado" });

    const card = dashboard.cards.id(cardId);
    if (!card) return res.status(404).json({ message: "Card no encontrada" });

    const allowedFields = [
      "title",
      "icon",
      "color", // ✅ ahora color se puede actualizar
      "description",
      "path",
      "component",
      "position",
      "size",
      "permissions",
      "isActive",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        card[field] = req.body[field];
      }
    }

    await dashboard.save();

    res.status(200).json({
      message: "Card actualizada correctamente",
      dashboard,
    });
  } catch (error) {
    console.error("❌ Error en updateCard:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar la card", error: error.message });
  }
};

/* ============================================================
   🗑️ Eliminar una card específica
============================================================ */
export const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const dashboard = await Dashboard.findOne();

    if (!dashboard)
      return res.status(404).json({ message: "Dashboard no encontrado" });

    const card = dashboard.cards.id(cardId);
    if (!card) return res.status(404).json({ message: "Card no encontrada" });

    card.deleteOne();
    await dashboard.save();

    res.status(200).json({
      message: "Card eliminada correctamente",
      dashboard,
    });
  } catch (error) {
    console.error("❌ Error en deleteCard:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar la card", error: error.message });
  }
};

/* ============================================================
   🔐 Asignar roles (permisos) a una card
============================================================ */
export const assignRolesToCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { roleIds } = req.body;

    const dashboard = await Dashboard.findOne();
    if (!dashboard)
      return res.status(404).json({ message: "Dashboard no encontrado" });

    const card = dashboard.cards.id(cardId);
    if (!card) return res.status(404).json({ message: "Card no encontrada" });

    card.permissions = roleIds || [];
    await dashboard.save();

    res.status(200).json({
      message: "Permisos asignados correctamente",
      dashboard,
    });
  } catch (error) {
    console.error("❌ Error en assignRolesToCard:", error);
    res
      .status(500)
      .json({ message: "Error al asignar roles a la card", error: error.message });
  }
};

/* ============================================================
   🗑️ Eliminar el dashboard completo
============================================================ */
export const deleteDashboard = async (req, res) => {
  try {
    const deleted = await Dashboard.findOneAndDelete();
    if (!deleted) {
      return res.status(404).json({ message: "No hay dashboard para eliminar" });
    }
    res.status(200).json({ message: "Dashboard eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error en deleteDashboard:", error);
    res
      .status(500)
      .json({ message: "Error al eliminar el dashboard", error: error.message });
  }
};
