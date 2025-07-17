// api-produit/src/rabbit/publisher.js
const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let channel;
let connection;

async function connectRabbit() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Déclaration de la queue avec durabilité
    await channel.assertQueue('produit_modifie', { durable: true });
    
    console.log('✅ [RabbitMQ] Connecté et canal créé pour l\'envoi de messages');
    
    // Gestion des erreurs de connexion
    connection.on('error', (error) => {
      console.error('❌ Erreur de connexion RabbitMQ:', error);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      console.log('🔌 Connexion RabbitMQ fermée');
      channel = null;
      connection = null;
    });

  } catch (err) {
    console.error('❌ Erreur connexion RabbitMQ (publisher):', err);
    channel = null;
    connection = null;
    throw err;
  }
}

async function ensureConnection() {
  if (!channel || !connection) {
    await connectRabbit();
  }
}

async function sendToQueue(queue, message) {
  try {
    await ensureConnection();
    
    // Assurer que la queue existe
    await channel.assertQueue(queue, { durable: true });
    
    // Envoyer le message avec persistance
    const sent = channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });
    
    if (sent) {
      console.log(`📤 Message envoyé à la queue "${queue}":`, message);
    } else {
      console.warn(`⚠️ Buffer plein, message mis en attente pour la queue "${queue}"`);
    }
    
    return sent;
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi du message à la queue "${queue}":`, error);
    throw error;
  }
}

// Fonction pour publier via exchange (optionnel)
async function publish(exchange, routingKey, message) {
  try {
    await ensureConnection();
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    const published = channel.publish(
      exchange, 
      routingKey, 
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    if (published) {
      console.log(`📤 Message publié sur ${exchange}:${routingKey}:`, message);
    } else {
      console.warn(`⚠️ Buffer plein lors de la publication sur ${exchange}:${routingKey}`);
    }
    
    return published;
  } catch (error) {
    console.error(`❌ Erreur lors de la publication sur ${exchange}:${routingKey}:`, error);
    throw error;
  }
}

// Fermer la connexion proprement
async function closeConnection() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log('🔌 Connexion RabbitMQ fermée proprement');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture RabbitMQ:', error);
  }
}

module.exports = { 
  sendToQueue, 
  publish, 
  connectRabbit, 
  closeConnection 
};