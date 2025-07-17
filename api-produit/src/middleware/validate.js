// src/middleware/validate.js
const Joi = require('joi');

// Schéma de validation
const productSchema = Joi.object({
  nom: Joi.string().min(2).max(100).required(),
  prix: Joi.number().min(0).required(),
  description: Joi.string().allow('').max(500),
  Stock: Joi.number().integer().min(0).required(),
});

// Middleware générique
exports.validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(422).json({ message: error.details[0].message });
  }
  next();
};

exports.getProductSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  search: Joi.string().allow('').max(100)
});

exports.patchProductSchema = Joi.object({
  nom: Joi.string().min(2).max(100),
  prix: Joi.number().min(0),
  description: Joi.string().allow('').max(500),
  Stock: Joi.number().integer().min(0)
}).min(1);

// Exporter le schéma spécifique
exports.productSchema = productSchema;
