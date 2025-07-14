// app.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const { connectRabbitMQ } = require('./config/rabbit'); // <-- ajout

const app = express();
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error(err));

// Connexion RabbitMQ
connectRabbitMQ(); // <-- ajout

// Routes
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

module.exports = app;
