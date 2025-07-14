const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Voir toutes les commandes
router.get('/', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// Créer une commande
router.post('/', async (req, res) => {
  const newOrder = new Order(req.body);
  await newOrder.save();
  res.status(201).json(newOrder);
});

module.exports = router;
// Modifier une commande
router.put('/:id', async (req, res) => {
  const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// Supprimer une commande
router.delete('/:id', async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Commande supprimée" });
});
