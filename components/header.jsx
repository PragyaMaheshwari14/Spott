"use client";
import { SignInButton, useAuth, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { Authenticated, Unauthenticated } from "convex/react";
import { BarLoader } from "react-spinners";
import { useStoreUser } from "@/hooks/use-store-user";
import { Building, Plus, Ticket } from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import OnboardingModal from "./onboarding-modal";
import SearchLocationBar from "./search-location-bar";
import { useIsAdmin } from "@/hooks/use-is-admin";

export default function Header() {
  const { isLoading } = useStoreUser();
  const { isAdmin } = useIsAdmin();

  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } =
    useOnboarding();

  if (isLoading) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-20 border-b border-[oklch(0.87_0.025_85_/_0.7)]"
        style={{
          background: "oklch(0.97 0.012 85 / 0.85)",
          backdropFilter: "blur(20px) saturate(1.6)",
        }}
      >
<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/spott.png"
              alt="Spott logo"
              width={500}
              height={500}
              className="w-auto h-9"
              priority
            />
          </Link>

          {/* Search bar — desktop */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl">
            <SearchLocationBar />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-[oklch(0.40_0.025_80)] hover:text-[oklch(0.18_0.02_80)] hover:bg-[oklch(0.90_0.025_82)] rounded-full px-4 font-light"
            >
              <Link href="/explore">Explore</Link>
            </Button>

            <Authenticated>
              {isAdmin && (
                <Button
                  size="sm"
                  asChild
                  className="
                    flex gap-1.5 rounded-full px-4
                    bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                    text-[oklch(0.97_0.01_85)]
                    shadow-[0_2px_12px_-4px_oklch(0.45_0.13_155_/_0.45)]
                    transition-all duration-200
                  "
                >
                  <Link href="/create-event">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-sm font-medium">Create Event</span>
                  </Link>
                </Button>
              )}

              <div className="ml-1">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-2 ring-[oklch(0.75_0.09_150_/_0.4)] ring-offset-1 ring-offset-[oklch(0.97_0.012_85)]",
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
              </div>
            </Authenticated>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button
                  size="sm"
                  className="
                    rounded-full px-5
                    bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                    text-[oklch(0.97_0.01_85)] font-medium text-sm
                    shadow-[0_2px_12px_-4px_oklch(0.45_0.13_155_/_0.4)]
                    transition-all duration-200
                  "
                >
                  Sign In
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden border-t border-[oklch(0.87_0.025_85_/_0.5)] px-4 py-2.5">
          <SearchLocationBar />
        </div>

        {/* Loading bar */}
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