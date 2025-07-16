// middlewares/auth.js
const jwt = require('jsonwebtoken');
const Client = require('../models/client');

exports.protect = async (req, res, next) => {
  let token;

  // Récupérer le token depuis l'en-tête Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const client = await Client.findById(decoded.id).select('-password');
    if (!client) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    req.client = client;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// Middleware pour restreindre l’accès à certains rôles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.client.role)) {
      return res.status(403).json({ message: 'Accès interdit à ce rôle' });
    }
    next();
  };
};
