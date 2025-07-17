const amqp = require('amqplib');
const RETRY_DELAY = 5000; // 5 secondes

async function testRabbitMQ() {
  try {
    console.log("Tentative de connexion à RabbitMQ...");
    
    // Attendre que RabbitMQ soit prêt
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    console.log('✅ Connecté à RabbitMQ');
    return conn;
  } catch (err) {
    console.error('❌ Erreur de connexion RabbitMQ:', err.message);
    // Relancer la tentative après 5s
    console.log(`Nouvelle tentative dans ${RETRY_DELAY/1000}s...`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    return testRabbitMQ();
  }
}

/*async function publish(exchange, routingKey, message) {
  if (!channel) {
    throw new Error('RabbitMQ non initialisé – appelle d’abord testRabbitMQ()');
  }
  // On s’assure que l’exchange existe (type topic pour flexibilité)
  await channel.assertExchange(exchange, 'topic', { durable: true });
  const buffer = Buffer.from(JSON.stringify(message));
  channel.publish(exchange, routingKey, buffer, { persistent: true });
  console.log(`Message publié sur ${exchange}/${routingKey}`);
}*/
module.exports = { testRabbitMQ }; // <-- AJOUT ICI
