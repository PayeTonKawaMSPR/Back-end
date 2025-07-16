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
const { restrictTo } = require('../middlewares/role');
const { validateClient } = require('../validations/clientValidation');

// Toutes les routes sont protégées (authentification JWT)
router.get('/', protect, getClients);             // ✅ Récupérer tous les clients
router.get('/:id', protect, getClientById);       // ✅ Récupérer un client par ID
router.post('/', protect, validateClient, createClient); // ✅ Créer un client avec validation
router.put('/:id', protect, validateClient, updateClient); // ✅ Modifier un client avec validation
router.delete('/:id', protect, deleteClient);     // ✅ Supprimer un client

// ✅ Route test pour admin uniquement
router.get('/admin-only', protect, restrictTo('admin'), (req, res) => {
  res.json({ message: 'Bienvenue, admin !' });
});

module.exports = router;
