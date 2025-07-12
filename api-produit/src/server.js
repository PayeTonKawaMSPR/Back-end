const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const { testRabbitMQ } = require('./rabbitmq'); // Correction d'import

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
const cors = require('cors');
app.use(cors());

// Sécuriser les entêtes HTTP (Helmet)
const helmet = require('helmet');
app.use(helmet());

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

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Gestion des erreurs globales
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Connexion à MongoDB
connectDB();

// Tester RabbitMQ puis démarrer le serveur
const PORT = process.env.PORT || 5000;

testRabbitMQ()
  .then(() => {
    console.log('✅ Connecté à RabbitMQ');
    app.listen(PORT, () => {
      console.log(`Serveur sur port ${PORT}`);
      console.log('API Produit démarrée');
    });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion RabbitMQ:', err.message);
    // Option: relancer la tentative ou quitter
    process.exit(1);
  });

module.exports = app;