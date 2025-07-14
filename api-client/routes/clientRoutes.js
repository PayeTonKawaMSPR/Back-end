// routes/clientRoutes.js
const express = require('express');
const router = express.Router();

const {
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  createClient
} = require('../controllers/clientController');

const { protect } = require('../middlewares/auth');

// Toutes les routes sont protégées (authentification JWT)
router.get('/', protect, getClients);             // Récupérer tous les clients
router.get('/:id', protect, getClientById);       // Récupérer un client par ID
router.put('/:id', protect, updateClient);        // Modifier un client
router.post('/', protect, createClient);
router.delete('/:id', protect, deleteClient);     // Supprimer un client

module.exports = router;
