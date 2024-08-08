"use server";

import * as z from "zod";

import { ResetSchema } from "@/schemas";

import { getUserByEmail } from "@/common/data/user";

import { generateResetToken } from "@/common/lib/tokens";
import { sendPasswordResetEmail } from "@/common/lib/mail";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid Fields",
    };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return {
      error: "Email not registered",
    };
  }

  const newToken = await generateResetToken(existingUser.email as string);

  await sendPasswordResetEmail(newToken.email, newToken.token);

  return {
    success: "Reset email sent",
  };
};
