import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "A valid email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});

export const registerSchema = Joi.object({
  restaurantName: Joi.string().min(2).max(255).required().messages({
    "string.min": "Restaurant name must be at least 2 characters",
    "any.required": "Restaurant name is required",
  }),
  adminName: Joi.string().min(2).max(255).required().messages({
    "string.min": "Admin name must be at least 2 characters",
    "any.required": "Admin name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "A valid email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
});
