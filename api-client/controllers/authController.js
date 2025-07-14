const Client = require('../models/client');
const jwt = require('jsonwebtoken');

// Fonction utilitaire : génère un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

// 🔹 POST /auth/signup → Création d’un utilisateur
exports.signup = async (req, res) => {
  console.log('📝 Requête reçue dans signup:', req.body);

  const { name, email, password, phone, address } = req.body;

  try {
    const userExists = await Client.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    const client = await Client.create({ name, email, password, phone, address });

    res.status(201).json({
      message: 'Compte créé avec succès',
      token: generateToken(client._id),
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
      },
    });
  } catch (error) {
    console.error('❌ Erreur dans signup:', error.message);
    res.status(500).json({ message: 'Erreur serveur', details: error.message });
  }
};

// 🔹 POST /auth/login → Connexion utilisateur
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(400).json({ message: 'Utilisateur introuvable' });
    }

    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    res.status(200).json({
      message: 'Connexion réussie',
      token: generateToken(client._id),
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
      },
    });
  } catch (error) {
    console.error('❌ Erreur dans login:', error.message);
    res.status(500).json({ message: 'Erreur serveur', details: error.message });
  }
};
