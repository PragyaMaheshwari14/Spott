/* eslint-disable react-hooks/purity */
"use client";

import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { format } from "date-fns/format";
import { Calendar, Loader2, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

const MyTicketsPage = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const router = useRouter();

  const { data: registration, isLoading } = useConvexQuery(
    api.registration.getMyRegistrations
  );

  const { mutate: cancelRegistration, isLoading: isCancelling } =
    useConvexMutation(api.registration.cancelRegistration);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.13_155)]" />
          </div>
          <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">Loading your tickets…</p>
        </div>
      </div>
    );
  }

  const now = Date.now();

  const upcomingTickets = registration?.filter(
    (reg) => reg.event && reg.event.startDate >= now && reg.status === "confirmed"
  );

  const pastTickets = registration?.filter(
    (reg) => reg.event && (reg.event.startDate < now || reg.status === "cancelled")
  );

  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) return;
    try {
      await cancelRegistration({ registrationId });
      toast.success("Registration cancelled successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to cancel registration");
    }
  };

  const isEmpty = upcomingTickets?.length === 0 && pastTickets?.length === 0;

  return (
    <div className="min-h-screen pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
            <span className="text-[10px] tracking-[0.18em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
              Account
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-[oklch(0.18_0.02_80)] leading-tight">
            My Tickets
          </h1>
          <p className="text-sm text-[oklch(0.55_0.025_80)] font-light mt-1.5">
            {!isEmpty
              ? `${(upcomingTickets?.length ?? 0) + (pastTickets?.length ?? 0)} registration${((upcomingTickets?.length ?? 0) + (pastTickets?.length ?? 0)) !== 1 ? "s" : ""} total`
              : "View and manage your event registrations"}
          </p>
        </div>

        {/* ── Upcoming tickets ── */}
        {upcomingTickets?.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-display text-2xl text-[oklch(0.18_0.02_80)]">
                Upcoming
              </span>
              <span className="
                text-xs font-semibold px-2.5 py-1 rounded-full
                bg-[oklch(0.88_0.055_150)] text-[oklch(0.30_0.10_155)]
              ">
                {upcomingTickets.length}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingTickets.map((reg) => (
                <EventCard
                  key={reg._id}
                  event={reg.event}
                  action="ticket"
                  onClick={() => setSelectedTicket(reg)}
                  onDelete={() => handleCancelRegistration(reg._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Past tickets ── */}
        {pastTickets?.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="font-display text-2xl text-[oklch(0.18_0.02_80)]">
                Past Events
              </span>
              <span className="
                text-xs font-semibold px-2.5 py-1 rounded-full
                bg-[oklch(0.93_0.018_85)] text-[oklch(0.55_0.025_80)]
              ">
                {pastTickets.length}
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastTickets.map((reg) => (
                <EventCard
                  key={reg._id}
                  event={reg.event}
                  action={null}
                  className="opacity-55 grayscale-[30%]"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {isEmpty && (
          <div className="
            rounded-3xl border-2 border-dashed border-[oklch(0.82_0.045_150)]
            bg-[oklch(0.97_0.012_85)] p-16 text-center
          ">
            <div className="max-w-sm mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center mx-auto">
                <Ticket className="w-7 h-7 text-[oklch(0.40_0.11_155)]" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-[oklch(0.18_0.02_80)] mb-2">
                  No tickets yet
                </h2>
                <p className="text-sm text-[oklch(0.55_0.025_80)] font-light leading-relaxed">
                  Register for events to see your tickets here. Explore what&apos;s happening near you.
                </p>
              </div>
              <Link href="/explore">
                <Button className="
                  rounded-full px-6 gap-2
                  bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                  text-[oklch(0.97_0.01_85)] font-medium
                  shadow-[0_4px_20px_-6px_oklch(0.45_0.13_155_/_0.4)]
                  transition-all duration-200
                ">
                  <Ticket className="w-4 h-4" />
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── QR Ticket Modal ── */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="
            sm:max-w-sm rounded-3xl p-0 overflow-hidden
            border-[oklch(0.87_0.025_85)]
            bg-[oklch(0.99_0.006_80)]
          ">
            {/* Modal header */}
            <DialogHeader className="px-7 pt-7 pb-5 border-b border-[oklch(0.90_0.020_85)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4 text-[oklch(0.38_0.11_155)]" />
                </div>
                <div>
                  <DialogTitle className="font-display text-xl text-[oklch(0.18_0.02_80)]">
                    Your Ticket
                  </DialogTitle>
                  <p className="text-xs text-[oklch(0.60_0.025_80)] font-light mt-0.5 line-clamp-1">
                    {selectedTicket.event.title}
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* Modal body */}
            <div className="px-7 py-6 space-y-5">

              {/* Attendee name */}
              <div className="text-center">
                <p className="font-display text-xl text-[oklch(0.18_0.02_80)]">
                  {selectedTicket.attendeeName}
                </p>
              </div>

              {/* QR code — clean white island */}
              <div className="
                flex justify-center p-6 rounded-2xl
                bg-white
                border border-[oklch(0.87_0.025_85_/_0.5)]
                shadow-[0_4px_20px_-8px_oklch(0.18_0.02_80_/_0.12)]
              ">
                <QRCode
                  value={selectedTicket.qrCode}
                  size={188}
                  level="H"
                  fgColor="oklch(0.22 0.08 155)"
                  bgColor="white"
                />
              </div>

              {/* Ticket ID */}
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-[oklch(0.65_0.025_80)] mb-1">Ticket ID</p>
                <p className="font-mono text-xs text-[oklch(0.45_0.06_152)] bg-[oklch(0.93_0.018_85)] px-3 py-1.5 rounded-lg inline-block">
                  {selectedTicket.qrCode}
                </p>
              </div>

              {/* Event meta */}
              <div className="
                rounded-2xl p-4
                bg-[oklch(0.88_0.055_150_/_0.3)]
                border border-[oklch(0.80_0.06_150_/_0.25)]
                space-y-2.5 text-sm
              ">
                <div className="flex items-center gap-2.5 text-[oklch(0.35_0.08_155)]">
                  <Calendar className="w-3.5 h-3.5 text-[oklch(0.45_0.13_155)] shrink-0" />
                  <span className="font-light">
                    {format(selectedTicket.event.startDate, "PPP, h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[oklch(0.35_0.08_155)]">
                  <MapPin className="w-3.5 h-3.5 text-[oklch(0.45_0.13_155)] shrink-0" />
                  <span className="font-light">
                    {`${selectedTicket.event.city}, ${selectedTicket.event.state || selectedTicket.event.country}`}
                  </span>
                </div>
              </div>

              {/* Hint */}
              <p className="text-[11px] text-[oklch(0.65_0.025_80)] font-light text-center leading-relaxed">
                Show this QR code at the entrance for check-in
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyTicketsPage;