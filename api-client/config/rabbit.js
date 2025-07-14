// config/rabbit.js
const amqp = require('amqplib');
const RETRY_DELAY = 5000;

let channel;

const connectRabbitMQ = async () => {
  try {
    console.log('🔄 Tentative de connexion à RabbitMQ...');
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('✅ Connecté à RabbitMQ');
    return channel;
  } catch (error) {
    console.error('❌ Erreur de connexion à RabbitMQ:', error.message);
    setTimeout(connectRabbitMQ, RETRY_DELAY);
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel: () => channel
};
