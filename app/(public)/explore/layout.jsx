"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ExploreLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMainExplore = pathname === "/explore";

  return (
    <div className="pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Back button for nested routes */}
        {!isMainExplore && (
          <div className="mb-7">
            <button
              onClick={() => router.push("/explore")}
              className="flex items-center gap-2 text-sm text-[oklch(0.55_0.025_80)] hover:text-[oklch(0.45_0.13_155)] font-light transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to Explore
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}