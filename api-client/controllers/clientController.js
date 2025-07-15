const { validationResult } = require('express-validator');
const Client = require('../models/client');

// GET /clients → Récupérer tous les clients (hors mot de passe)
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().select('-password');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// GET /clients/:id → Récupérer un seul client par ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('-password');
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// PUT /clients/:id → Modifier les données d’un client
exports.updateClient = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Protéger les champs sensibles
    delete updates.email;
    delete updates.password;

    const client = await Client.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// DELETE /clients/:id → Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    res.status(200).json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// POST /clients → Créer un nouveau client
exports.createClient = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Vérifier si l'email est déjà utilisé
    const existing = await Client.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const newClient = new Client({ name, email, password, phone, address });
    await newClient.save();

    // Supprimer le mot de passe avant retour
    const clientSafe = newClient.toObject();
    delete clientSafe.password;

    res.status(201).json({ message: 'Client créé avec succès', client: clientSafe });
  } catch (error) {
    next(error);
  }
};
