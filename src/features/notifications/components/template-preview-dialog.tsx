"use client";

import { Loader2, Play, X } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button, Input, Typography } from "@/components/atoms";

import { notificationsApi } from "../api/notifications.api";
import { NotificationTemplate } from "../types/notification";

interface TemplatePreviewDialogProps {
  template: NotificationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  titleText?: string;
  descriptionText?: string;
}

export function TemplatePreviewDialog({
  template,
  isOpen,
  onClose,
  titleText,
  descriptionText,
}: TemplatePreviewDialogProps) {
  const t = useTranslations("emailTemplates");
  const commonT = useTranslations("common");

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<{ subject: string; body: string } | null>(
    null
  );

  if (!isOpen || !template) return null;

  const handleInputChange = (varName: string, val: string) => {
    setVariableValues((prev) => ({ ...prev, [varName]: val }));
  };

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.previewTemplate(template.templateId, {
        variables: variableValues,
      });
      setPreviewResult(res);
    } catch {
      // Fallback for client-side rendering
      let clientSubject = template.subject;
      let clientBody = template.body;
      Object.entries(variableValues).forEach(([k, v]) => {
        const regex = new RegExp(`{{\\s*${k}\\s*}}`, "g");
        clientSubject = clientSubject.replace(regex, v || `{{${k}}}`);
        clientBody = clientBody.replace(regex, v || `{{${k}}}`);
      });
      setPreviewResult({ subject: clientSubject, body: clientBody });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card border-border flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border shadow-xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <Typography variant="h3">{titleText || t("preview.title")}</Typography>
            <Typography variant="caption">{descriptionText || t("preview.description")}</Typography>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {/* Variables Inputs */}
          {template.variables && template.variables.length > 0 && (
            <div className="border-border bg-muted/30 flex flex-col gap-3 rounded-lg border p-4">
              <Typography
                variant="body"
                className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
              >
                {t("preview.variablesHeader")}
              </Typography>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {template.variables.map((v) => (
                  <div key={v} className="flex flex-col gap-1">
                    <label htmlFor={`var-${v}`} className="font-mono text-xs font-medium">
                      {`{{${v}}}`}
                    </label>
                    <Input
                      id={`var-${v}`}
                      placeholder={`Valor para ${v}`}
                      value={variableValues[v] || ""}
                      onChange={(e) => handleInputChange(v, e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleGeneratePreview}
                disabled={isLoading}
                className="mt-1 self-start"
              >
                {isLoading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                )}
                {t("preview.generatePreview")}
              </Button>
            </div>
          )}

          {/* Rendered Subject */}
          <div className="flex flex-col gap-1.5">
            <Typography variant="caption" className="font-semibold tracking-wider uppercase">
              Asunto:
            </Typography>
            <div className="bg-muted/40 border-border rounded-md border p-3 text-sm font-medium">
              {previewResult ? previewResult.subject : template.subject}
            </div>
          </div>

          {/* Rendered Body */}
          <div className="flex flex-col gap-1.5">
            <Typography variant="caption" className="font-semibold tracking-wider uppercase">
              {t("preview.resultHeader")}:
            </Typography>
            <div
              className="prose dark:prose-invert border-border bg-card min-h-[160px] max-w-none rounded-md border p-4 shadow-xs"
              dangerouslySetInnerHTML={{
                __html: previewResult ? previewResult.body : template.body,
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-border bg-muted/20 flex justify-end border-t px-6 py-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            {commonT("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
