// listener.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';

const startConsumer = async () => {
  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    const channel = await conn.createChannel();

    const queue = 'nouveau_client';
    await channel.assertQueue(queue, { durable: false });

    console.log(`👂 En attente des messages dans "${queue}"...`);

    const handleMessage = (msg) => {
      try {
        const rawContent = msg.content.toString();
        const content = JSON.parse(rawContent); // Parse JSON si possible
        console.log('📩 Client reçu :', content);
      } catch (err) {
        console.error('❌ Erreur de traitement du message :', err.message);
        console.log('🔎 Message brut :', msg.content.toString());
      }

      channel.ack(msg);
    };

    channel.consume(queue, handleMessage);
  } catch (err) {
    console.error('❌ Erreur lors de la connexion au consumer RabbitMQ :', err.message);
  }
};

module.exports = { startConsumer };
