import Joi from 'joi';

export const bookingSchema = Joi.object({
  roomId: Joi.number().positive().required(),
});

export const bookingParamsSchema = Joi.object({
  bookingId: Joi.number().positive(),
});
