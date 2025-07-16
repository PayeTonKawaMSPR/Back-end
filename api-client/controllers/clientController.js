// controllers/clientController.js
const Client = require('../models/client');

// Créer un nouveau client
exports.createClient = async (req, res) => {
  try {
    const { name, email, password, phone, address, role, entreprise } = req.body;

    const client = new Client({ name, email, password, phone, address, role, entreprise });
    await client.save();

    res.status(201).json({ message: 'Client créé avec succès', client });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', details: error.message });
  }
};

// Récupérer tous les clients
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un client par ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un client
exports.updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json({ message: 'Client supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
