// jest.setup.js
require('dotenv').config({ path: '.env.test' });

// ❌ Ne surtout pas mocker mongoose ici
// ✅ On mocke uniquement RabbitMQ
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn(),
      consume: jest.fn(),
      sendToQueue: jest.fn(),
      ack: jest.fn(),
    }),
  }),
}));
