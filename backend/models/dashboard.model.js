import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título de la card es obligatorio"],
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
      default: "fas fa-square",
    },
    color: {
      type: String,
      trim: true,
      default: "#0d6efd", // color por defecto
    },
    component: {
      type: String,
      trim: true,
      default: "",
    },
    path: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    position: {
      row: { type: Number, default: 0 },
      col: { type: Number, default: 0 },
    },
    size: {
      width: { type: Number, default: 4 },
      height: { type: Number, default: 1 },
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rol",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, _id: true }
);

const dashboardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del dashboard es obligatorio"],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cards: {
      type: [cardSchema],
      default: [],
    },
  },
  { versionKey: false, timestamps: true }
);

// 👇 ESTE ES EL PUNTO CLAVE: exportación por defecto
const Dashboard = mongoose.model("Dashboard", dashboardSchema, "dashboards");
export default Dashboard;
