import { db } from "@/common/lib/db";

export const getTwoFactorAuthenticationByUserId = async (userId: string) => {
  try {
    const twoFactorAuthentication = await db.twoFactorAuthentication.findFirst({
      where: {
        userId,
      },
    });

    return twoFactorAuthentication;
  } catch {
    return null;
  }
};
