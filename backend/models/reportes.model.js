import mongoose from "mongoose";

const reporteSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: ["inventario", "otro"], // puedes añadir más tipos de reportes
    },
    total_medicinas: {
      type: Number,
      default: 0,
    },
    disponibles: {
      type: Number,
      default: 0,
    },
    agotadas: {
      type: Number,
      default: 0,
    },
    caducadas: {
      type: Number,
      default: 0,
    },
    valor_total_inventario: {
      type: Number,
      default: 0,
    },
    detalle: {
      top_costosas: [
        {
          nombre: String,
          precio: Number,
        },
      ],
      total_con_cantidad: {
        type: Number,
        default: 0,
      },
    },
    fecha_generado: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

// Forzar nombre de colección "reportes"
const Reporte = mongoose.model("Reporte", reporteSchema, "reportes");

export default Reporte;
