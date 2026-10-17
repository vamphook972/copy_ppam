import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("email").trim().min(1, "required"),
  password: z.string().min(1, "required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("email").trim().min(1, "required"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.email("email").trim().min(1, "required"),
  code: z.string().trim().min(1, "required").min(6, "minLength"),
  newPassword: z
    .string()
    .min(8, "minLength")
    .regex(/[A-Z]/, "invalidFormat")
    .regex(/[a-z]/, "invalidFormat")
    .regex(/[0-9]/, "invalidFormat"),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const newPasswordRequiredSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "minLength")
      .regex(/[A-Z]/, "invalidFormat")
      .regex(/[a-z]/, "invalidFormat")
      .regex(/[0-9]/, "invalidFormat"),
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  });

export type NewPasswordRequiredFormValues = z.infer<typeof newPasswordRequiredSchema>;

export const activateUserSchema = z
  .object({
    token: z.string().min(1, "required"),
    password: z
      .string()
      .min(8, "minLength")
      .regex(/[A-Z]/, "invalidFormat")
      .regex(/[a-z]/, "invalidFormat")
      .regex(/[0-9]/, "invalidFormat"),
    confirmPassword: z.string().min(1, "required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsDoNotMatch",
    path: ["confirmPassword"],
  });

export type ActivateUserFormValues = z.infer<typeof activateUserSchema>;
