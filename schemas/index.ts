import * as z from "zod";

export const LoginSchema = z.object({
  email: z
    .string({
      invalid_type_error: "Must be a string",
    })
    .email({ message: "please provide a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
  code: z.optional(z.string().min(6, { message: "Code must be 6 characters" })),
});

export const RegistrationSchema = z.object({
  username: z.string().min(3, { message: "Username is required" }),
  email: z.string().email({ message: "please provide a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "please provide a valid email" }),
});

export const PasswordResetSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine(
    (data) => {
      if (data.password !== data.confirmPassword) {
        return false;
      }

      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );
