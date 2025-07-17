// app.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectRabbitMQ } = require('./config/rabbit');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 🔗 Connexion à la base de données MongoDB
connectDB();

// 🐇 Connexion à RabbitMQ
connectRabbitMQ();

// 🌍 Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📦 Routes principales
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);

// ❌ Middleware global pour gérer les erreurs
app.use(errorHandler);

// 🚀 Lancement du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});

module.exports = app;
