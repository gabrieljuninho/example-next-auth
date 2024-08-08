"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { RegistrationSchema } from "@/schemas";

import { getUserByEmail } from "@/common/data/user";

import { db } from "@/common/lib/db";
import { sendVerificationEmail } from "@/common/lib/mail";
import { generateVerificationToken } from "@/common/lib/tokens";

export const register = async (values: z.infer<typeof RegistrationSchema>) => {
  const validatedFields = RegistrationSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid Fields",
    };
  }

  const { username, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      error: "Email already registered",
    };
  }

  const user = await db.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  const token = await generateVerificationToken(email);

  await sendVerificationEmail(token.email, token.token);

  return {
    success: "Confirmation email sent",
  };
};
