import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(254).trim().required(),
  password: Joi.string().min(8).max(128).required()
});

export const registerSchema = Joi.object({
  name: Joi.string().max(80).trim().required(),
  email: Joi.string().email({ tlds: { allow: false } }).max(254).trim().required(),
  password: Joi.string().min(8).max(128).required()
});

export const eventSchema = Joi.object({
  title: Joi.string().max(100).trim().optional(),
  name: Joi.string().max(100).trim().optional(),
  description: Joi.string().max(5000).allow('', null).optional(),
  location: Joi.string().max(200).trim().required(),
  city: Joi.string().max(80).allow('', null).optional(),
  country: Joi.string().max(80).allow('', null).optional(),
  date: Joi.string().max(50).required(),
  user: Joi.string().max(128).required(),
  budget: Joi.number().min(0).max(10_000_000_000).allow(null).optional(),
  status: Joi.string().valid("Planned", "Active", "Completed", "Cancelled").allow('', null).optional(),
  type: Joi.string().max(50).allow('', null).optional(),
  registrationConfig: Joi.object().allow(null).optional()
});

export const vendorSchema = Joi.object({
  name: Joi.string().max(80).trim().required(),
  service: Joi.string().max(80).allow('', null).optional(),
  serviceType: Joi.string().max(80).allow('', null).optional(),
  contact: Joi.string().max(200).allow('', null).optional(),
  email: Joi.string().email({ tlds: { allow: false } }).max(254).allow('', null).optional(),
  phone: Joi.string().max(20).allow('', null).optional(),
  cost: Joi.number().min(0).max(10_000_000_000).allow(null).optional(),
  rating: Joi.number().min(0).max(5).allow(null).optional(),
  status: Joi.string().valid("Inquiry", "Booked", "Paid", "Unpaid", "Pending").allow('', null).optional(),
  event: Joi.string().max(128).allow('', null).optional(),
  eventId: Joi.string().max(128).allow('', null).optional(),
  user: Joi.string().max(128).allow('', null).optional()
});

export const guestSchema = Joi.object({
  name: Joi.string().max(80).trim().required(),
  email: Joi.string().email({ tlds: { allow: false } }).max(254).trim().allow('', null).optional(),
  phone: Joi.string().max(20).allow('', null).optional(),
  whatsapp: Joi.string().max(20).allow('', null).optional(),
  status: Joi.string().valid("Pending", "Confirmed", "Declined", "Rejected").allow('', null).optional(),
  event: Joi.string().max(128).allow('', null).optional(),
  eventId: Joi.string().max(128).allow('', null).optional(),
  role: Joi.string().max(50).allow('', null).optional()
});
