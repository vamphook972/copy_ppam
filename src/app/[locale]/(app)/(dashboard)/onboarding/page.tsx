import { getTranslations } from "next-intl/server";

import { EnrollmentsListView } from "@/features/enrollments";
import { MeetingsListView } from "@/features/meetings";
import { OnboardingStepTracker } from "@/features/onboarding/components/onboarding-step-tracker";
import { Typography } from "@/components/atoms/typography";
import { PermissionGate } from "@/components/molecules/permission-gate/permission-gate";
import { NotAuthorized } from "@/components/organisms/not-authorized/not-authorized";

interface OnboardingPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OnboardingDashboardPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const t = await getTranslations("enrollments");

  return (
    <PermissionGate permission="enrollment:read" fallback={<NotAuthorized />}>
      <div className="space-y-8">
        <div>
          <Typography variant="h1" className="text-foreground text-2xl font-bold tracking-tight">
            {t("onboarding.title")}
          </Typography>
          <Typography variant="body" className="text-muted-foreground">
            {t("onboarding.subtitle")}
          </Typography>
        </div>

        <OnboardingStepTracker currentStep="ORIENTATION_MEETING" completedSteps={["ENROLLMENT"]} />

        <div className="space-y-6">
          <Typography variant="h2" className="text-foreground text-lg font-bold">
            {t("onboarding.participantsSection")}
          </Typography>
          <EnrollmentsListView searchParams={params} />
        </div>

        <div className="border-border space-y-6 border-t pt-6">
          <Typography variant="h2" className="text-foreground text-lg font-bold">
            {t("onboarding.meetingsSection")}
          </Typography>
          <MeetingsListView searchParams={params} />
        </div>
      </div>
    </PermissionGate>
  );
}
