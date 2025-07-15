
const amqp = require('amqplib');

let channel;

// Initialise la connexion et la chanel RabbitMQ

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


// Retourne le channel existant, ou lève une erreur si non initialisé.

function getChannel() {
  if (!channel) throw new Error('Channel non initialisé');
  return channel;
}

async function publish(exchange, routingKey, message) {
  const channel = getChannel();
 // if (!channel) throw new Error('Channel non initialisé');
  await channel.assertExchange(exchange, 'topic', { durable: true });
  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
}

module.exports = {
  connectRabbitMQ,
  publish,
  getChannel: () => channel
};
