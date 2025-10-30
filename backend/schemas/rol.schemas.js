import Joi from "joi";

// ============================================================
// Esquema para crear un rol
// ============================================================
export const createRolSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "El nombre del rol es obligatorio",
      "string.min": "El nombre del rol debe tener al menos 3 caracteres",
      "string.max": "El nombre del rol no puede exceder los 50 caracteres",
      "any.required": "El nombre del rol es obligatorio",
    }),

  description: Joi.string()
    .max(200)
    .allow("")
    .messages({
      "string.max": "La descripción no puede exceder los 200 caracteres",
    }),

  isAdmin: Joi.boolean()
    .default(false)
    .messages({
      "boolean.base": "El campo 'isAdmin' debe ser verdadero o falso",
    }),

  defaultRoute: Joi.string()
    .trim()
    .max(100)
    .pattern(/^\/[a-zA-Z0-9/_-]*$/)
    .default("/dashboard")
    .messages({
      "string.pattern.base":
        "La ruta por defecto debe comenzar con '/' y solo puede contener letras, números, guiones o guiones bajos",
      "string.max": "La ruta por defecto no puede exceder los 100 caracteres",
    }),
});

// ============================================================
// Esquema para actualizar un rol
// ============================================================
export const updateRolSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .messages({
      "string.min": "El nombre del rol debe tener al menos 3 caracteres",
      "string.max": "El nombre del rol no puede exceder los 50 caracteres",
    }),

  description: Joi.string()
    .max(200)
    .allow("")
    .messages({
      "string.max": "La descripción no puede exceder los 200 caracteres",
    }),

  isAdmin: Joi.boolean().messages({
    "boolean.base": "El campo 'isAdmin' debe ser verdadero o falso",
  }),

  defaultRoute: Joi.string()
    .trim()
    .max(100)
    .pattern(/^\/[a-zA-Z0-9/_-]*$/)
    .messages({
      "string.pattern.base":
        "La ruta por defecto debe comenzar con '/' y solo puede contener letras, números, guiones o guiones bajos",
      "string.max": "La ruta por defecto no puede exceder los 100 caracteres",
    }),
});
