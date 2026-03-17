"use client";
import EventCard from "@/components/event-card";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { CATEGORIES } from "@/lib/data";
import { parseLocationSlug } from "@/lib/location-utils";
import { Loader2, MapPin } from "lucide-react";
import { notFound, useParams, useRouter } from "next/navigation";
import React from "react";

const DynamicExplorePage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  // Check if it's a valid category
  const categoryInfo = CATEGORIES.find((cat) => cat.id === slug);
  const isCategory = !!categoryInfo;

  // If not a category, validate as location
  const { city, state, isValid } = !isCategory
    ? parseLocationSlug(slug)
    : { city: null, state: null, isValid: false };

  if (!categoryInfo && !isValid) notFound();

  const { data: events, isLoading } = useConvexQuery(
    isCategory ? api.explore.getEventsByCategory : api.explore.getEventsByLocation,
    isCategory
      ? { category: slug, limit: 50 }
      : city && state
        ? { city, state, limit: 50 }
        : "skip"
  );

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.13_155)]" />
          </div>
          <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">Finding events…</p>
        </div>
      </div>
    );
  }

  /* ── Category view ── */
  if (isCategory) {
    return (
      <>
        {/* Header */}
        <div className="pb-8">
          <div className="flex items-center gap-5 mb-4">
            <div className="w-16 h-16 rounded-3xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center text-3xl shrink-0">
              {categoryInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
                <span className="text-[10px] tracking-[0.15em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
                  Category
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-[oklch(0.18_0.02_80)] leading-tight">
                {categoryInfo.label}
              </h1>
              {categoryInfo.description && (
                <p className="text-sm text-[oklch(0.55_0.025_80)] font-light mt-1">
                  {categoryInfo.description}
                </p>
              )}
            </div>
          </div>

          {events && events.length > 0 && (
            <span className="
              inline-flex text-xs font-semibold px-3 py-1 rounded-full
              bg-[oklch(0.88_0.055_150)] text-[oklch(0.30_0.10_155)]
            ">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onClick={() =>
                  router.push(`/events/${event.slug}?from=category&category=${slug}`)
                }
              />
            ))}
          </div>
        ) : (
          <div className="
            rounded-3xl border-2 border-dashed border-[oklch(0.82_0.045_150)]
            bg-[oklch(0.97_0.012_85)] py-16 text-center
          ">
            <div className="text-3xl mb-3">{categoryInfo.icon}</div>
            <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">
              No events in <span className="font-medium text-[oklch(0.40_0.025_80)]">{categoryInfo.label}</span> yet.
            </p>
          </div>
        )}
      </>
    );
  }

  /* ── Location view ── */
  return (
    <>
      {/* Header */}
      <div className="pb-8">
        <div className="flex items-center gap-5 mb-4">
          <div className="w-16 h-16 rounded-3xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
            <MapPin className="w-7 h-7 text-[oklch(0.40_0.11_155)]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
              <span className="text-[10px] tracking-[0.15em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
                Location
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-[oklch(0.18_0.02_80)] leading-tight">
              Events in {city}
            </h1>
            <p className="text-sm text-[oklch(0.55_0.025_80)] font-light mt-1">
              {state}, India
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="
            inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full
            bg-[oklch(0.88_0.055_150)] text-[oklch(0.30_0.10_155)]
            border border-[oklch(0.75_0.09_150_/_0.3)]
          ">
            <MapPin className="w-3 h-3" />
            {city}, {state}
          </span>
          {events && events.length > 0 && (
            <span className="
              text-xs font-semibold px-3 py-1 rounded-full
              bg-[oklch(0.93_0.018_85)] text-[oklch(0.50_0.025_80)]
            ">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>
      </div>

      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() =>
                router.push(`/events/${event.slug}?returnTo=category:${slug}`)
              }
            />
          ))}
        </div>
      ) : (
        <div className="
          rounded-3xl border-2 border-dashed border-[oklch(0.82_0.045_150)]
          bg-[oklch(0.97_0.012_85)] py-16 text-center
        ">
          <div className="w-14 h-14 rounded-3xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-[oklch(0.40_0.11_155)]" />
          </div>
          <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">
            No events in <span className="font-medium text-[oklch(0.40_0.025_80)]">{city}, {state}</span> yet.
          </p>
        </div>
      )}
    </>
  );
};

export default DynamicExplorePage;