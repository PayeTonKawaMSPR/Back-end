const client = require('prom-client');

// Créer un registre pour les métriques
const register = new client.Registry();

// Ajouter les métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({
  app: 'api-commande',
  prefix: 'commande_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register
});

// Métrique : Nombre de requêtes HTTP
const httpRequestsTotal = new client.Counter({
  name: 'commande_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Métrique : Durée des requêtes HTTP
const httpRequestDuration = new client.Histogram({
  name: 'commande_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

// Métrique : Nombre de commandes en base
const ordersInDatabase = new client.Gauge({
  name: 'commande_database_orders_total',
  help: 'Total number of orders in database',
  registers: [register]
});

// Métrique : Commandes par statut
const ordersByStatus = new client.Gauge({
  name: 'commande_orders_by_status',
  help: 'Number of orders by status',
  labelNames: ['status'],
  registers: [register]
});

// Métrique : Statut de la base de données
const databaseStatus = new client.Gauge({
  name: 'commande_database_status',
  help: 'Database connection status (1 = connected, 0 = disconnected)',
  registers: [register]
});

// Métrique : Statut RabbitMQ
const rabbitmqStatus = new client.Gauge({
  name: 'commande_rabbitmq_status',
  help: 'RabbitMQ connection status (1 = connected, 0 = disconnected)',
  registers: [register]
});

// Métrique : Messages RabbitMQ publiés
const rabbitmqMessagesPublished = new client.Counter({
  name: 'commande_rabbitmq_messages_published_total',
  help: 'Total number of messages published to RabbitMQ',
  labelNames: ['exchange', 'routing_key'],
  registers: [register]
});

// Middleware pour mesurer les requêtes HTTP
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Intercepter la fin de la réponse
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode;
    
    // Enregistrer les métriques
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    
    // Appeler la méthode originale
    originalEnd.apply(this, args);
  };
  
  next();
};

// Fonction pour mettre à jour les métriques custom
const updateCustomMetrics = async () => {
  try {
    // Mettre à jour le statut de la base de données
    const mongoose = require('mongoose');
    databaseStatus.set(mongoose.connection.readyState === 1 ? 1 : 0);
    
    // Compter les commandes en base
    if (mongoose.connection.readyState === 1) {
      const Order = require('../models/order');
      
      // Nombre total de commandes
      const totalOrders = await Order.countDocuments();
      ordersInDatabase.set(totalOrders);
      
      // Commandes par statut
      const statusCounts = await Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      // Reset des compteurs pour éviter les valeurs obsolètes
      ordersByStatus.reset();
      
      // Mettre à jour les métriques par statut
      statusCounts.forEach(({ _id: status, count }) => {
        ordersByStatus.set({ status }, count);
      });
      
      // S'assurer que tous les statuts possibles sont présents
      const allStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
      allStatuses.forEach(status => {
        const existing = statusCounts.find(s => s._id === status);
        if (!existing) {
          ordersByStatus.set({ status }, 0);
        }
      });
    }
    
    // Statut RabbitMQ
    try {
      const { getChannel } = require('../config/rabbit');
      const channel = getChannel();
      rabbitmqStatus.set(channel ? 1 : 0);
    } catch (error) {
      rabbitmqStatus.set(0);
    }
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des métriques:', error);
    databaseStatus.set(0);
  }
};

// Mettre à jour les métriques custom toutes les 30 secondes
setInterval(updateCustomMetrics, 30000);

// Fonction pour incrémenter les métriques RabbitMQ
const incrementRabbitMQMetrics = (exchange, routingKey) => {
  rabbitmqMessagesPublished.inc({ exchange, routing_key: routingKey });
};

module.exports = {
  register,
  metricsMiddleware,
  updateCustomMetrics,
  incrementRabbitMQMetrics
};