// middlewares/auth.js
const jwt = require('jsonwebtoken');
const Client = require('../models/client');

exports.protect = async (req, res, next) => {
  let token;

  // Récupérer le token depuis les headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attacher le client à la requête (utile dans les routes privées)
    req.client = await Client.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};
