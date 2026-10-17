"use client";

import * as pdfjsLib from "pdfjs-dist";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/atoms/typography";
import { cn } from "@/lib/utils";
import { notify } from "@/shared/utils/notify";

import { storageApi } from "../api/storage.api";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

interface PdfFileUploadInputProps {
  value?: string;
  onChange: (fileId: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function PdfFileUploadInput({
  value,
  onChange,
  error,
  disabled,
  className,
}: PdfFileUploadInputProps) {
  const t = useTranslations("enrollments");

  const [isUploading, setIsUploading] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let isMounted = true;

    if (value && !fileName) {
      storageApi
        .getFileInfo(value)
        .then((fileInfo) => {
          if (isMounted && fileInfo?.originalName) {
            setFileName(fileInfo.originalName);
          }
        })
        .catch((err) => {
          console.error("Failed to load storage file metadata", err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [value, fileName]);

  const createPdfPreview = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    if (pdf.numPages < 1) {
      throw new Error("PDF contains no pages");
    }

    const page = await pdf.getPage(1);

    const viewport = page.getViewport({
      scale: 1.5,
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not create canvas context");
    }

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise;

    // Keep only the first 50% of the page.
    const cropHeight = Math.floor(canvas.height / 2);

    const previewCanvas = document.createElement("canvas");
    previewCanvas.width = canvas.width;
    previewCanvas.height = cropHeight;

    const previewContext = previewCanvas.getContext("2d");

    if (!previewContext) {
      throw new Error("Could not create preview canvas context");
    }

    previewContext.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      cropHeight,
      0,
      0,
      canvas.width,
      cropHeight
    );

    return previewCanvas.toDataURL("image/jpeg", 0.85);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      notify.error(t("storage.pdfOnlyError"));
      e.target.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setFileName(file.name);

      const preview = await createPdfPreview(file);
      setPreviewUrl(preview);

      const result = await storageApi.uploadFile(file, "enrollment");
      onChange(result.id);
      notify.success(t("storage.uploadSuccessNotification"));
    } catch (err) {
      console.error("Failed to process PDF", err);
      setFileName(null);
      setPreviewUrl(null);
      notify.error(t("storage.uploadErrorNotification"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setFileName(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Typography variant="caption" className="text-foreground font-medium">
        {t("storage.pdfUploadLabel")}
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
        id="pdf-file-upload-input"
      />

      {!value && !fileName ? (
        <label
          htmlFor="pdf-file-upload-input"
          className={cn(
            "border-border bg-card hover:border-primary/50 hover:bg-muted/50 flex min-h-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors",
            (disabled || isUploading) && "cursor-not-allowed opacity-50",
            error && "border-destructive"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              <Typography variant="caption" className="text-muted-foreground">
                {t("storage.uploading")}
              </Typography>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1">
              <Typography variant="body" className="text-primary font-medium">
                {t("storage.clickToSelect")}
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                {t("storage.pdfHint")}
              </Typography>
            </div>
          )}
        </label>
      ) : (
        <div className="border-border bg-muted/30 overflow-hidden rounded-lg border">
          {previewUrl && (
            <div className={cn("relative w-full overflow-hidden bg-white", "max-h-[280px]")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt=""
                draggable={false}
                className="block h-auto w-full object-contain select-none"
                style={{
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 cursor-default"
                onContextMenu={(event) => event.preventDefault()}
                onDragStart={(event) => event.preventDefault()}
              />
              <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1">
                <Typography variant="caption" className="whitespace-nowrap text-white">
                  PDF preview
                </Typography>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t p-3">
            <div className="flex min-w-0 items-center space-x-3 overflow-hidden">
              <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xs font-bold">
                PDF
              </div>
              <div className="min-w-0">
                <Typography variant="body" className="text-foreground truncate font-medium">
                  {fileName || value}
                </Typography>
                <Typography
                  variant="caption"
                  className={cn(
                    "font-medium",
                    isUploading ? "text-muted-foreground" : "text-success"
                  )}
                >
                  {isUploading ? t("storage.uploading") : `✓ ${t("storage.uploadedSuccess")}`}
                </Typography>
              </div>
            </div>

            {!disabled && !isUploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive ml-2 shrink-0 rounded-md p-1 text-xs font-semibold transition-colors"
              >
                {t("storage.changeFile")}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <Typography variant="caption" className="text-destructive font-medium">
          {error}
        </Typography>
      )}
    </div>
  );
}
