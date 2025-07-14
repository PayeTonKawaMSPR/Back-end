// app.js
const { connectRabbitMQ } = require('./config/rabbit');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Connexion à MongoDB
connectDB();

// Connexion à RabbitMQ
connectRabbitMQ();

// Middlewares globaux
app.use(cors());
app.use(express.urlencoded({extended: true}))
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);

// Middleware de gestion globale des erreurs
app.use(errorHandler);

app.listen(3000, () => {
    console.log(`app listening on port ${3000}`)
  })
module.exports = app;
