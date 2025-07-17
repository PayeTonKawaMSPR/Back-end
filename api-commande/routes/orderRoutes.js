const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { validateBody, validateQuery, validateIdParam } = require('../middleware/validate');
const auth = require('../middleware/auth');
const { publish, getChannel } = require('../config/rabbit');
const { incrementRabbitMQMetrics } = require('../middleware/metrics');
const Joi = require('joi');

// Schémas de validation
const orderSchema = Joi.object({
  customerId: Joi.string().required(),
  products: Joi.array().items(
    Joi.object({ 
      productId: Joi.string().required(), 
      quantity: Joi.number().integer().min(1).required() 
    })
  ).min(1).required(),
  status: Joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').default('pending')
});

const querySchema = Joi.object({ 
  page: Joi.number().integer().min(1).default(1), 
  limit: Joi.number().integer().min(1).default(10) 
});

// Fonction helper pour publier avec métriques
async function publishWithMetrics(exchange, routingKey, data) {
  try {
    await publish(exchange, routingKey, data);
    // Incrémenter les métriques RabbitMQ
    incrementRabbitMQMetrics(exchange, routingKey);
  } catch (error) {
    console.error(`Erreur lors de la publication ${routingKey}:`, error);
    throw error;
  }
}

// CREATE - Créer une nouvelle commande
router.post('/', validateBody(orderSchema), async (req, res, next) => {
  try {
    const doc = await Order.create(req.body);
    
    // Publier l'événement avec métriques
    await publishWithMetrics('mspr.exchange', 'order.created', doc);
    
    res.status(201).json(doc);
  } catch (err) { 
    next(err); 
  }
});

// LIST - Récupérer toutes les commandes avec pagination
router.get('/', validateQuery(querySchema), async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    
    const [total, data] = await Promise.all([
      Order.countDocuments(),
      Order.find().skip(skip).limit(limit).sort({ createdAt: -1 })
    ]);
    
    res.json({ 
      page: parseInt(page), 
      limit: parseInt(limit), 
      total, 
      data 
    });
  } catch (err) { 
    next(err); 
  }
});

// GET - Récupérer une commande par ID
router.get('/:id', validateIdParam, async (req, res, next) => {
  try {
    const doc = await Order.findById(req.params.id);
    
    if (!doc) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(doc);
  } catch (e) { 
    next(e); 
  }
});

// UPDATE - Mettre à jour une commande
router.put('/:id', validateIdParam, validateBody(orderSchema), async (req, res, next) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Publier l'événement avec métriques
    await publishWithMetrics('mspr.exchange', 'order.updated', updated);
    
    res.json(updated);
  } catch (e) { 
    next(e); 
  }
});

// DELETE - Supprimer une commande
router.delete('/:id', validateIdParam, async (req, res, next) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Publier l'événement avec métriques
    await publishWithMetrics('mspr.exchange', 'order.deleted', { id: req.params.id });
    
    res.status(204).end();
  } catch (e) { 
    next(e); 
  }
});

// PATCH - Mettre à jour le statut d'une commande (endpoint spécialisé)
router.patch('/:id/status', validateIdParam, async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Validation du statut
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Status invalide', 
        validStatuses 
      });
    }
    
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Publier l'événement avec métriques
    await publishWithMetrics('mspr.exchange', 'order.status.updated', {
      id: updated._id,
      status: updated.status,
      customerId: updated.customerId
    });
    
    res.json(updated);
  } catch (e) { 
    next(e); 
  }
});

// GET - Statistiques des commandes par statut
router.get('/stats/status', async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Formatter les résultats pour inclure tous les statuts
    const allStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    const formattedStats = allStatuses.map(status => {
      const found = stats.find(s => s._id === status);
      return {
        status,
        count: found ? found.count : 0
      };
    });
    
    const totalOrders = formattedStats.reduce((sum, s) => sum + s.count, 0);
    
    res.json({
      totalOrders,
      statusBreakdown: formattedStats,
      lastUpdated: new Date().toISOString()
    });
  } catch (e) { 
    next(e); 
  }
});

// GET - Commandes d'un client spécifique
router.get('/customer/:customerId', validateQuery(querySchema), async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { page, limit } = req.query;
    const skip = (page - 1) * limit;
    
    const [total, data] = await Promise.all([
      Order.countDocuments({ customerId }),
      Order.find({ customerId }).skip(skip).limit(limit).sort({ createdAt: -1 })
    ]);
    
    res.json({ 
      customerId,
      page: parseInt(page), 
      limit: parseInt(limit), 
      total, 
      data 
    });
  } catch (e) { 
    next(e); 
  }
});

module.exports = router;