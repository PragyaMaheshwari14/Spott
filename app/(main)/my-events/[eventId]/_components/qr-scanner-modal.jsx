"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { AlertCircle, Loader2, QrCode } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const QRScannerModal = ({ isOpen, onClose }) => {
  const [scannerReady, setScannerReady] = useState(false);
  const [error, setError] = useState(null);

  const { mutate: checkInAttendee } = useConvexMutation(
    api.registration.checkInAttendee
  );

  const handleCheckIn = async (qrCode) => {
    try {
      const result = await checkInAttendee({ qrCode });
      if (result.success) {
        toast.success("✅ Check-in successful!");
        onClose();
      } else {
        toast.error(result.message || "Check-in failed");
      }
    } catch (error) {
      toast.error(error.message || "Invalid QR code");
    }
  };

  useEffect(() => {
    let scanner = null;
    let mounted = true;

    const initScanner = async () => {
      if (!open) return;

      try {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (permError) {
          setError("Camera permission denied. Please enable camera access.");
          return;
        }

        const { Html5QrcodeScanner } = await import("html5-qrcode");
        if (!mounted) return;

        scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            videoConstraints: { facingMode: "environment" },
          },
          false
        );

        const onScanSuccess = (decodedText) => {
          if (scanner) scanner.clear().catch(console.error);
          handleCheckIn(decodedText);
        };

        const onScanError = (error) => {
          if (error && !error.includes("NotFoundException")) {
            console.debug("Scan error:", error);
          }
        };

        scanner.render(onScanSuccess, onScanError);
        setScannerReady(true);
        setError(null);
      } catch (error) {
        setError(`Failed to start camera: ${error.message}`);
        toast.error("Camera failed. Please use manual entry.");
      }
    };

    initScanner();

    return () => {
      mounted = false;
      if (scanner) scanner.clear().catch(console.error);
      setScannerReady(false);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          sm:max-w-md rounded-3xl p-0 overflow-hidden
          border-[oklch(0.87_0.025_85)]
          bg-[oklch(0.99_0.006_80)]
        "
      >
        {/* Header */}
        <DialogHeader className="px-7 pt-7 pb-5 border-b border-[oklch(0.90_0.020_85)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
              <QrCode className="w-4.5 h-4.5 text-[oklch(0.38_0.11_155)]" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl text-[oklch(0.18_0.02_80)]">
                Check-In Attendee
              </DialogTitle>
              <DialogDescription className="text-xs text-[oklch(0.60_0.025_80)] font-light mt-0.5">
                Scan attendee QR code to check them in
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-7 py-6 space-y-5">

          {error ? (
            /* Error state */
            <div className="
              flex items-start gap-3 p-4 rounded-2xl
              bg-[oklch(0.97_0.03_28_/_0.5)]
              border border-[oklch(0.80_0.10_28_/_0.3)]
            ">
              <div className="w-8 h-8 rounded-xl bg-[oklch(0.92_0.06_28_/_0.5)] flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-[oklch(0.55_0.18_28)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[oklch(0.35_0.12_28)] mb-0.5">Camera unavailable</p>
                <p className="text-xs text-[oklch(0.50_0.10_28)] font-light">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Scanner viewport */}
              <div className="
                relative rounded-2xl overflow-hidden
                border border-[oklch(0.87_0.025_85)]
                bg-[oklch(0.93_0.018_85)]
              "
                style={{ minHeight: "320px" }}
              >
                <div id="qr-reader" className="w-full" />

                {/* Corner frame decoration */}
                {scannerReady && (
                  <>
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[oklch(0.55_0.13_152)] rounded-tl-lg pointer-events-none" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[oklch(0.55_0.13_152)] rounded-tr-lg pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[oklch(0.55_0.13_152)] rounded-bl-lg pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[oklch(0.55_0.13_152)] rounded-br-lg pointer-events-none" />
                  </>
                )}

                {/* Loading overlay */}
                {!scannerReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[oklch(0.97_0.012_85)]">
                    <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.13_155)]" />
                    </div>
                    <p className="text-xs text-[oklch(0.60_0.025_80)] font-light">
                      Starting camera…
                    </p>
                  </div>
                )}
              </div>

              {/* Status hint */}
              <p className="text-xs text-center text-[oklch(0.60_0.025_80)] font-light">
                {scannerReady
                  ? "Position the QR code within the frame to scan"
                  : "Please allow camera access when prompted"}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScannerModal;