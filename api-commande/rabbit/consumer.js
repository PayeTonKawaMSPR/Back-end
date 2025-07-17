// api-commande/rabbit/consumer.js
const amqp = require('amqplib');
const Product = require('../models/Product');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function listenToProduitModifie() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'produit_modifie';

    await channel.assertQueue(queue, { durable: true });

    console.log(`📥 [RabbitMQ] En écoute sur la queue "${queue}"`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const productData = JSON.parse(msg.content.toString());
          console.log('🔄 Produit modifié reçu via RabbitMQ :', productData);

          const { action, _id, ...updateData } = productData;

          switch (action) {
            case 'created':
            case 'updated':
            case 'patched':
            case 'image_uploaded':
            case 'image_replaced':
            case 'image_deleted':
              await Product.findByIdAndUpdate(_id, updateData, {
                upsert: true,
                new: true,
                runValidators: true
              });
              console.log(`✅ Produit ${action} synchronisé dans api-commande`);
              break;

            case 'deleted':
              await Product.findByIdAndDelete(_id);
              console.log(`✅ Produit supprimé synchronisé dans api-commande`);
              break;

            default:
              console.log(`⚠️ Action non reconnue: ${action}`);
          }

          channel.ack(msg);
        } catch (error) {
          console.error('❌ Erreur lors du traitement du message:', error);
          channel.nack(msg, false, true); // Rejeter et remettre en queue
        }
      }
    });

    // Gestion des erreurs de connexion
    connection.on('error', (error) => {
      console.error('❌ Erreur de connexion RabbitMQ:', error);
    });

    connection.on('close', () => {
      console.log('🔌 Connexion RabbitMQ fermée, tentative de reconnexion...');
      setTimeout(listenToProduitModifie, 5000);
    });

  } catch (err) {
    console.error('❌ Erreur RabbitMQ listener :', err);
    setTimeout(listenToProduitModifie, 5000);
  }
}

module.exports = { listenToProduitModifie };