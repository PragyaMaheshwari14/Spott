"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Ticket, CheckCircle } from "lucide-react";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterModal({ event, isOpen, onClose }) {
  const router = useRouter();
  const { user } = useUser();
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: registerForEvent, isLoading } = useConvexMutation(
    api.registration.registerForEvent
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await registerForEvent({ eventId: event._id, attendeeName: name, attendeeEmail: email });
      setIsSuccess(true);
      toast.success("Registration successful! 🎉");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    }
  };

  const handleViewTicket = () => {
    router.push("/my-tickets");
    onClose();
  };

  /* ── Shared input class ── */
  const inputCls =
    "h-10 rounded-xl bg-[oklch(0.97_0.012_85)] border border-[oklch(0.85_0.025_85)] " +
    "text-[oklch(0.18_0.02_80)] placeholder:text-[oklch(0.65_0.025_80)] placeholder:font-light " +
    "focus-visible:ring-1 focus-visible:ring-[oklch(0.55_0.13_152)] focus-visible:border-[oklch(0.75_0.09_150)] " +
    "text-sm transition-all duration-200";

  /* ── Success state ── */
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm rounded-3xl p-0 overflow-hidden border-[oklch(0.87_0.025_85)] bg-[oklch(0.99_0.006_80)]">
          <div className="px-8 py-10 flex flex-col items-center text-center space-y-5">

            {/* Success icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-[oklch(0.40_0.13_155)]" />
              </div>
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl ring-4 ring-[oklch(0.75_0.09_150_/_0.25)] scale-110" />
            </div>

            <div>
              <h2 className="font-display text-2xl text-[oklch(0.18_0.02_80)] mb-2">
                You&apos;re All Set!
              </h2>
              <p className="text-sm text-[oklch(0.55_0.025_80)] font-light leading-relaxed">
                Your registration is confirmed. Your QR code ticket is ready in My Tickets.
              </p>
            </div>

            <div className="w-full space-y-2.5 pt-1">
              <Button
                className="
                  w-full gap-2 rounded-2xl font-medium
                  bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                  text-[oklch(0.97_0.01_85)]
                  shadow-[0_4px_20px_-6px_oklch(0.45_0.13_155_/_0.45)]
                  transition-all duration-200
                "
                onClick={handleViewTicket}
              >
                <Ticket className="w-4 h-4" />
                View My Ticket
              </Button>
              <Button
                variant="outline"
                className="
                  w-full rounded-2xl text-sm font-light
                  border-[oklch(0.85_0.025_85)] text-[oklch(0.50_0.025_80)]
                  hover:bg-[oklch(0.93_0.018_85)]
                  transition-all duration-200
                "
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ── Registration form ── */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm rounded-3xl p-0 overflow-hidden border-[oklch(0.87_0.025_85)] bg-[oklch(0.99_0.006_80)]">

        {/* Header */}
        <DialogHeader className="px-7 pt-7 pb-5 border-b border-[oklch(0.90_0.020_85)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4 text-[oklch(0.38_0.11_155)]" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl text-[oklch(0.18_0.02_80)]">
                Register
              </DialogTitle>
              <DialogDescription className="text-xs text-[oklch(0.60_0.025_80)] font-light mt-0.5 line-clamp-1">
                {event.title}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-5">

          {/* Event summary pill */}
          <div className="
            flex items-center justify-between
            bg-[oklch(0.88_0.055_150_/_0.35)] border border-[oklch(0.80_0.06_150_/_0.3)]
            rounded-2xl px-4 py-3
          ">
            <p className="text-sm font-medium text-[oklch(0.28_0.10_155)] line-clamp-1 flex-1 mr-3">
              {event.title}
            </p>
            <span className="
              text-xs font-semibold shrink-0 px-2.5 py-1 rounded-full
              bg-[oklch(0.88_0.055_150)] text-[oklch(0.30_0.10_155)]
            ">
              {event.ticketType === "free" ? "Free" : `₹${event.ticketPrice}`}
            </span>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium text-[oklch(0.40_0.025_80)] uppercase tracking-wide">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-[oklch(0.40_0.025_80)] uppercase tracking-wide">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
              className={inputCls}
            />
          </div>

          {/* Terms */}
          <p className="text-[11px] text-[oklch(0.65_0.025_80)] font-light leading-relaxed">
            By registering you agree to receive event updates and reminders via email.
          </p>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="
                flex-1 rounded-2xl text-sm font-light
                border-[oklch(0.85_0.025_85)] text-[oklch(0.50_0.025_80)]
                hover:bg-[oklch(0.93_0.018_85)]
                transition-all duration-200
              "
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="
                flex-1 gap-2 rounded-2xl font-medium
                bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                text-[oklch(0.97_0.01_85)]
                shadow-[0_4px_16px_-6px_oklch(0.45_0.13_155_/_0.45)]
                disabled:opacity-60 transition-all duration-200
              "
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</>
              ) : (
                <><Ticket className="w-4 h-4" /> Register</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}