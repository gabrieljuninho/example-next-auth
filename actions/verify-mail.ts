"use server";

import { getUserByEmail } from "@/common/data/user";
import { getVerificationTokenByToken } from "@/common/data/verification-token";

import { db } from "@/common/lib/db";
import { sendVerificationEmail } from "@/common/lib/mail";
import { generateVerificationToken } from "@/common/lib/tokens";

export const verifyEmail = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return {
      error: "Invalid token",
    };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return {
      error: "Email does not exist",
    };
  }

  const hasExpired = new Date(existingToken.expiresAt) < new Date();

  if (hasExpired) {
    const newToken = await generateVerificationToken(existingToken.email);
    await sendVerificationEmail(newToken.email, newToken.token);
    return {
      error: "Token expired and new token sent",
    };
  }

  await db.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  await db.verificationToken.delete({
    where: {
      id: existingToken.id,
    },
  });

  return {
    success: "Email verified successfully. Proceed to login ",
  };
};
