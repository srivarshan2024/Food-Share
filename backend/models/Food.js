const { prisma } = require('../config/db');

const Food = {
  // Create a new food item
  create: async (foodData) => {
    return prisma.food.create({
      data: foodData,
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },

  // Find food by ID
  findById: async (id) => {
    return prisma.food.findUnique({
      where: { id },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },

  // Find all food items by donor ID
  findByDonorId: async (donorId) => {
    return prisma.food.findMany({
      where: { donorId },
      orderBy: { createdAt: 'desc' },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  // Find available and claimed food items
  findAvailable: async () => {
    return prisma.food.findMany({
      where: {
        status: { in: ['Available', 'Claimed'] },
      },
      orderBy: { expiryTime: 'asc' },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },

  // Update food status
  updateStatus: async (id, donorId, status) => {
    return prisma.food.update({
      where: { id },
      data: { status },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  // Delete food item
  delete: async (id) => {
    return prisma.food.delete({
      where: { id },
    });
  },

  // Find nearby food items using simple distance calculation (no PostGIS)
  findNearby: async (latitude, longitude, maxDistance = 5000) => {
    // Fetch all available/claimed food items and filter by distance in JS
    const foods = await prisma.food.findMany({
      where: {
        status: { in: ['Available', 'Claimed'] },
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { expiryTime: 'asc' },
    });

    // Haversine formula to calculate distance between two points
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // Earth's radius in meters
      const rad1 = (lat1 * Math.PI) / 180;
      const rad2 = (lat2 * Math.PI) / 180;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad1) * Math.cos(rad2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Filter by distance and add distance property
    const nearbyFoods = foods
      .map((food) => ({
        ...food,
        distance: calculateDistance(
          Number(latitude),
          Number(longitude),
          Number(food.latitude),
          Number(food.longitude)
        ),
      }))
      .filter((food) => food.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    return nearbyFoods;
  },
};

module.exports = Food;
