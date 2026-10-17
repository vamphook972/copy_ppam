"use client";

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import * as React from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";

import { useMeetingActions } from "../hooks/use-meeting-actions";

interface AttendanceQrScannerModalProps {
  meetingId: string;
  isOpen: boolean;
  onClose: () => void;
}

type CameraStatus = "checking" | "available" | "not_found" | "permission_denied";

export function AttendanceQrScannerModal({
  meetingId,
  isOpen,
  onClose,
}: AttendanceQrScannerModalProps) {
  const t = useTranslations("meetings");
  const [qrCodeInput, setQrCodeInput] = React.useState("");
  const [notesInput, setNotesInput] = React.useState("");
  const [cameraStatus, setCameraStatus] = React.useState<CameraStatus>("checking");
  const [isManualInputMode, setIsManualInputMode] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);

  const { markAttendanceMutation } = useMeetingActions();
  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const scannerRegionId = "qr-reader-region";

  // Check camera availability when modal opens
  React.useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function checkCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        if (isMounted) setCameraStatus("not_found");
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");

        if (videoDevices.length === 0) {
          if (isMounted) setCameraStatus("not_found");
        } else {
          if (isMounted) setCameraStatus("available");
        }
      } catch {
        if (isMounted) setCameraStatus("permission_denied");
      }
    }

    checkCamera();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Start QR Scanner when camera is available and not in manual mode
  React.useEffect(() => {
    let html5Qrcode: Html5Qrcode | null = null;
    let isSubscribed = true;

    if (!isOpen || cameraStatus !== "available" || isManualInputMode) {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        if (scanner.isScanning) {
          scanner
            .stop()
            .then(() => {
              scanner.clear();
            })
            .catch(() => {});
        } else {
          try {
            scanner.clear();
          } catch {}
        }
      }
      return;
    }

    try {
      html5Qrcode = new Html5Qrcode(scannerRegionId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = html5Qrcode;

      const config = {
        fps: 10,
        qrbox: { width: 220, height: 220 },
      };

      html5Qrcode
        .start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (!isSubscribed) return;
            setQrCodeInput(decodedText);
            setIsScanning(false);
            if (html5Qrcode?.isScanning) {
              html5Qrcode
                .stop()
                .then(() => {
                  html5Qrcode?.clear();
                })
                .catch(() => {});
            }
          },
          () => {}
        )
        .then(() => {
          if (isSubscribed) {
            setIsScanning(true);
          }
        })
        .catch(() => {
          if (isSubscribed) {
            setCameraStatus("permission_denied");
            setIsScanning(false);
          }
        });
    } catch {
      if (isSubscribed) {
        Promise.resolve().then(() => {
          if (isSubscribed) {
            setCameraStatus("permission_denied");
            setIsScanning(false);
          }
        });
      }
    }

    return () => {
      isSubscribed = false;
      if (html5Qrcode) {
        const scanner = html5Qrcode;
        scannerRef.current = null;
        if (scanner.isScanning) {
          scanner
            .stop()
            .then(() => {
              scanner.clear();
            })
            .catch(() => {});
        } else {
          try {
            scanner.clear();
          } catch {}
        }
      }
    };
  }, [isOpen, cameraStatus, isManualInputMode]);

  if (!isOpen) return null;

  const handleClose = () => {
    setQrCodeInput("");
    setNotesInput("");
    setCameraStatus("checking");
    setIsManualInputMode(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;

    markAttendanceMutation.mutate(
      {
        id: meetingId,
        payload: {
          qrCode: qrCodeInput.trim(),
          notes: notesInput.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  const handleRestartScanner = () => {
    setQrCodeInput("");
    setCameraStatus("checking");
    setIsManualInputMode(false);
    // Trigger re-check
    setTimeout(() => {
      setCameraStatus("available");
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="border-border bg-card w-full max-w-lg rounded-lg border p-6 shadow-xl">
        <div className="border-border mb-4 flex items-center justify-between border-b pb-3">
          <Typography
            variant="h3"
            className="text-foreground flex items-center gap-2 text-lg font-bold"
          >
            <Camera className="text-primary h-5 w-5" />
            {t("qrModal.title")}
          </Typography>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Camera Viewport / Fallback Header */}
          {!isManualInputMode && cameraStatus === "available" ? (
            <div className="border-border bg-background relative overflow-hidden rounded-lg border">
              <div id={scannerRegionId} className="min-h-[250px] w-full" />

              {qrCodeInput && (
                <div className="bg-card/95 absolute inset-0 flex flex-col items-center justify-center p-4 text-center backdrop-blur-xs">
                  <div className="bg-success/20 text-success mb-2 flex h-10 w-10 items-center justify-center rounded-full font-bold">
                    ✓
                  </div>
                  <Typography variant="body" className="text-foreground font-bold">
                    {t("qrModal.qrScanned")}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground mb-3 font-mono">
                    {qrCodeInput}
                  </Typography>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRestartScanner}
                    className="gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("qrModal.rescan")}
                  </Button>
                </div>
              )}

              {isScanning && !qrCodeInput && (
                <div className="bg-background/80 border-border border-t p-2 text-center">
                  <Typography variant="caption" className="text-muted-foreground">
                    {t("qrModal.cameraActive")}
                  </Typography>
                </div>
              )}
            </div>
          ) : (
            <div className="border-border bg-muted/30 space-y-2 rounded-lg border-2 border-dashed p-6 text-center">
              {cameraStatus === "checking" ? (
                <Typography variant="body" className="text-muted-foreground">
                  {t("qrModal.cameraChecking")}
                </Typography>
              ) : cameraStatus === "not_found" ? (
                <div className="space-y-1">
                  <CameraOff className="text-warning mx-auto h-8 w-8" />
                  <Typography variant="body" className="text-foreground font-semibold">
                    {t("qrModal.cameraNotFound")}
                  </Typography>
                </div>
              ) : cameraStatus === "permission_denied" ? (
                <div className="space-y-1">
                  <CameraOff className="text-destructive mx-auto h-8 w-8" />
                  <Typography variant="body" className="text-foreground font-semibold">
                    {t("qrModal.cameraPermissionDenied")}
                  </Typography>
                </div>
              ) : (
                <div className="space-y-1">
                  <Typography variant="body" className="text-foreground font-semibold">
                    {t("qrModal.subtitle")}
                  </Typography>
                  <Typography variant="caption" className="text-muted-foreground">
                    {t("qrModal.hint")}
                  </Typography>
                </div>
              )}
            </div>
          )}

          {/* Toggle camera/manual input if camera is available */}
          {cameraStatus === "available" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsManualInputMode(!isManualInputMode)}
                className="text-primary text-xs font-medium hover:underline"
              >
                {isManualInputMode ? t("qrModal.switchCamera") : t("qrModal.switchManual")}
              </button>
            </div>
          )}

          <div>
            <Typography variant="caption" className="text-foreground mb-1 block font-medium">
              {t("qrModal.qrCodeLabel")}
            </Typography>
            <input
              type="text"
              value={qrCodeInput}
              onChange={(e) => setQrCodeInput(e.target.value)}
              placeholder={t("qrModal.qrCodePlaceholder")}
              required
              readOnly={!isManualInputMode}
              disabled={!isManualInputMode}
              minLength={10}
              maxLength={100}
              className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div>
            <Typography variant="caption" className="text-foreground mb-1 block font-medium">
              {t("qrModal.notesLabel")}
            </Typography>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder={t("qrModal.notesPlaceholder")}
              maxLength={500}
              className="border-border bg-background focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="border-border flex justify-end gap-2 border-t pt-2">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              {t("qrModal.cancelButton")}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={markAttendanceMutation.isPending || qrCodeInput.trim().length < 10}
            >
              {t("qrModal.submitButton")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
