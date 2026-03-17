/* eslint-disable react-hooks/purity */
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns/format";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Share2,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import RegisterModal from "./_components/register-modal";
import { toast } from "sonner";

// ── Small section heading ─────────────────────────────────────
const SectionHeading = ({ children }) => (
  <h2 className="font-display text-xl text-[oklch(0.18_0.02_80)] mb-4">
    {children}
  </h2>
);

// ── Info row for sidebar ──────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-[oklch(0.55_0.025_80)] font-light">
      <Icon className="w-3.5 h-3.5 text-[oklch(0.55_0.13_152)]" />
      <span>{label}</span>
    </div>
    <span className="font-medium text-[oklch(0.22_0.02_80)]">{value}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
const EventPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const category = searchParams.get("category");

  const { user } = useUser();
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const { data: event, isLoading } = useConvexQuery(api.events.getEventbySLug, {
    slug: params.slug,
  });

  const { data: registration } = useConvexQuery(
    api.registration.checkRegistration,
    event?._id ? { eventId: event._id } : "skip"
  );

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: event.description.slice(0, 100) + "...", url });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleRegister = () => {
    if (!user) { toast.error("Please sign in to register"); return; }
    setShowRegisterModal(true);
  };

  const handleBack = () => {
    if (from === "category" && category) { router.push(`/explore/${category}`); return; }
    if (from === "popular") { router.push("/explore?scroll=popular"); return; }
    router.push("/explore");
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.13_155)]" />
          </div>
          <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">Loading event…</p>
        </div>
      </div>
    );
  }

  if (!event) notFound();

  const isEventFull = event.registrationCount >= event.capacity;
  const isEventPast = event.endDate < Date.now();
  const isOrganizer = user?.id === event.organizerId;
  const capacityPct = Math.min(Math.round((event.registrationCount / event.capacity) * 100), 100);

  return (
    <div className="min-h-screen py-8 -mt-6 md:-mt-16 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Back button ── */}
        <div className="mb-7">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-[oklch(0.55_0.025_80)] hover:text-[oklch(0.45_0.13_155)] font-light transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to Explore
          </button>
        </div>

        {/* ── Event header ── */}
        <div className="mb-7">
          <Badge className="mb-3 text-xs rounded-full bg-[oklch(0.88_0.055_150)] text-[oklch(0.30_0.10_155)] border-0 px-3 py-1">
            {getCategoryIcon(event.category)}&nbsp;{getCategoryLabel(event.category)}
          </Badge>

          <h1 className="font-display text-4xl md:text-5xl text-[oklch(0.18_0.02_80)] leading-tight mb-4">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[oklch(0.55_0.025_80)] font-light">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[oklch(0.55_0.13_152)]" />
              <span>{format(event.startDate, "EEEE, MMMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[oklch(0.55_0.13_152)]" />
              <span>{format(event.startDate, "h:mm a")} – {format(event.endDate, "h:mm a")}</span>
            </div>
          </div>
        </div>

        {/* ── Hero image ── */}
        {event.coverImage && (
          <div className="relative h-64 md:h-[420px] rounded-3xl overflow-hidden mb-9 shadow-[0_12px_48px_-12px_oklch(0.18_0.02_80_/_0.18)]">
            <Image src={event.coverImage} alt={event.title} fill className="object-cover" priority />
            {/* Subtle bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[oklch(0.97_0.012_85_/_0.4)] to-transparent" />
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">

          {/* ── Main content ── */}
          <div className="space-y-6">

            {/* About */}
            <div className="rounded-3xl bg-[oklch(0.99_0.006_80)] border border-[oklch(0.87_0.025_85_/_0.5)] p-6 sm:p-8">
              <SectionHeading>About This Event</SectionHeading>
              <p className="text-[oklch(0.40_0.018_80)] whitespace-pre-wrap leading-relaxed text-sm font-light">
                {event.description}
              </p>
            </div>

            {/* Location */}
            <div className="rounded-3xl bg-[oklch(0.99_0.006_80)] border border-[oklch(0.87_0.025_85_/_0.5)] p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-[oklch(0.38_0.11_155)]" />
                </div>
                <SectionHeading>Location</SectionHeading>
              </div>

              <div className="space-y-2 pl-10">
                <p className="font-medium text-[oklch(0.22_0.02_80)] text-sm">
                  {event.city}, {event.state || event.country}
                </p>
                {event.address && (
                  <p className="text-sm text-[oklch(0.55_0.025_80)] font-light">{event.address}</p>
                )}
                {event.venue && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="
                      mt-2 rounded-full gap-2 text-xs font-medium
                      border-[oklch(0.80_0.06_150_/_0.5)]
                      text-[oklch(0.35_0.10_155)]
                      hover:bg-[oklch(0.88_0.055_150)]
                      hover:border-[oklch(0.65_0.09_150)]
                      transition-all duration-200
                    "
                  >
                    <a href={event.venue} target="_blank" rel="noopener noreferrer">
                      View on Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Organizer */}
            <div className="rounded-3xl bg-[oklch(0.99_0.006_80)] border border-[oklch(0.87_0.025_85_/_0.5)] p-6 sm:p-8">
              <SectionHeading>Organizer</SectionHeading>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 ring-2 ring-[oklch(0.75_0.09_150_/_0.3)] ring-offset-1 ring-offset-[oklch(0.99_0.006_80)]">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[oklch(0.88_0.055_150)] text-[oklch(0.35_0.11_155)] font-medium text-base">
                    {event.organizerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[oklch(0.18_0.02_80)]">{event.organizerName}</p>
                  <p className="text-xs text-[oklch(0.60_0.025_80)] font-light mt-0.5">Event Organizer</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl bg-[oklch(0.99_0.006_80)] border border-[oklch(0.87_0.025_85_/_0.5)] overflow-hidden shadow-[0_8px_40px_-16px_oklch(0.45_0.13_155_/_0.15)]">

              {/* Price section */}
              <div className="px-6 pt-6 pb-5 border-b border-[oklch(0.90_0.020_85)]">
                <p className="text-[10px] uppercase tracking-widest text-[oklch(0.65_0.025_80)] mb-1">Price</p>
                <p className="font-display text-4xl text-[oklch(0.18_0.02_80)]">
                  {event.ticketType === "free" ? "Free" : `₹${event.ticketPrice}`}
                </p>
                {event.ticketType === "paid" && (
                  <p className="text-xs text-[oklch(0.60_0.025_80)] font-light mt-1">Pay at venue</p>
                )}
              </div>

              {/* Stats */}
              <div className="px-6 py-5 space-y-3.5 border-b border-[oklch(0.90_0.020_85)]">
                <div className="space-y-2">
                  <InfoRow icon={Users} label="Attendees" value={`${event.registrationCount} / ${event.capacity}`} />
                  {/* Capacity bar */}
                  <div className="h-1.5 rounded-full bg-[oklch(0.90_0.025_82)] overflow-hidden ml-5">
                    <div
                      className="h-full rounded-full bg-[oklch(0.55_0.13_152)] transition-all duration-500"
                      style={{ width: `${capacityPct}%` }}
                    />
                  </div>
                </div>
                <InfoRow icon={Calendar} label="Date" value={format(event.startDate, "MMM dd, yyyy")} />
                <InfoRow icon={Clock} label="Time" value={format(event.startDate, "h:mm a")} />
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={`${event.city}, ${event.state || event.country}`}
                />
              </div>

              {/* CTA section */}
              <div className="px-6 py-5 space-y-3">
                {registration ? (
                  <>
                    <div className="flex items-center gap-2.5 bg-[oklch(0.88_0.055_150_/_0.5)] border border-[oklch(0.75_0.09_150_/_0.3)] text-[oklch(0.30_0.10_155)] p-3 rounded-2xl">
                      <CheckCircle className="w-4.5 h-4.5 text-[oklch(0.45_0.13_155)] shrink-0" />
                      <span className="text-sm font-medium">You&apos;re registered!</span>
                    </div>
                    <Button
                      className="
                        w-full gap-2 rounded-2xl font-medium
                        bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                        text-[oklch(0.97_0.01_85)]
                        shadow-[0_4px_20px_-6px_oklch(0.45_0.13_155_/_0.4)]
                        transition-all duration-200
                      "
                      onClick={() => router.push("/my-tickets")}
                    >
                      <Ticket className="w-4 h-4" />
                      View Ticket
                    </Button>
                  </>
                ) : isEventPast ? (
                  <Button className="w-full rounded-2xl opacity-50" disabled>
                    Event Ended
                  </Button>
                ) : isEventFull ? (
                  <Button className="w-full rounded-2xl opacity-50" disabled>
                    Event Full
                  </Button>
                ) : isOrganizer ? (
                  <Button
                    className="
                      w-full rounded-2xl font-medium
                      bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                      text-[oklch(0.97_0.01_85)]
                      shadow-[0_4px_20px_-6px_oklch(0.45_0.13_155_/_0.4)]
                      transition-all duration-200
                    "
                    onClick={() => router.push(`/events/${event.slug}/manage`)}
                  >
                    Manage Event
                  </Button>
                ) : (
                  <Button
                    className="
                      w-full gap-2 rounded-2xl font-medium
                      bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                      text-[oklch(0.97_0.01_85)]
                      shadow-[0_4px_20px_-6px_oklch(0.45_0.13_155_/_0.4)]
                      hover:shadow-[0_6px_28px_-6px_oklch(0.45_0.13_155_/_0.6)]
                      transition-all duration-200
                    "
                    onClick={handleRegister}
                  >
                    <Ticket className="w-4 h-4" />
                    Register for Event
                  </Button>
                )}

                {/* Share */}
                <Button
                  variant="outline"
                  className="
                    w-full gap-2 rounded-2xl text-sm font-light
                    border-[oklch(0.85_0.025_85)]
                    text-[oklch(0.45_0.025_80)]
                    hover:bg-[oklch(0.93_0.018_85)]
                    hover:border-[oklch(0.75_0.09_150_/_0.5)]
                    transition-all duration-200
                  "
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4" />
                  Share Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Register modal */}
      {showRegisterModal && (
        <RegisterModal
          event={event}
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
};

export default EventPage;