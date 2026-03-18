"use client";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { CalendarDays, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";
import { useIsAdmin } from "@/hooks/use-is-admin";

const MyEvents = () => {
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: events, isLoading } = useConvexQuery(api.events.getMyEvents);
  const { mutate: deleteEvent } = useConvexMutation(api.events.deleteEvent);

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event? This action cannot be undone and will permanently delete the event and all associated registrations."
    );
    if (!confirmed) return;
    try {
      await deleteEvent({ eventId });
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete event");
    }
  };

  const handleEventClick = (eventId) => {
    router.push(`/my-events/${eventId}`);
  };

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) router.replace("/");
  }, [isAdmin, isAdminLoading, router]);

  if (isAdminLoading || !isAdmin) return null;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.13_155)]" />
          </div>
          <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">Loading your events…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-0">
      <div className="max-w-7xl mx-auto">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
              <span className="text-[10px] tracking-[0.18em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
                Dashboard
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-[oklch(0.18_0.02_80)] leading-tight">
              My Events
            </h1>
            <p className="text-sm text-[oklch(0.55_0.025_80)] font-light mt-1.5">
              {events?.length
                ? `You have ${events.length} event${events.length !== 1 ? "s" : ""}`
                : "Manage your created events"}
            </p>
          </div>
        </div>

        {/* ── Empty state ── */}
        {events?.length === 0 ? (
          <div className="
            rounded-3xl border-2 border-dashed border-[oklch(0.82_0.045_150)]
            bg-[oklch(0.97_0.012_85)] p-12 sm:p-16 text-center
          ">
            <div className="max-w-sm mx-auto space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center mx-auto">
                <CalendarDays className="w-7 h-7 text-[oklch(0.40_0.11_155)]" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-[oklch(0.18_0.02_80)] mb-2">
                  No events yet
                </h2>
                <p className="text-sm text-[oklch(0.55_0.025_80)] font-light leading-relaxed">
                  Create your first event and start inviting attendees to something memorable.
                </p>
              </div>
              <Link href="/create-event">
                <Button className="
                  rounded-full px-6 gap-2 mt-2
                  bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                  text-[oklch(0.97_0.01_85)] font-medium
                  shadow-[0_4px_20px_-6px_oklch(0.45_0.13_155_/_0.4)]
                  transition-all duration-200
                ">
                  <Plus className="w-4 h-4" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* ── Events grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {events?.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                action="event"
                onClick={() => handleEventClick(event._id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;