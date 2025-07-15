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
  check('name')
    .notEmpty()
    .withMessage('Le nom est obligatoire'),

  check('email')
    .isEmail()
    .withMessage('Un email valide est requis'),

  check('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères'),

  validate
];

// Validation pour la connexion
const validateLogin = [
  check('email')
    .isEmail()
    .withMessage('Email invalide'),

  check('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),

  validate
];

// Validation pour création ou mise à jour de client
const validateClient = [
  body('name').optional().notEmpty().withMessage('Le nom est requis'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('password').optional().isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
  body('phone').optional().isMobilePhone().withMessage('Numéro invalide'),
  body('address').optional().isString().withMessage('Adresse invalide'),
  validate
];

// Exportation des middlewares
module.exports = {
  validateSignup,
  validateLogin,
  validateClient
};
