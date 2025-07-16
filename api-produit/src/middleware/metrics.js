const client = require('prom-client');

// Créer un registre pour les métriques
const register = new client.Registry();

// Ajouter les métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({
  app: 'api-produit',
  prefix: 'produit_',
  timeout: 10000,
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  register
});

// Métrique : Nombre de requêtes HTTP
const httpRequestsTotal = new client.Counter({
  name: 'produit_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Métrique : Durée des requêtes HTTP
const httpRequestDuration = new client.Histogram({
  name: 'produit_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

// Métrique : Nombre de produits en base
const productsInDatabase = new client.Gauge({
  name: 'produit_database_products_total',
  help: 'Total number of products in database',
  registers: [register]
});

// Métrique : Statut de la base de données
const databaseStatus = new client.Gauge({
  name: 'produit_database_status',
  help: 'Database connection status (1 = connected, 0 = disconnected)',
  registers: [register]
});

// Métrique : Statut RabbitMQ
const rabbitmqStatus = new client.Gauge({
  name: 'produit_rabbitmq_status',
  help: 'RabbitMQ connection status (1 = connected, 0 = disconnected)',
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

    // Compter les produits en base
    if (mongoose.connection.readyState === 1) {
      const Product = require('../models/Product');
      const count = await Product.countDocuments();
      productsInDatabase.set(count);
    }

    // Statut RabbitMQ (à implémenter selon votre logique)
    rabbitmqStatus.set(1); // Vous pouvez adapter selon votre logique RabbitMQ

  } catch (error) {
    console.error('Erreur lors de la mise à jour des métriques:', error);
    databaseStatus.set(0);
  }
};

// Mettre à jour les métriques custom toutes les 30 secondes
setInterval(updateCustomMetrics, 30000);

module.exports = {
  register,
  metricsMiddleware,
  updateCustomMetrics
};