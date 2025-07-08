const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

// Connexion à MongoDB
connectDB();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

// Routes
app.use('/api/produits', productRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Serveur sur port ${PORT}`));
}

module.exports = app;

//Sécuriser les entêtes HTTP (Helmet)
const helmet = require('helmet');
app.use(helmet());

// Protection contre l’injection NoSQL & XSS
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

app.use(mongoSanitize());
app.use(xss());

// Gestion des erreurs globales
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

//Logs HTTP
const morgan = require('morgan');
app.use(morgan('dev'));


//app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
