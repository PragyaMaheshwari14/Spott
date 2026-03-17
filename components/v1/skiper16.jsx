"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import ReactLenis from "lenis/react";
import React, { useRef } from "react";

const StickyCard_001 = ({ i, title, src, progress, range, targetScale }) => {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="sticky top-0 flex items-center justify-center">
      <motion.div
        style={{
          scale,
          top: `calc(${i * 40}px)`, // 🔥 FIXED spacing
        }}
        className="relative flex h-[340px] w-[540px] origin-top overflow-hidden rounded-3xl shadow-xl"
      >
        <img src={src} alt={title} className="h-full w-full object-cover" />
      </motion.div>
    </div>
  );
};

export function Skiper16() {
  const container = useRef(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  const projects = [
    { title: "Music Event", src: "/events/event1.jpg" },
    { title: "Startup Meetup", src: "/events/event2.jpg" },
    { title: "Workshop", src: "/events/event3.jpg" },
    { title: "Hackathon", src: "/events/event1.jpg" },
  ];

  return (
    <ReactLenis root>
      <main
        ref={container}
        className="flex flex-col items-center justify-center gap-20 py-24"
      >
        {/* ✅ FIXED TEXT (no absolute) */}
        <div className="text-center max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-[oklch(0.60_0.05_150)] leading-relaxed">
            Explore events happening around you. <br />
            Join, create, and be part of something meaningful.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col items-center">
          {projects.map((project, i) => {
            const targetScale = Math.max(
              0.7,
              1 - (projects.length - i - 1) * 0.08
            );

            return (
              <StickyCard_001
                key={i}
                i={i}
                {...project}
                progress={scrollYProgress}
                range={[i * 0.25, 1]}
                targetScale={targetScale}
              />
            );
          })}
        </div>
      </main>
    </ReactLenis>
  );
}