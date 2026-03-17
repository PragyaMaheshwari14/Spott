"use client";

import React, { useRef, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Loader2, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { createLocationSlug } from "@/lib/location-utils";
import EventCard from "@/components/event-card";
import { CATEGORIES } from "@/lib/data";

const ExploreClient = () => {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));
  const router = useRouter();

  const searchParams = useSearchParams();
  const scroll = searchParams.get("scroll");

  useEffect(() => {
    if (scroll === "popular") {
      const el = document.getElementById("popular");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [scroll]);

  const { data: featuredEvents, isLoading: loadingFeatured } =
    useConvexQuery(api.explore.getFeaturedEvents, { limit: 3 });

  const { data: localEvents, isLoading: loadingLocal } =
    useConvexQuery(api.explore.getEventsByLocation, {
      city: currentUser?.location?.city || "Gurugram",
      state: currentUser?.location?.state || "Haryana",
      limit: 4,
    });

  const { data: popularEvents, isLoading: loadingPopular } =
    useConvexQuery(api.explore.getPopularEvents, { limit: 6 });

  const { data: categoryCounts } =
    useConvexQuery(api.explore.getCategoryCounts);

  const categoriesWithCounts = CATEGORIES.map((cat) => ({
    ...cat,
    count: categoryCounts?.[cat.id] || 0,
  }));

  const openPopularEvent = (slug) => router.push(`/events/${slug}?returnTo=popular`);
  const handleCategoryClick = (categoryId) => router.push(`/explore/${categoryId}`);
  const handleViewLocalEvents = () => {
    const city = currentUser?.location?.city || "Gurugram";
    const state = currentUser?.location?.state || "Haryana";
    router.push(`/explore/${createLocationSlug(city, state)}`);
  };

  const isLoading = loadingFeatured || loadingLocal || loadingPopular;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.13_155)]" />
          </div>
          <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">Loading events…</p>
        </div>
      </div>
    );
  }

  const hasAnyEvents =
    (featuredEvents?.length ?? 0) > 0 ||
    (localEvents?.length ?? 0) > 0 ||
    (popularEvents?.length ?? 0) > 0;

  return (
    <>
      {/* ── Hero heading ── */}
      <div className="pb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
          <span className="text-[10px] tracking-[0.18em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
            Spott
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-[oklch(0.18_0.02_80)] leading-tight mb-3">
          Discover Events
        </h1>
        <p className="text-base text-[oklch(0.55_0.025_80)] font-light max-w-xl mx-auto leading-relaxed">
          Explore featured events, find what&apos;s happening locally, or browse events across India.
        </p>
      </div>

      {/* ── Featured Carousel ── */}
      {featuredEvents && featuredEvents.length > 0 && (
        <div className="mb-16">
          <Carousel
            className="w-full"
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {featuredEvents.map((event) => (
                <CarouselItem key={event._id}>
                  <div
                    onClick={() => openPopularEvent(event.slug)}
                    className="relative h-[380px] rounded-3xl overflow-hidden cursor-pointer group shadow-[0_12px_48px_-12px_oklch(0.18_0.02_80_/_0.2)]"
                  >
                    {event.coverImage ? (
                      <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ backgroundColor: event.themeColor }} />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.10_0.01_80_/_0.85)] via-[oklch(0.10_0.01_80_/_0.3)] to-transparent" />

                    <div className="relative h-full flex flex-col justify-end p-8 md:p-10">
                      {/* Location badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[oklch(0.88_0.055_150_/_0.2)] border border-[oklch(0.75_0.09_150_/_0.3)] text-[oklch(0.88_0.055_150)] backdrop-blur-sm">
                          <MapPin className="w-3 h-3" />
                          {event.city}, {event.state || event.country}
                        </span>
                      </div>

                      <h2 className="font-display text-3xl md:text-4xl text-white mb-2 leading-tight line-clamp-2">
                        {event.title}
                      </h2>
                      <p className="text-sm text-white/75 mb-5 max-w-2xl line-clamp-1 font-light">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-5 text-white/70 text-xs font-light">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[oklch(0.80_0.08_150)]" />
                          {format(event.startDate, "PPP")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[oklch(0.80_0.08_150)]" />
                          {event.registrationCount} registered
                        </span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-[oklch(0.99_0.006_80_/_0.9)] border-[oklch(0.87_0.025_85)] hover:bg-[oklch(0.97_0.012_85)] text-[oklch(0.35_0.08_155)]" />
            <CarouselNext className="right-4 bg-[oklch(0.99_0.006_80_/_0.9)] border-[oklch(0.87_0.025_85)] hover:bg-[oklch(0.97_0.012_85)] text-[oklch(0.35_0.08_155)]" />
          </Carousel>
        </div>
      )}

      {/* ── Events Near You ── */}
      {localEvents && localEvents.length > 0 && (
        <div className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
                <span className="text-[10px] tracking-[0.15em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
                  Local
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl text-[oklch(0.18_0.02_80)]">
                Events Near You
              </h2>
              <p className="text-sm text-[oklch(0.55_0.025_80)] font-light mt-0.5">
                Happening in {currentUser?.location?.city || "your area"}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleViewLocalEvents}
              className="
                rounded-full gap-2 text-xs font-medium
                border-[oklch(0.80_0.06_150_/_0.5)]
                text-[oklch(0.35_0.10_155)]
                hover:bg-[oklch(0.88_0.055_150)]
                hover:border-[oklch(0.65_0.09_150)]
                transition-all duration-200
              "
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {localEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="compact"
                onClick={() => openPopularEvent(event.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Browse by Category ── */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
          <span className="text-[10px] tracking-[0.15em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
            Categories
          </span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-[oklch(0.18_0.02_80)] mb-6">
          Browse by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoriesWithCounts.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="
                group text-left p-4 sm:p-5 rounded-2xl
                bg-[oklch(0.99_0.006_80)] border border-[oklch(0.87_0.025_85_/_0.5)]
                hover:border-[oklch(0.75_0.09_150_/_0.5)]
                hover:shadow-[0_6px_24px_-8px_oklch(0.45_0.13_155_/_0.18)]
                hover:bg-[oklch(0.97_0.012_85)]
                transition-all duration-250
              "
            >
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="font-medium text-sm text-[oklch(0.18_0.02_80)] group-hover:text-[oklch(0.38_0.13_155)] transition-colors mb-0.5">
                {category.label}
              </h3>
              <p className="text-xs text-[oklch(0.60_0.025_80)] font-light">
                {category.count} event{category.count !== 1 ? "s" : ""}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Popular Across India ── */}
      {popularEvents && popularEvents.length > 0 && (
        <div id="popular" className="mb-16">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
            <span className="text-[10px] tracking-[0.15em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
              Trending
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-[oklch(0.18_0.02_80)] mb-1">
            Popular Across India
          </h2>
          <p className="text-sm text-[oklch(0.55_0.025_80)] font-light mb-6">
            Trending events nationwide
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="list"
                onClick={() => openPopularEvent(event.slug)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!hasAnyEvents && (
        <div className="
          rounded-3xl border-2 border-dashed border-[oklch(0.82_0.045_150)]
          bg-[oklch(0.97_0.012_85)] p-16 text-center
        ">
          <div className="max-w-sm mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center mx-auto text-3xl">
              🎉
            </div>
            <div>
              <h2 className="font-display text-2xl text-[oklch(0.18_0.02_80)] mb-2">
                No events yet
              </h2>
              <p className="text-sm text-[oklch(0.55_0.025_80)] font-light leading-relaxed">
                Be the first to create an event in your area!
              </p>
            </div>
            <Button
              asChild
              className="
                rounded-full px-6
                bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                text-[oklch(0.97_0.01_85)] font-medium
                shadow-[0_4px_20px_-6px_oklch(0.45_0.13_155_/_0.4)]
                transition-all duration-200
              "
            >
              <a href="/create-event">Create Event</a>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ExploreClient;