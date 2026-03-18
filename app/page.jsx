import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Skiper16 } from "@/components/v1/skiper16";

export default function Home() {
  const images = [
    { src: "/events/event1.jpg", alt: "Music Festival" },
    { src: "/events/event2.jpg", alt: "Startup Meetup" },
    { src: "/events/event3.jpg", alt: "Workshops" },
  ];
  return (
    <div className="relative">
      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="pb-20 relative overflow-hidden">
        {/* Organic background blobs — Pi-style */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          {/* Large warm beige wash */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-[oklch(0.88_0.055_150)] opacity-30 blur-[120px]" />
          {/* Forest green glow */}
          <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-[oklch(0.45_0.13_155)] opacity-15 blur-[100px]" />
          {/* Warm sand accent */}
          <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-[oklch(0.90_0.025_82)] opacity-40 blur-[90px]" />
        </div>

        <div className="w-full max-w-4xl sm:max-w-5xl md:max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center relative z-10">
          {/* ── Left: Copy ── */}
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Brand pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-green text-sm font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.45_0.13_155)] animate-pulse" />
              Spott
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight text-[oklch(0.18_0.02_80)]">
              Discover&nbsp;&amp;
              <br />
              create&nbsp;amazing
              <br />
              <span className="text-brand-gradient italic">events.</span>
            </h1>

            {/* Sub-copy */}
            <p className="text-lg sm:text-xl text-[oklch(0.50_0.025_80)] font-light max-w-xl leading-relaxed mx-auto">
              Whether you&apos;re hosting or attending, Spott makes every event
              memorable. Join our community today.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/explore">
                <Button
                  size="lg"
                  className="
                    rounded-full px-8 py-6 text-base font-medium
                    bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                    text-[oklch(0.97_0.01_85)]
                    shadow-[0_4px_24px_-6px_oklch(0.45_0.13_155_/_0.5)]
                    hover:shadow-[0_6px_32px_-6px_oklch(0.45_0.13_155_/_0.65)]
                    transition-all duration-300
                  "
                >
                  Get Started
                </Button>
              </Link>

              <Link href="/explore">
                <button
                  className="
                  text-[oklch(0.45_0.13_155)] text-sm font-medium
                  underline underline-offset-4 decoration-[oklch(0.75_0.09_150)]
                  hover:decoration-[oklch(0.45_0.13_155)] transition-all duration-200
                "
                >
                  Browse events →
                </button>
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-6 justify-center pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[oklch(0.97_0.012_85)] bg-[oklch(0.88_0.055_150)]"
                  />
                ))}
              </div>
              <p className="text-sm text-[oklch(0.50_0.025_80)] font-light">
                <span className="font-medium text-[oklch(0.18_0.02_80)]">
                  1,400+
                </span>{" "}
                events created this month
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* ── Sticky Card Scroll Section ───────────────── */}
      <section className="bg-[oklch(0.97_0.01_85)] py-20">
        <Skiper16 />
      </section>

      {/* ── Feature strip ──────────────────────────────────── */}
      <section className="py-16 border-t border-[oklch(0.87_0.025_85)]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section label */}
          <p className="text-center text-xs tracking-[0.2em] uppercase text-[oklch(0.60_0.05_150)] mb-12 font-medium">
            Why Spott
          </p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                icon: "✦",
                title: "Discover Events",
                desc: "Find events happening near you, curated to match your interests and vibe.",
              },
              {
                icon: "◎",
                title: "Host with Ease",
                desc: "Create, manage, and promote your event in minutes with intuitive tools.",
              },
              {
                icon: "❋",
                title: "Build Community",
                desc: "Connect with like-minded people and turn every event into a lasting memory.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="
                  group relative p-8 rounded-3xl
                  bg-[oklch(0.99_0.006_80)] border border-[oklch(0.87_0.025_85_/_0.5)]
                  hover:border-[oklch(0.75_0.09_150_/_0.5)]
                  hover:shadow-[0_8px_40px_-12px_oklch(0.45_0.13_155_/_0.2)]
                  transition-all duration-300
                "
              >
                <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center text-[oklch(0.35_0.11_155)] text-lg mb-5">
                  {icon}
                </div>
                <h3 className="font-display text-xl text-[oklch(0.18_0.02_80)] mb-2">
                  {title}
                </h3>
                <p className="text-sm text-[oklch(0.50_0.025_80)] font-light leading-relaxed">
                  {desc}
                </p>

                {/* Hover line */}
                <div className="absolute bottom-0 left-8 right-8 h-px bg-[oklch(0.75_0.09_150)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}