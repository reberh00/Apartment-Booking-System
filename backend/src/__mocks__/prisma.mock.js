const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  apartment: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  reservation: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  review: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    groupBy: jest.fn(),
  },
  content: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  apartmentContent: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
  },
  apartmentPhoto: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  availabilityBlock: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  notification: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(async (args) => {
    if (Array.isArray(args)) {
      return Promise.all(args);
    }
    if (typeof args === "function") {
      return args(mockPrisma);
    }
    return args;
  }),
};

module.exports = mockPrisma;
