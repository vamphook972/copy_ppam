"use client";

import { ClockIcon, MailIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button, Input, Label, Select, Textarea, Typography } from "@/components/atoms";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { notify } from "@/shared/utils/notify";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    // Simulación de envío con backend (futuro contrato DTO ContactInquiryDto)
    setTimeout(() => {
      setIsSubmitting(false);
      notify.success(t("successMessage"));
      (event.target as HTMLFormElement).reset();
    }, 800);
  }

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2 text-center">
          <Typography
            variant="h1"
            className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            {t("title")}
          </Typography>
          <Typography
            variant="subtitle"
            className="text-muted-foreground mx-auto max-w-2xl text-sm"
          >
            {t("description")}
          </Typography>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Info Card Columna Izquierda (4 cols) */}
          <aside className="space-y-6 lg:col-span-5">
            <Card className="border-border bg-card">
              <CardContent className="space-y-6 p-6">
                <Typography variant="h2" className="text-foreground text-lg font-bold">
                  {t("contactInfo.title")}
                </Typography>

                <div className="flex items-start gap-3.5">
                  <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <MailIcon className="size-5" />
                  </div>
                  <div>
                    <Typography variant="body" className="text-foreground text-sm font-semibold">
                      {t("emailField")}
                    </Typography>
                    <Typography variant="body" className="text-primary text-sm font-medium">
                      soporte@appam.co
                    </Typography>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <ClockIcon className="size-5" />
                  </div>
                  <div>
                    <Typography variant="body" className="text-foreground text-sm font-semibold">
                      {t("responseTime.title")}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-muted-foreground text-xs leading-relaxed"
                    >
                      {t("responseTime.description")}
                    </Typography>
                  </div>
                </div>

                <div className="border-border/60 border-t pt-4">
                  <Typography variant="caption" className="text-muted-foreground block text-xs">
                    {t("supportLink.title")}
                  </Typography>
                  <Link
                    href="/support"
                    className={buttonVariants({
                      variant: "outline",
                      className: "mt-3 w-full justify-center text-xs",
                    })}
                  >
                    {t("supportLink.description")}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Formulario Columna Derecha (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">{t("nameField")}</Label>
                    <Input
                      id="contact-name"
                      name="name"
                      required
                      placeholder={t("placeholder.name")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">{t("emailField")}</Label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder={t("placeholder.email")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-category">{t("categoryField.title")}</Label>
                    <Select
                      id="contact-category"
                      name="category"
                      defaultValue={t("categoryField.general")}
                    >
                      <option value="general">{t("categoryField.general")}</option>
                      <option value="technical">{t("categoryField.technical")}</option>
                      <option value="access">{t("categoryField.access")}</option>
                      <option value="other">{t("categoryField.other")}</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">{t("messageField")}</Label>
                    <Textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      placeholder={t("placeholder.message")}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t("button.sending") : t("button.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
