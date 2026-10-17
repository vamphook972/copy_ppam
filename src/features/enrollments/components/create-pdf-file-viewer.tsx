"use client";

import * as pdfjsLib from "pdfjs-dist";
import * as React from "react";

import { storageApi } from "@/features/storage";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

interface PdfFilePreviewProps {
  fileId?: string | null;
  className?: string;
}

export function PdfFilePreview({ fileId, className }: PdfFilePreviewProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadPreview = async () => {
      if (!fileId) {
        setPreviewUrl(null);
        return;
      }

      try {
        setIsLoading(true);
        setHasError(false);
        setPreviewUrl(null);

        const data = await storageApi.getDownloadUrl(fileId);

        const response = await fetch(data.downloadUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();

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

        // Keep only the first 50% of the page,
        // matching the upload preview.
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

        const preview = previewCanvas.toDataURL("image/jpeg", 0.85);

        if (isMounted) {
          setPreviewUrl(preview);
        }
      } catch (error) {
        console.error("Failed to generate PDF preview", error);

        if (isMounted) {
          setHasError(true);
          setPreviewUrl(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [fileId]);

  if (!fileId) {
    return null;
  }

  return (
    <div className={cn("border-border overflow-hidden rounded-lg border", className)}>
      <div className="relative flex min-h-[295px] w-full items-center justify-center overflow-hidden bg-white">
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />

            <span className="text-muted-foreground text-sm">Loading preview...</span>
          </div>
        )}

        {hasError && !isLoading && (
          <div className="text-muted-foreground px-4 text-center text-sm">
            Unable to generate PDF preview.
          </div>
        )}

        {previewUrl && !isLoading && !hasError && (
          <>
            <div className={cn("relative w-full overflow-hidden bg-white", "max-h-[310px]")}>
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
