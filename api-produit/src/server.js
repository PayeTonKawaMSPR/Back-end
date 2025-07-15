const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const path = require('path');


const { testRabbitMQ } = require('./rabbitmq');
const { startConsumer } = require('./listener'); // Import seulement ici, appel plus bas

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi     = require('swagger-ui-express');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middlewares
app.use(require('./middleware/errorHandler'));
app.use(express.json());
const cors = require('cors');
app.use(cors());

// Configuration de Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'API Produits', version: '1.0.0', description: 'Documentation des endpoints de l’API Produits' },
    servers: [{ url: 'http://localhost:5000/api/produits' }]
  },
  apis: ['./src/routes/*.js', './src/models/*.js']
};
const specs = swaggerJsdoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

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

// Ajout d'images
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', 'public', 'uploads'))
);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Gestion des erreurs globales
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Connexion à MongoDB

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Démarrer le serveur APRÈS que RabbitMQ soit prêt
const PORT = process.env.PORT || 5000;

/*testRabbitMQ()
  .then(() => {
    console.log('✅ Connecté à RabbitMQ');

    // Important : on démarre le listener uniquement après la connexion réussie
    startConsumer();

    app.listen(PORT, () => {
      console.log(`Serveur sur port ${PORT}`);
      console.log('API Produit démarrée');
    });
  })
  .catch(err => {
    console.error('❌ Erreur de connexion RabbitMQ:', err.message);
    process.exit(1);
  });*/

  if (process.env.NODE_ENV !== 'test') {
   testRabbitMQ()
     .then(() => {
       console.log('✅ Connecté à RabbitMQ');
       // Important : on démarre le listener uniquement après la connexion réussie
       startConsumer();
       app.listen(PORT, () => {
         console.log(`Serveur sur port ${PORT}`);
         console.log('API Produit démarrée');
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
