"use client";

import { Award, Calendar, Loader2, Phone, Save, User } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notify } from "@/shared/utils/notify";

import { useUpdateProfileMeMutation } from "../hooks/use-profile";
import type { ProfileMeResponseDto } from "../types";
import type { AlternatePhoneItem } from "./molecules/phone-input-list";
import {
  ProfileAvailabilityTab,
  type AvailabilitySlot,
} from "./organisms/profile-availability-tab";
import { ProfileContactTab } from "./organisms/profile-contact-tab";
import { ProfileHeaderCard } from "./organisms/profile-header-card";
import { ProfilePersonalTab } from "./organisms/profile-personal-tab";
import { ProfilePrivilegesTab } from "./organisms/profile-privileges-tab";

interface ProfileFormProps {
  data: ProfileMeResponseDto;
}

export function ProfileForm({ data }: ProfileFormProps) {
  const t = useTranslations("profile");
  const updateMutation = useUpdateProfileMeMutation();

  const [activeTab, setActiveTab] = useState("personal");

  // Form State
  const [preferredName, setPreferredName] = useState(data.user.preferredName ?? "");
  const [maritalStatus, setMaritalStatus] = useState<"SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED">(
    data.profile.maritalStatus ?? "SINGLE"
  );
  const [spouse, setSpouse] = useState({
    participatesInPpam: Boolean(data.profile.spouse?.participatesInPpam),
    fullName: data.profile.spouse?.fullName ?? "",
    marriedLastName: data.profile.spouse?.marriedLastName ?? "",
  });
  const [languages, setLanguages] = useState(
    data.profile.languages?.length > 0
      ? data.profile.languages
      : [{ languageCode: "ES", isPrimary: true }]
  );
  const [primaryPhone, setPrimaryPhone] = useState({
    countryCode: data.profile.phones?.primary?.countryCode ?? "+57",
    number: data.profile.phones?.primary?.number ?? "",
    label: data.profile.phones?.primary?.label ?? null,
    hasWhatsapp: Boolean(data.profile.phones?.primary?.hasWhatsapp),
  });
  const [alternatePhones, setAlternatePhones] = useState<AlternatePhoneItem[]>(
    data.profile.phones?.alternate?.map((p) => ({
      countryCode: p.countryCode ?? "+57",
      number: p.number ?? "",
      label: p.label ?? "",
      hasWhatsapp: Boolean(p.hasWhatsapp),
    })) ?? []
  );
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    data.profile.availability?.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    })) ?? []
  );
  const [selectedPrivilegeId, setSelectedPrivilegeId] = useState<number | null>(
    data.profile.pendingServicePrivilegeRequest?.servicePrivilegeId ?? null
  );

  const isPending = updateMutation.isPending;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await updateMutation.mutateAsync({
        preferredName: preferredName.trim() || null,
        maritalStatus,
        spouse:
          maritalStatus === "MARRIED"
            ? {
                participatesInPpam: spouse.participatesInPpam,
                fullName: spouse.fullName?.trim() || null,
                marriedLastName: spouse.marriedLastName?.trim() || null,
              }
            : null,
        languages,
        phones: {
          primary: {
            countryCode: primaryPhone.countryCode,
            number: primaryPhone.number.trim(),
            label: primaryPhone.label || null,
            hasWhatsapp: primaryPhone.hasWhatsapp,
          },
          alternate: alternatePhones.map((p) => ({
            countryCode: p.countryCode,
            number: p.number.trim(),
            label: p.label?.trim() || null,
            hasWhatsapp: p.hasWhatsapp,
          })),
        },
        availability,
        requestedServicePrivilegeId: selectedPrivilegeId,
      });
      notify.success(t("updateSuccess"));
    } catch {
      notify.error(t("updateError"));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header Banner */}
      <ProfileHeaderCard user={data.user} tenant={data.tenant} />

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-foreground text-base font-semibold">{t("title")}</h3>
          <p className="text-muted-foreground text-xs">{t("subtitle")}</p>
        </div>
        <Button onClick={() => handleSubmit()} disabled={isPending} className="gap-2 shadow-sm">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isPending ? t("saving") : t("saveChanges")}</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/60 grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1 sm:grid-cols-4">
          <TabsTrigger
            value="personal"
            className="data-[state=active]:bg-card gap-2 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:shadow-sm"
          >
            <User className="h-4 w-4 shrink-0" />
            <span>{t("tabs.personal")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-card gap-2 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:shadow-sm"
          >
            <Phone className="h-4 w-4 shrink-0" />
            <span>{t("tabs.contact")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="availability"
            className="data-[state=active]:bg-card gap-2 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:shadow-sm"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{t("tabs.availability")}</span>
          </TabsTrigger>
          <TabsTrigger
            value="privileges"
            className="data-[state=active]:bg-card gap-2 rounded-lg py-2.5 text-xs font-semibold data-[state=active]:shadow-sm"
          >
            <Award className="h-4 w-4 shrink-0" />
            <span>{t("tabs.privileges")}</span>
          </TabsTrigger>
        </TabsList>

        <div className="border-border/70 bg-card rounded-xl border p-6 shadow-sm">
          <TabsContent value="personal" className="mt-0 outline-none">
            <ProfilePersonalTab
              user={data.user}
              preferredName={preferredName}
              onPreferredNameChange={setPreferredName}
              maritalStatus={maritalStatus}
              onMaritalStatusChange={setMaritalStatus}
              spouse={spouse}
              onSpouseChange={(val) =>
                setSpouse({
                  participatesInPpam: val.participatesInPpam,
                  fullName: val.fullName ?? "",
                  marriedLastName: val.marriedLastName ?? "",
                })
              }
              languages={languages}
              onLanguagesChange={setLanguages}
              disabled={isPending}
            />
          </TabsContent>

          <TabsContent value="contact" className="mt-0 outline-none">
            <ProfileContactTab
              primaryPhone={primaryPhone}
              onPrimaryPhoneChange={(val) =>
                setPrimaryPhone({
                  countryCode: val.countryCode,
                  number: val.number,
                  label: val.label ?? null,
                  hasWhatsapp: Boolean(val.hasWhatsapp),
                })
              }
              alternatePhones={alternatePhones}
              onAlternatePhonesChange={setAlternatePhones}
              disabled={isPending}
            />
          </TabsContent>

          <TabsContent value="availability" className="mt-0 outline-none">
            <ProfileAvailabilityTab
              availability={availability}
              onChange={setAvailability}
              disabled={isPending}
            />
          </TabsContent>

          <TabsContent value="privileges" className="mt-0 outline-none">
            <ProfilePrivilegesTab
              currentPrivileges={data.profile.servicePrivileges ?? []}
              pendingRequest={data.profile.pendingServicePrivilegeRequest}
              selectedPrivilegeId={selectedPrivilegeId}
              onSelectedPrivilegeIdChange={setSelectedPrivilegeId}
              disabled={isPending}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
