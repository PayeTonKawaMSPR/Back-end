const amqp = require('amqplib');

let channel;
let connection;

// Initialise la connexion et la channel RabbitMQ
const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    
    console.log('✅ Connecté à RabbitMQ (commande)');
    return channel;
  } catch (error) {
    console.error('❌ Erreur de connexion à RabbitMQ (commande):', error.message);
    // Retry after 5 seconds
    setTimeout(connectRabbitMQ, 5000);
  }
};

// Retourne le channel existant, ou null si non initialisé
function getChannel() {
  return channel;
}

// Publier un message
async function publish(exchange, routingKey, message) {
  if (!channel) {
    throw new Error('Channel RabbitMQ non initialisé');
  }
  
  try {
    await channel.assertExchange(exchange, 'topic', { durable: true });
    const success = channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
    
    if (!success) {
      console.warn(`⚠️  Buffer plein lors de la publication sur ${exchange}:${routingKey}`);
    }
    
    return success;
  } catch (error) {
    console.error(`❌ Erreur lors de la publication sur ${exchange}:${routingKey}:`, error);
    throw error;
  }
}

// Fonction pour vérifier la connexion
function isConnected() {
  return channel !== null && channel !== undefined;
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
    console.log('🔌 Connexion RabbitMQ fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture RabbitMQ:', error);
  }
}

module.exports = {
  connectRabbitMQ,
  publish,
  getChannel: () => channel
};