import type { HTMLAttributes } from "react";

export type AuthFeedbackTone = "success" | "error" | "info";

export interface AuthFeedbackProps extends HTMLAttributes<HTMLDivElement> {
  tone: AuthFeedbackTone;
  message: string;
}
