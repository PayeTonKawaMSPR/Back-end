module.exports = {
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn().mockResolvedValue(),
    model: () => ({
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
      findByIdAndDelete: jest.fn().mockResolvedValue({})
    }),
    Schema: class {},
  };
  