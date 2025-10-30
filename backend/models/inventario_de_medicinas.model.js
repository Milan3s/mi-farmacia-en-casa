import mongoose from "mongoose";

const inventarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la medicina es obligatorio"],
      trim: true,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [150, "El nombre no puede exceder los 150 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder los 500 caracteres"],
      default: "Sin descripción",
    },
    foto: {
      type: String,
      trim: true,
      default: "", // URL o nombre de archivo en el servidor
    },
    fecha_compra: {
      type: Date,
      required: [true, "La fecha de compra es obligatoria"],
    },
    fecha_caducidad: {
      type: Date,
      required: [true, "La fecha de caducidad es obligatoria"],
      validate: {
        validator: function (v) {
          // La caducidad debe ser posterior a la compra
          return !this.fecha_compra || v > this.fecha_compra;
        },
        message: "La fecha de caducidad debe ser posterior a la fecha de compra",
      },
    },
    cantidad: {
      type: Number,
      default: 0,
      min: [0, "La cantidad no puede ser negativa"],
    },
    proveedor: {
      type: String,
      trim: true,
      maxlength: [150, "El nombre del proveedor no puede exceder los 150 caracteres"],
      default: "Desconocido",
    },
    // 💰 Campos nuevos
    precio: {
      type: Number,
      required: [true, "El precio total es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    precio_por_unidad: {
      type: Number,
      min: [0, "El precio por unidad no puede ser negativo"],
      default: 0,
    },
    estado: {
      type: String,
      enum: ["Disponible", "Agotado", "Caducado"],
      default: "Disponible",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// Middleware: actualizar estado automáticamente según la caducidad
inventarioSchema.pre("save", function (next) {
  const hoy = new Date();
  if (this.fecha_caducidad < hoy) {
    this.estado = "Caducado";
  } else if (this.cantidad === 0) {
    this.estado = "Agotado";
  } else {
    this.estado = "Disponible";
  }

  // Calcular automáticamente el precio por unidad si no se proporcionó
  if (this.cantidad > 0 && this.precio && (!this.precio_por_unidad || this.precio_por_unidad === 0)) {
    this.precio_por_unidad = this.precio / this.cantidad;
  }

  next();
});

// Forzar colección "inventario_de_medicinas"
const Inventario = mongoose.model("Inventario", inventarioSchema, "inventario_de_medicinas");
export default Inventario;
