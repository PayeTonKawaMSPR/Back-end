module.exports.connect = async () => ({
    createChannel: async () => ({
      assertQueue: jest.fn(),
      sendToQueue: jest.fn(),
      consume: jest.fn(),
    }),
  });
  