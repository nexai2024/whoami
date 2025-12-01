// Service to get user profile data from the database
import prisma from '@/lib/prisma';

export const UserDataService = {
  getUserProfile: async (userId: string) => {
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
      });
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
};