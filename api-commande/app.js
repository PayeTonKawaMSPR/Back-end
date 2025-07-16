const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/orderRoutes');
const { connectRabbitMQ } = require('./config/rabbit');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// Import du middleware de métriques
const { metricsMiddleware, register, updateCustomMetrics } = require('./middleware/metrics');

dotenv.config();

const app = express();

// Middleware pour les métriques (AVANT les autres middlewares)
app.use(metricsMiddleware);

// Middlewares de sécurité
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Protection contre l'injection NoSQL & XSS
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
app.use(mongoSanitize());
app.use(xss());

// CORS
const cors = require('cors');
app.use(cors());

// Logs HTTP
const morgan = require('morgan');
app.use(morgan('dev'));

// Middleware JSON
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'api-commande',
    timestamp: new Date().toISOString()
  });
});

// Endpoint Dashboard
app.get('/dashboard', (req, res) => {
  try {
    const dashboardPath = path.join(__dirname, 'middleware', 'dashboard.html');
    
    if (!fs.existsSync(dashboardPath)) {
      return res.status(404).json({ error: 'Dashboard non trouvé' });
    }
    
    const dashboardHtml = fs.readFileSync(dashboardPath, 'utf8');
    res.send(dashboardHtml);
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur dashboard' });
  }
});

// Endpoint des métriques pour Prometheus
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

// Routes
app.use('/api/orders', orderRoutes);

// Global error handler
app.use(errorHandler);

// Initialisation
(async () => {
  try {
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ MongoDB connecté (commande)');
    
    // Connexion RabbitMQ
    await connectRabbitMQ();
    
    // Mise à jour initiale des métriques
    await updateCustomMetrics();
    
    console.log('🚀 API-COMMANDE initialisée avec succès');
    console.log('📊 Métriques disponibles sur http://localhost:4000/metrics');
    console.log('📈 Dashboard disponible sur http://localhost:4000/dashboard');
    console.log('🏥 Health check disponible sur http://localhost:4000/health');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
})();

module.exports = app;