"use client";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { Building, Menu, Plus, Ticket, X } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import { useIsAdmin } from "@/hooks/use-is-admin";

export default function Header() {
  const { isLoading } = useStoreUser();
  const { isAdmin } = useIsAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();

  if (isLoading) return null;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-20 border-b border-[oklch(0.87_0.025_85_/_0.4)]"
        style={{
          background: "oklch(0.97 0.012 85 / 0.55)",
          backdropFilter: "blur(20px) saturate(1.6) brightness(1.04)",
          WebkitBackdropFilter: "blur(20px) saturate(1.6) brightness(1.04)",
          boxShadow:
            "0 1px 0 oklch(0.87 0.025 85 / 0.35), 0 4px 24px -8px oklch(0.45 0.13 155 / 0.08)",
        }}
      >
        {/* ── Row 1: Logo + Desktop Search + Actions ── */}
        {/* ── Row 1 ── */}
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 overflow-hidden">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/spott.jpg"
              alt="Spott logo"
              width={800}
              height={800}
              className="h-25 sm:h-22 w-auto"
              priority
            />
          </Link>

          {/* Search bar — desktop only */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl mx-auto">
            <SearchLocationBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            {/* Explore — desktop only */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden sm:flex text-[oklch(0.40_0.025_80)] hover:text-[oklch(0.18_0.02_80)] hover:bg-[oklch(0.88_0.055_150_/_0.4)] rounded-full px-4 font-light text-sm transition-all duration-200"
            >
              <Link href="/explore">Explore</Link>
            </Button>
            <Authenticated>
              {isAdmin && (
                <Button
                  size="sm"
                  asChild
                  className="flex gap-1 rounded-full px-2.5 sm:px-4 bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)] text-[oklch(0.97_0.01_85)] shadow-[0_2px_12px_-4px_oklch(0.45_0.13_155_/_0.45)] transition-all duration-200"
                >
                  <Link href="/create-event">
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline text-sm font-medium">
                      Create
                    </span>
                  </Link>
                </Button>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-7 h-7 sm:w-8 sm:h-8 ring-2 ring-[oklch(0.75_0.09_150_/_0.4)] ring-offset-1 ring-offset-transparent",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="My Tickets"
                    labelIcon={<Ticket size={16} />}
                    href="/my-tickets"
                  />
                  {isAdmin && (
                    <UserButton.Link
                      label="My Events"
                      labelIcon={<Building size={16} />}
                      href="/my-events"
                    />
                  )}
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="rounded-full px-4 bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)] text-[oklch(0.97_0.01_85)] font-medium text-sm shadow-[0_2px_12px_-4px_oklch(0.45_0.13_155_/_0.4)] transition-all duration-200 whitespace-nowrap"
                >
                  Sign In
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>

        {/* ── Row 2: Mobile search bar ── */}
        <div className="md:hidden border-t border-[oklch(0.87_0.025_85_/_0.35)] px-4 py-2">
          <SearchLocationBar />
        </div>

        {/* ── Loading bar ── */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 w-full">
            <BarLoader width="100%" color="oklch(0.55 0.13 152)" />
          </div>
        )}
      </nav>

      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}
