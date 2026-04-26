const { PrismaClient } = require('@prisma/client');

let prismaLogs = ['error'];

if (process.env.NODE_ENV === 'development') {
  prismaLogs = ['query', 'error'];
}

const prisma = globalThis.prisma || new PrismaClient({
  log: prismaLogs,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

module.exports = prisma;
