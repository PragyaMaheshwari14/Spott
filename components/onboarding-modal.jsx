"use client";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { Progress } from "./ui/progress";
import { ArrowLeft, ArrowRight, Heart, MapPin } from "lucide-react";
import { CATEGORIES } from "@/lib/data";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { City, State } from "country-state-city";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [location, setLocation] = useState({
    state: "",
    city: "",
    country: "India",
  });
  const [submitting, setSubmitting] = useState(false);

  const { mutate: completeOnboarding } = useConvexMutation(api.users.completeOnboarding);

  const indianStates = State.getStatesOfCountry("IN");

  const cities = useMemo(() => {
    if (!location.state) return [];
    const selectedState = indianStates.find((s) => s.name === location.state);
    if (!selectedState) return [];
    return City.getCitiesOfState("IN", selectedState.isoCode);
  }, [location.state, indianStates]);

  const progress = (step / 2) * 100;

  const toggleInterest = (categoryId) => {
    setSelectedInterests((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      completeOnboarding({
        location: {
          city: location.city,
          state: location.state,
          country: location.country,
        },
        interests: selectedInterests,
      });
      toast.success("Welcome to Spott!");
      onComplete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedInterests.length < 3) {
      toast.error("Please select at least 3 interests");
      return;
    }
    if (step === 2 && (!location.city || !location.state)) {
      toast.error("Please select both state and city");
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="sm:max-w-2xl rounded-3xl border-[oklch(0.87_0.025_85)] bg-[oklch(0.99_0.006_80)] p-0 overflow-hidden"
      >
        {/* Progress bar at very top */}
        <div className="h-1 bg-[oklch(0.90_0.025_82)]">
          <div
            className="h-full bg-[oklch(0.55_0.13_152)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-8 pt-6 pb-8 space-y-6">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Step icon */}
              <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
                {step === 1
                  ? <Heart className="w-5 h-5 text-[oklch(0.38_0.11_155)]" />
                  : <MapPin className="w-5 h-5 text-[oklch(0.38_0.11_155)]" />
                }
              </div>
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-[oklch(0.60_0.05_150)] font-medium mb-0.5">
                  Step {step} of 2
                </p>
                <DialogTitle className="font-display text-2xl text-[oklch(0.18_0.02_80)] leading-tight">
                  {step === 1 ? "What interests you?" : "Where are you located?"}
                </DialogTitle>
              </div>
            </div>

            <DialogDescription className="text-[oklch(0.55_0.025_80)] font-light text-sm">
              {step === 1
                ? "Pick at least 3 categories to personalise your Spott experience."
                : "We'll surface events happening right where you are."}
            </DialogDescription>
          </DialogHeader>

          {/* ── Step 1: Interests ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {CATEGORIES.map((category) => {
                  const selected = selectedInterests.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleInterest(category.id)}
                      className={`
                        py-4 px-3 rounded-2xl border-2 text-center
                        transition-all duration-200 hover:scale-[1.02]
                        ${selected
                          ? "border-[oklch(0.55_0.13_152)] bg-[oklch(0.88_0.055_150)] shadow-[0_4px_16px_-4px_oklch(0.45_0.13_155_/_0.25)]"
                          : "border-[oklch(0.87_0.025_85)] bg-[oklch(0.97_0.012_85)] hover:border-[oklch(0.75_0.09_150_/_0.5)] hover:bg-[oklch(0.93_0.025_85)]"
                        }
                      `}
                    >
                      <div className="text-2xl mb-1.5">{category.icon}</div>
                      <div className={`text-xs font-medium ${selected ? "text-[oklch(0.28_0.10_155)]" : "text-[oklch(0.30_0.02_80)]"}`}>
                        {category.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selection counter */}
              <div className="flex items-center gap-2">
                <Badge
                  className={`
                    rounded-full text-xs px-3
                    ${selectedInterests.length >= 3
                      ? "bg-[oklch(0.88_0.055_150)] text-[oklch(0.28_0.10_155)] border-0"
                      : "bg-[oklch(0.92_0.022_85)] text-[oklch(0.50_0.025_80)] border-0"
                    }
                  `}
                >
                  {selectedInterests.length} selected
                </Badge>
                {selectedInterests.length >= 3 && (
                  <span className="text-xs text-[oklch(0.45_0.13_155)] font-medium flex items-center gap-1">
                    <span>✓</span> Ready to continue
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Location ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {/* State */}
                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-medium text-[oklch(0.40_0.025_80)] uppercase tracking-wide">
                    State
                  </Label>
                  <Select
                    value={location.state}
                    onValueChange={(value) => setLocation({ ...location, state: value, city: "" })}
                  >
                    <SelectTrigger
                      id="state"
                      className="h-11 w-full rounded-xl border-[oklch(0.85_0.025_85)] bg-[oklch(0.97_0.012_85)] text-sm focus:ring-[oklch(0.55_0.13_152)]"
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[oklch(0.87_0.025_85)] bg-[oklch(0.99_0.006_80)]">
                      {indianStates.map((state) => (
                        <SelectItem key={state.isoCode} value={state.name} className="text-sm">
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-medium text-[oklch(0.40_0.025_80)] uppercase tracking-wide">
                    City
                  </Label>
                  <Select
                    value={location.city}
                    onValueChange={(value) => setLocation({ ...location, city: value })}
                    disabled={!location.state}
                  >
                    <SelectTrigger
                      id="city"
                      className="h-11 w-full rounded-xl border-[oklch(0.85_0.025_85)] bg-[oklch(0.97_0.012_85)] text-sm focus:ring-[oklch(0.55_0.13_152)] disabled:opacity-50"
                    >
                      <SelectValue placeholder={location.state ? "Select city" : "State first"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[oklch(0.87_0.025_85)] bg-[oklch(0.99_0.006_80)]">
                      {cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city.name} value={city.name} className="text-sm">
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-cities" disabled>No cities available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location confirmation card */}
              {location.city && location.state && (
                <div className="p-4 rounded-2xl bg-[oklch(0.88_0.055_150_/_0.4)] border border-[oklch(0.75_0.09_150_/_0.3)]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-[oklch(0.38_0.11_155)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[oklch(0.22_0.08_155)]">Your location</p>
                      <p className="text-xs text-[oklch(0.40_0.06_155)] font-light">
                        {location.city}, {location.state}, {location.country}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="
                  rounded-full px-4
                  border-[oklch(0.85_0.025_85)]
                  text-[oklch(0.40_0.025_80)]
                  hover:bg-[oklch(0.92_0.022_85)]
                  transition-all duration-200
                "
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}

            <Button
              className="
                flex-1 gap-2 rounded-full
                bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
                text-[oklch(0.97_0.01_85)] font-medium
                shadow-[0_4px_20px_-6px_oklch(0.45_0.13_155_/_0.5)]
                hover:shadow-[0_6px_28px_-6px_oklch(0.45_0.13_155_/_0.65)]
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200
              "
              disabled={step === 2 && submitting}
              onClick={handleNext}
            >
              {step === 2 && submitting
                ? "Setting up…"
                : step === 2
                  ? "Complete Setup"
                  : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}