"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { PasswordResetSchema } from "@/schemas";

import { getPasswordResetTokenByToken } from "@/common/data/password-reset";
import { getUserByEmail } from "@/common/data/user";

import { db } from "@/common/lib/db";

export const newPassword = async (
  values: z.infer<typeof PasswordResetSchema>,
  token: string | null
) => {
  if (!token) {
    return { error: "Missing token!" };
  }

  const validatedFields = PasswordResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { password } = validatedFields.data;

  const resetToken = await getPasswordResetTokenByToken(token);

  if (!resetToken) {
    return { error: "Invalid token! " };
  }

  const user = await getUserByEmail(resetToken.email);

  if (!user) {
    return { error: "Email does not exist" };
  }

  if (new Date(resetToken.expiresAt) < new Date()) {
    return {
      error: "Token expired! please request a new one",
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.passwordResetToken.delete({
    where: {
      id: resetToken.id,
    },
  });

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return { success: "password reset successfully" };
};
