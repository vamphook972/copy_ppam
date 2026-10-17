"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms/typography";
import { cn } from "@/lib/utils";

export type OnboardingStep = "ENROLLMENT" | "ORIENTATION_MEETING" | "TRAINING";

interface OnboardingStepTrackerProps {
  currentStep: OnboardingStep;
  completedSteps?: OnboardingStep[];
  className?: string;
}

export function OnboardingStepTracker({
  currentStep,
  completedSteps = [],
  className,
}: OnboardingStepTrackerProps) {
  const t = useTranslations("enrollments");

  const steps: { key: OnboardingStep; label: string; description: string }[] = [
    {
      key: "ENROLLMENT",
      label: t("onboarding.step1Label"),
      description: t("onboarding.step1Desc"),
    },
    {
      key: "ORIENTATION_MEETING",
      label: t("onboarding.step2Label"),
      description: t("onboarding.step2Desc"),
    },
    {
      key: "TRAINING",
      label: t("onboarding.step3Label"),
      description: t("onboarding.step3Desc"),
    },
  ];

  return (
    <div className={cn("border-border bg-card rounded-lg border p-6 shadow-sm", className)}>
      <Typography variant="h3" className="text-foreground mb-4 text-base font-bold">
        {t("onboarding.globalProgress")}
      </Typography>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((step) => {
          const isCurrent = currentStep === step.key;
          const isCompleted = completedSteps.includes(step.key);

          return (
            <div
              key={step.key}
              className={cn(
                "flex flex-col justify-between rounded-lg border p-4 transition-colors",
                isCompleted && "border-success/50 bg-success/5 text-foreground",
                isCurrent &&
                  !isCompleted &&
                  "border-primary bg-primary/5 ring-primary text-foreground ring-1",
                !isCurrent && !isCompleted && "border-border bg-muted/20 text-muted-foreground"
              )}
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold">{step.label}</span>
                  {isCompleted && (
                    <span className="bg-success/20 text-success rounded-full px-2 py-0.5 text-xs font-semibold">
                      {t("onboarding.stepCompleted")}
                    </span>
                  )}
                  {isCurrent && !isCompleted && (
                    <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs font-semibold">
                      {t("onboarding.stepCurrent")}
                    </span>
                  )}
                  {!isCurrent && !isCompleted && (
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      {t("onboarding.stepPending")}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
