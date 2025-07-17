// validations/clientValidation.js
const { check, body, validationResult } = require('express-validator');

// Middleware générique pour gérer les erreurs de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation pour l'inscription
const validateSignup = [
  check('name').notEmpty().withMessage('Le nom est obligatoire'),
  check('email').isEmail().withMessage('Un email valide est requis'),
  check('password').isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
  check('role').notEmpty().withMessage('Le rôle est requis'),
  check('entreprise').notEmpty().withMessage('L’entreprise est requise'),
  validate
];

// Validation pour la connexion
const validateLogin = [
  check('email').isEmail().withMessage('Email invalide'),
  check('password').notEmpty().withMessage('Mot de passe requis'),
  validate
];

// Validation pour création / mise à jour client
const validateClient = [
  body('name').optional().notEmpty().withMessage('Le nom est requis'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('password').optional().isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
  body('phone').optional().isMobilePhone().withMessage('Numéro invalide'),
  body('address').optional().isString().withMessage('Adresse invalide'),
  body('role').optional().notEmpty().withMessage('Le rôle est requis'),
  body('entreprise').optional().notEmpty().withMessage('L’entreprise est requise'),
  validate
];

module.exports = {
  validateSignup,
  validateLogin,
  validateClient
};
