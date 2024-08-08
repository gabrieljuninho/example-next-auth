/* eslint-disable indent */

"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import * as z from "zod";

import { signIn } from "@/auth";

import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

import { LoginSchema } from "@/schemas";

import { getTwoFactorAuthenticationByUserId } from "@/common/data/two-factor-authentication";
import { getTwoFactorTokenByEmail } from "@/common/data/two-factor-token";
import { getUserByEmail } from "@/common/data/user";
import { getVerificationTokenByEmail } from "@/common/data/verification-token";

import { db } from "@/common/lib/db";
import {
  sendVerificationEmail,
  sendTwoFactorTokenEmail,
} from "@/common/lib/mail";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "@/common/lib/tokens";

export const login = async (
  value: z.infer<typeof LoginSchema>,
  callBackUrl?: string | null
) => {
  const validatedFields = LoginSchema.safeParse(value);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.password || !existingUser.email) {
    return {
      error: "Invalid credentials",
    };
  }

  if (!existingUser.emailVerified) {
    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
      if (new Date(existingToken.expiresAt) < new Date()) {
        const verificationToken = await generateVerificationToken(email);

        await sendVerificationEmail(
          verificationToken.email,
          verificationToken.token
        );

        return {
          error: "Verification token expired. New token sent",
        };
      } else {
        return {
          error: "Please check your email to verify your account",
        };
      }
    }

    return {
      success: "Verification email sent",
    };
  }

  if (existingUser.password) {
    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      return {
        error: "Invalid credentials",
      };
    }
  }

  if (existingUser.isTwoFactorEnabled) {
    if (!code) {
      const twoFactorToken = await generateTwoFactorToken(email);

      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return {
        twoFactor: true,
      };
    } else {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return {
          error: "Invalid credentials",
        };
      }

      if (twoFactorToken.token !== code) {
        return {
          error: "Invalid code",
        };
      }

      const hasExpired = new Date(twoFactorToken.expiresAt) < new Date();

      if (hasExpired) {
        return {
          error: "Code has expired",
        };
      }

      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      });

      const existingTwoFactorAuthentication =
        await getTwoFactorAuthenticationByUserId(existingUser.id);

      if (existingTwoFactorAuthentication) {
        await db.twoFactorAuthentication.delete({
          where: {
            id: existingTwoFactorAuthentication.id,
          },
        });
      }

      await db.twoFactorAuthentication.create({
        data: {
          userId: existingUser.id,
        },
      });
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callBackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Invalid credentials",
          };
        default:
          return {
            error: "Something went wrong",
          };
      }
    }
    throw error;
  }
};
