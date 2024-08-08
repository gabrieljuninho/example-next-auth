import { db } from "@/common/lib/db";

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const token = await db.passwordResetToken.findFirst({
      where: {
        email,
      },
    });

    return token;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    return resetToken;
  } catch (error) {
    return null;
  }
};
