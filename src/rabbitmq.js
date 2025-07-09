const amqp = require('amqplib');

async function testRabbitMQ() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:password@rabbitmq');
    console.log(' Connecté à RabbitMQ');
    await conn.close();
  } catch (err) {
    console.error(' Erreur de connexion RabbitMQ:', err.message);
  }
}

module.exports = testRabbitMQ;