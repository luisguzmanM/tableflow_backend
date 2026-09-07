import Joi from "joi";
import { ORDER_STATUSES } from "../domain/OrderStatus";

export const createOrderSchema = Joi.object({
  qrToken: Joi.string().trim().required().messages({
    "any.required": "Table QR token is required",
  }),
  items: Joi.array()
    .min(1)
    .items(
      Joi.object({
        menuItemId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
        modifierIds: Joi.array().items(Joi.string()).optional(),
      })
    )
    .required()
    .messages({
      "array.min": "Order must contain at least one item",
      "any.required": "Items are required",
    }),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUSES)
    .required()
    .messages({
      "any.only": `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
      "any.required": "Status is required",
    }),
});

export const payOrderSchema = Joi.object({
  paymentMethod: Joi.string().valid("CASH", "CARD").required(),
  paidBy: Joi.string().optional(),
});
