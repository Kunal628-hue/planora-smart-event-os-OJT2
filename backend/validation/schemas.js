import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const eventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  location: Joi.string().required(),
  city: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  date: Joi.string().required(),
  user: Joi.string().required(),
  budget: Joi.number().allow(null),
  status: Joi.string().allow('', null),
  type: Joi.string().allow('', null),
  registrationConfig: Joi.object().allow(null)
});

export const vendorSchema = Joi.object({
  name: Joi.string().required(),
  serviceType: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().allow('', null),
  rating: Joi.number().allow(null),
  status: Joi.string().allow('', null),
  eventId: Joi.string().required()
});

export const guestSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  status: Joi.string().allow('', null),
  eventId: Joi.string().required(),
  role: Joi.string().allow('', null)
});
