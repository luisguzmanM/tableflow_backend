import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  position: Joi.number().integer().min(0).optional(),
});

export const createMenuItemSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().allow("", null).optional(),
  price: Joi.number().positive().precision(2).required(),
  image: Joi.string().uri().allow("", null).optional(),
  available: Joi.boolean().default(true),
  position: Joi.number().integer().min(0).optional(),
});

export const toggleAvailabilitySchema = Joi.object({
  available: Joi.boolean().required(),
});

export const updateMenuItemSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  name: Joi.string().trim().min(1).max(255).required(),
  description: Joi.string().allow("", null).optional(),
  price: Joi.number().positive().precision(2).required(),
  image: Joi.string().uri().allow("", null).optional(),
});
