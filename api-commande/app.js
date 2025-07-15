/*const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error(err));

// Routes
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

module.exports = app;*/


const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/orderRoutes');
const {connectRabbitMQ } = require('./config/rabbit');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
const app = express();
app.use(express.json());

// routes
app.use('/api/orders', orderRoutes);

// global error handler
app.use(errorHandler);

// init
(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await connectRabbitMQ();
})();

module.exports = app;