// controllers/authController.js
const Client = require('../models/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
  try {
    console.log('📝 Requête reçue dans signup:', req.body);

    const { name, email, password, phone, address, role, entreprise } = req.body;

    const clientExist = await Client.findOne({ email });
    if (clientExist) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const client = new Client({
      name,
      email,
      password,
      phone,
      address,
      role,
      entreprise
    });

    await client.save();

    const token = jwt.sign(
      { id: client._id, role: client.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ message: 'Compte client créé avec succès', token, client });
  } catch (error) {
    console.error('❌ Erreur dans signup:', error.message);
    res.status(500).json({ message: 'Erreur serveur', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cet email.' });
    }

    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: client._id, role: client.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ message: 'Connexion réussie', token, client });
  } catch (error) {
    console.error('❌ Erreur dans login:', error.message);
    res.status(500).json({ message: 'Erreur serveur', details: error.message });
  }
};
