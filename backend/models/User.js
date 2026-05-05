const { prisma } = require('../config/db');

const User = {
  // Create a new user
  create: async (userData) => {
    return prisma.user.create({
      data: userData,
    });
  },

  // Find user by email
  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  },

  // Find user by ID
  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  // Find user by ID without password
  findByIdWithoutPassword: async (id) => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // Update user
  update: async (id, updateData) => {
    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  },

  // Delete user
  delete: async (id) => {
    return prisma.user.delete({
      where: { id },
    });
  },
};

module.exports = User;
