const { prisma } = require('../config/db');

const Claim = {
  // Create a new claim
  create: async (claimData) => {
    return prisma.claim.create({
      data: claimData,
      include: {
        food: {
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
        },
        receiver: {
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

  // Find claim by ID
  findById: async (id) => {
    return prisma.claim.findUnique({
      where: { id },
      include: {
        food: {
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
        },
        receiver: {
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

  // Find claims by receiver ID (My Claims)
  findByReceiverId: async (receiverId) => {
    return prisma.claim.findMany({
      where: { receiverId },
      orderBy: { claimedAt: 'desc' },
      include: {
        food: {
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
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  // Find claims for donor (Incoming Claims)
  findByFoodDonorId: async (donorId) => {
    return prisma.claim.findMany({
      where: {
        food: {
          donorId,
        },
      },
      orderBy: { claimedAt: 'desc' },
      include: {
        food: {
          select: {
            id: true,
            foodName: true,
            description: true,
            quantity: true,
            expiryTime: true,
            imageUrl: true,
          },
        },
        receiver: {
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

  // Find existing claim for specific food and receiver
  findExisting: async (foodId, receiverId) => {
    return prisma.claim.findUnique({
      where: {
        foodId_receiverId: {
          foodId,
          receiverId,
        },
      },
    });
  },

  // Update claim status
  updateStatus: async (id, status) => {
    return prisma.claim.update({
      where: { id },
      data: { status },
      include: {
        food: {
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        receiver: {
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

  // Delete claim
  delete: async (id) => {
    return prisma.claim.delete({
      where: { id },
    });
  },
};

module.exports = Claim;
