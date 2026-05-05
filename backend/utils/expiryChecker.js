const { prisma } = require('../config/db');

const checkAndExpireFood = async () => {
  const now = new Date();
  try {
    await prisma.food.updateMany({
      where: {
        expiryTime: { lt: now },
        status: { not: 'Expired' }
      },
      data: { status: 'Expired' }
    });
    console.log('✅ Expiry check completed');
  } catch (error) {
    console.error('Error updating expired food items:', error.message);
  }
};

const startExpiryScheduler = (intervalMs = 60 * 1000) => {
  console.log('🕐 Expiry scheduler started. Checking every', intervalMs / 1000, 'seconds');
  
  setInterval(async () => {
    try {
      await checkAndExpireFood();
    } catch (error) {
      console.error('Expiry scheduler error:', error.message);
    }
  }, intervalMs);
};

module.exports = { startExpiryScheduler, checkAndExpireFood };
