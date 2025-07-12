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

module.exports = { testRabbitMQ }; // <-- AJOUT ICI
