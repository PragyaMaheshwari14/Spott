"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { format } from "date-fns/format";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const AttendeeCard = ({ registration }) => {
  const { mutate: checkInAttendee, isLoading } = useConvexMutation(
    api.registration.checkInAttendee
  );

  const handleManualCheckIn = async () => {
    try {
      const result = await checkInAttendee({ qrCode: registration.qrCode });
      if (result.success) {
        toast.success("Attendee checked in successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to check in attendee");
    }
  };

  const checkedIn = registration.checkedIn;

  return (
    <Card
      className="
        py-0 border
        bg-[oklch(0.99_0.006_80)]
        border-[oklch(0.87_0.025_85_/_0.5)]
        hover:border-[oklch(0.75_0.09_150_/_0.4)]
        hover:shadow-[0_4px_20px_-8px_oklch(0.45_0.13_155_/_0.15)]
        transition-all duration-200
        rounded-2xl overflow-hidden
      "
    >
      <CardContent className="p-4 flex items-start gap-4">

        {/* Status icon */}
        <div
          className={`
            mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${checkedIn
              ? "bg-[oklch(0.88_0.055_150)] text-[oklch(0.35_0.11_155)]"
              : "bg-[oklch(0.93_0.018_85)] text-[oklch(0.65_0.025_80)]"
            }
          `}
        >
          {checkedIn
            ? <CheckCircle className="w-4.5 h-4.5" />
            : <Circle className="w-4.5 h-4.5" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-medium text-sm text-[oklch(0.18_0.02_80)] truncate">
              {registration.attendeeName}
            </h3>
            {checkedIn && (
              <span className="
                shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full
                bg-[oklch(0.88_0.055_150)] text-[oklch(0.30_0.10_155)]
              ">
                Checked in
              </span>
            )}
          </div>

          <p className="text-xs text-[oklch(0.55_0.025_80)] font-light mb-2 truncate">
            {registration.attendeeEmail}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[oklch(0.62_0.025_80)] font-light">
            <span>
              {checkedIn
                ? `✓ ${format(registration.checkedInAt, "PPp")}`
                : `Registered ${format(registration.registeredAt, "PPp")}`}
            </span>
            <span className="font-mono text-[oklch(0.65_0.04_150)] tracking-tight">
              {registration.qrCode}
            </span>
          </div>
        </div>

        {/* Check-in button */}
        {!checkedIn && (
          <Button
            size="sm"
            onClick={handleManualCheckIn}
            disabled={isLoading}
            className="
              shrink-0 rounded-xl gap-1.5 text-xs font-medium
              bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
              text-[oklch(0.97_0.01_85)]
              shadow-[0_2px_10px_-4px_oklch(0.45_0.13_155_/_0.4)]
              disabled:opacity-60 transition-all duration-200
            "
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Check In
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendeeCard;