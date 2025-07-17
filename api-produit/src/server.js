const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const path = require('path');
const fs = require('fs');

const { testRabbitMQ } = require('./rabbitmq');
const { startConsumer } = require('./listener');

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import du middleware de métriques
const { metricsMiddleware, register, updateCustomMetrics } = require('./middleware/metrics');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware pour les métriques (AVANT les autres middlewares)
app.use(metricsMiddleware);

// Middlewares existants
app.use(require('./middleware/errorHandler'));
app.use(express.json());
const cors = require('cors');
app.use(cors());

// Configuration de Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: { 
      title: 'API Produits', 
      version: '1.0.0', 
      description: 'Documentation des endpoints de l\'API Produits' 
    },
    servers: [{ url: 'http://localhost:5000/api/produits' }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};
const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Sécuriser les entêtes HTTP (Helmet)
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: false // Désactiver pour permettre le dashboard
}));

// Protection contre l'injection NoSQL & XSS
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
app.use(mongoSanitize());
app.use(xss());

// Logs HTTP
const morgan = require('morgan');
app.use(morgan('dev'));

// Routes
app.use('/api/produits', productRoutes);

// Ajout d'images
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'public', 'uploads'))
);

// Health check (existant)
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Endpoint des métriques pour Prometheus (NOUVEAU)
app.get('/metrics', async (req, res) => {
  try {
    // Mettre à jour les métriques avant de les retourner
    await updateCustomMetrics();
    
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error('Erreur métriques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des métriques' });
  }
});

// Endpoint du dashboard (NOUVEAU)
app.get('/dashboard', (req, res) => {
  try {
    // Lire le fichier HTML du dashboard
    const dashboardPath = path.join(__dirname, 'middleware', 'dashboard.html');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(dashboardPath)) {
      return res.status(404).json({ 
        error: 'Fichier dashboard.html non trouvé',
        path: dashboardPath 
      });
    }
    
    // Lire et envoyer le fichier HTML
    const dashboardHtml = fs.readFileSync(dashboardPath, 'utf8');
    res.set('Content-Type', 'text/html');
    res.send(dashboardHtml);
    
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du dashboard' });
  }
});

// Gestion des erreurs globales
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Connexion à MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Démarrer le serveur APRÈS que RabbitMQ soit prêt
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  testRabbitMQ()
    .then(() => {
      console.log('✅ Connecté à RabbitMQ');
      // Important : on démarre le listener uniquement après la connexion réussie
      startConsumer();
      
      // Mise à jour initiale des métriques
      updateCustomMetrics();
      
      app.listen(PORT, () => {
        console.log(`Serveur sur port ${PORT}`);
        console.log('API Produit démarrée');
        console.log(`📊 Métriques disponibles sur http://localhost:${PORT}/metrics`);
        console.log(`📈 Dashboard disponible sur http://localhost:${PORT}/dashboard`);
        console.log(`🏥 Health check disponible sur http://localhost:${PORT}/health`);
      });
    })
    .catch(err => {
      console.error('❌ Erreur de connexion RabbitMQ:', err.message);
      process.exit(1);
    });
} else {
  // En mode test, on démarre immédiatement (supertest se branchera dessus)
  app.listen(PORT);
}

module.exports = app;