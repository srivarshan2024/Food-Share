const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully via Prisma');

    // Handle connection events
    prisma.$on('error', (err) => {
      console.error('❌ PostgreSQL connection error:', err.message);
    });

    prisma.$on('warn', (err) => {
      console.warn('⚠️  PostgreSQL warning:', err.message);
    });

  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };
