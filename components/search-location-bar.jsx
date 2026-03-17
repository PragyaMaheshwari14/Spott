/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { City, State } from "country-state-city";
import { Calendar, Loader2, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "./ui/input";
import { debounce } from "lodash";
import { getCategoryIcon } from "@/lib/data";
import { format } from "date-fns/format";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { createLocationSlug } from "@/lib/location-utils";

const SearchLocationBar = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);

    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");

    const { data: currentUser, isLoading } = useConvexQuery(api.users.getCurrentUser);
    const { mutate: updateLocation } = useConvexMutation(api.users.completeOnboarding);

    const { data: searchResults, isLoading: searchLoading } = useConvexQuery(
        api.search.searchEvents,
        searchQuery.trim().length >= 2 ? { query: searchQuery, limit: 5 } : "skip"
    );

    const indianStates = State.getStatesOfCountry("IN");

    const cities = useMemo(() => {
        if (!selectedState) return [];
        const state = indianStates.find((s) => s.name === selectedState);
        if (!state) return [];
        return City.getCitiesOfState("IN", state.isoCode);
    }, [selectedState, indianStates]);

    useEffect(() => {
        if (currentUser?.location) {
            setSelectedState(currentUser.location.state || "");
            setSelectedCity(currentUser.location.city || "");
        }
    }, [currentUser, isLoading]);

    const debouncedSetQuery = useRef(
        debounce((value) => setSearchQuery(value), 300)
    ).current;

    const handleSearchInput = (e) => {
        const value = e.target.value;
        debouncedSetQuery(value);
        setShowSearchResults(value.length >= 2);
    };

    const handleEventClick = (slug) => {
        setShowSearchResults(false);
        setSearchQuery("");
        router.push(`/events/${slug}`);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    });

    const handleLocationSelect = async (city, state) => {
        try {
            if (currentUser?.interests && currentUser?.location) {
                await updateLocation({
                    location: { city, state, country: "India" },
                    interests: currentUser.interests,
                });
            }
            const slug = createLocationSlug(city, state);
            router.push(`/explore/${slug}`);
        } catch (error) {
            console.error("Failed to update location", error);
        }
    };

    return (
        <div className="flex items-center w-full">
            <div className="relative flex w-full" ref={searchRef}>

                {/* ── Search input ── */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.60_0.05_150)] pointer-events-none" />
                    <Input
                        placeholder="Search events..."
                        onFocus={() => {
                            if (searchQuery.length >= 2) setShowSearchResults(true);
                        }}
                        onChange={handleSearchInput}
                        className="
                          pl-9 h-9 w-full
                          rounded-none rounded-l-full
                          bg-[oklch(0.93_0.018_85)]
                          border border-[oklch(0.85_0.025_85)]
                          border-r-0
                          text-[oklch(0.18_0.02_80)] placeholder:text-[oklch(0.65_0.025_80)]
                          focus-visible:ring-1 focus-visible:ring-[oklch(0.55_0.13_152)]
                          focus-visible:border-[oklch(0.75_0.09_150)]
                          text-sm font-light
                          transition-all duration-200
                        "
                    />
                </div>

                {/* ── Search results dropdown ── */}
                {showSearchResults && (
                    <div className="
                      absolute top-full mt-2 left-0 w-96
                      bg-[oklch(0.99_0.006_80)]
                      border border-[oklch(0.87_0.025_85)]
                      rounded-2xl shadow-[0_8px_32px_-8px_oklch(0.18_0.02_80_/_0.15)]
                      z-50 max-h-[400px] overflow-y-auto
                    ">
                        {searchLoading ? (
                            <div className="p-6 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.55_0.13_152)]" />
                            </div>
                        ) : searchResults && searchResults.length > 0 ? (
                            <div className="py-2">
                                <p className="px-4 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase text-[oklch(0.60_0.05_150)]">
                                    Results
                                </p>
                                {searchResults.map((event) => (
                                    <button
                                        key={event._id}
                                        className="
                                          w-full px-4 py-3
                                          hover:bg-[oklch(0.93_0.018_85)]
                                          text-left transition-colors duration-150
                                          first:rounded-t-2xl last:rounded-b-2xl
                                        "
                                        onClick={() => handleEventClick(event.slug)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="text-xl mt-0.5 w-8 h-8 rounded-lg bg-[oklch(0.90_0.025_82)] flex items-center justify-center shrink-0">
                                                {getCategoryIcon(event.category)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-[oklch(0.18_0.02_80)] mb-1 line-clamp-1">
                                                    {event.title}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-[oklch(0.60_0.025_80)] font-light">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-[oklch(0.55_0.13_152)]" />
                                                        {format(event.startDate, "MMM dd")}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-[oklch(0.55_0.13_152)]" />
                                                        {event.city}
                                                    </span>
                                                </div>
                                            </div>
                                            {event.ticketType === "free" && (
                                                <Badge className="text-[10px] rounded-full bg-[oklch(0.88_0.055_150)] text-[oklch(0.30_0.10_155)] border-0 px-2">
                                                    Free
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}

                {/* ── State select ── */}
                <Select
                    value={selectedState}
                    onValueChange={(value) => {
                        setSelectedState(value);
                        setSelectedCity("");
                    }}
                >
                    <SelectTrigger className="
                      w-28 h-9
                      rounded-none border-l-0
                      bg-[oklch(0.93_0.018_85)]
                      border border-[oklch(0.85_0.025_85)]
                      text-xs text-[oklch(0.40_0.025_80)] font-light
                      focus:ring-1 focus:ring-[oklch(0.55_0.13_152)]
                      hover:bg-[oklch(0.90_0.025_82)]
                      transition-colors duration-150
                    ">
                        <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[oklch(0.87_0.025_85)] bg-[oklch(0.99_0.006_80)]">
                        {indianStates.map((state) => (
                            <SelectItem key={state.isoCode} value={state.name} className="text-sm">
                                {state.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* ── City select ── */}
                <Select
                    value={selectedCity}
                    onValueChange={(value) => {
                        setSelectedCity(value);
                        if (value && selectedState) {
                            handleLocationSelect(value, selectedState);
                        }
                    }}
                    disabled={!selectedState}
                >
                    <SelectTrigger className="
                      w-28 h-9
                      rounded-none rounded-r-full border-l-0
                      bg-[oklch(0.93_0.018_85)]
                      border border-[oklch(0.85_0.025_85)]
                      text-xs text-[oklch(0.40_0.025_80)] font-light
                      focus:ring-1 focus:ring-[oklch(0.55_0.13_152)]
                      hover:bg-[oklch(0.90_0.025_82)]
                      disabled:opacity-50
                      transition-colors duration-150
                    ">
                        <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[oklch(0.87_0.025_85)] bg-[oklch(0.99_0.006_80)]">
                        {cities.map((city) => (
                            <SelectItem key={city.name} value={city.name} className="text-sm">
                                {city.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default SearchLocationBar;