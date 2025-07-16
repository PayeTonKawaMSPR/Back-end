// config/rabbit.js
const amqp = require('amqplib');
const RETRY_DELAY = 5000;

let channel = null;

const connectRabbitMQ = async () => {
  try {
    console.log('🔄 Tentative de connexion à RabbitMQ...');
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    connection.on('error', (err) => {
      console.error('❌ Erreur connexion RabbitMQ (connexion):', err.message);
    });
    connection.on('close', () => {
      console.warn('🔌 Connexion RabbitMQ fermée, reconnexion en cours...');
      setTimeout(connectRabbitMQ, RETRY_DELAY);
    });

    channel = await connection.createChannel();
    console.log('✅ Connecté à RabbitMQ');
    return channel;
  } catch (error) {
    console.error('❌ Erreur de connexion à RabbitMQ:', error.message);
    setTimeout(connectRabbitMQ, RETRY_DELAY);
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error('⚠️ Le canal RabbitMQ n’est pas encore connecté.');
  }
  return channel;
};

module.exports = {
  connectRabbitMQ,
  getChannel
};
