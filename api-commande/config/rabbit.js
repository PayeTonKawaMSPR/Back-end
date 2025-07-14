// config/rabbit.js
const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    console.log('✅ Connecté à RabbitMQ (commande)');
    return channel;
  } catch (error) {
    console.error('❌ Erreur de connexion à RabbitMQ (commande):', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
};

module.exports = {
  connectRabbitMQ,
  getChannel: () => channel
};
