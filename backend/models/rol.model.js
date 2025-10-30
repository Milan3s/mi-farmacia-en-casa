import mongoose from "mongoose";

const rolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del rol es obligatorio"],
      unique: true,
      trim: true,
      minlength: [3, "El nombre del rol debe tener al menos 3 caracteres"],
      maxlength: [50, "El nombre del rol no puede exceder los 50 caracteres"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "La descripción no puede exceder los 200 caracteres"],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    defaultRoute: {
      type: String,
      trim: true,
      default: "/dashboard",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Rol = mongoose.model("Rol", rolSchema, "roles");
export default Rol;
