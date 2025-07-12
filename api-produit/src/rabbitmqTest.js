const amqp = require('amqplib');

const QUEUE = 'testQueue';

async function start() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();

  await channel.assertQueue(QUEUE, { durable: false });

  // Envoyer un message
  const msg = 'Hello depuis API Produit !';
  channel.sendToQueue(QUEUE, Buffer.from(msg));
  console.log(`🟢 Message envoyé: ${msg}`);

  // Recevoir le message
  channel.consume(QUEUE, (msg) => {
    console.log(`📥 Message reçu: ${msg.content.toString()}`);
    channel.ack(msg); // Accuser réception
  });
}

start().catch(console.error);
