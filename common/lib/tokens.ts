import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

import { getVerificationTokenByEmail } from "@/common/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/common/data/password-reset";
import { getTwoFactorTokenByEmail } from "@/common/data/two-factor-token";

import { db } from "@/common/lib/db";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const newToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return newToken;
};

export const generateResetToken = async (email: string) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const newToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return newToken;
};

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const newToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expiresAt,
    },
  });

  return newToken;
};
