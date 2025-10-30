import Joi from "joi";

// Esquema básico para crear usuario (sin validaciones estrictas)
export const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
});

// Esquema básico para actualizar usuario
export const updateUserSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  password: Joi.string(),
});
