const { validationResult } = require('express-validator');
const Client = require('../models/client');
const { getChannel } = require('../config/rabbit'); // 🔁 ajout pour RabbitMQ

// GET /clients
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().select('-password');
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// GET /clients/:id
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('-password');
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// PUT /clients/:id
exports.updateClient = async (req, res) => {
  try {
    const updates = req.body;
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
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// DELETE /clients/:id
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// POST /clients → Créer un client + publier dans RabbitMQ
exports.createClient = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Vérifie si l'email est déjà utilisé
    const existing = await Client.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const newClient = new Client({ name, email, password, phone, address });
    await newClient.save();

    // 🔁 ENVOI DU MESSAGE À RABBITMQ
    const channel = getChannel();
    if (channel) {
      const queue = 'nouveau_client';
      await channel.assertQueue(queue, { durable: false });

      const payload = {
        id: newClient._id,
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        address: newClient.address,
      };

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
      console.log('📤 Client envoyé à RabbitMQ :', payload);
    } else {
      console.warn('⚠️ Channel RabbitMQ non disponible');
    }

    res.status(201).json({ message: 'Client créé avec succès', client: newClient });
  } catch (error) {
    next(error);
  }
};
