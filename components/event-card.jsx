import React from 'react'
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { getCategoryIcon, getCategoryLabel } from '@/lib/data';
import { format } from 'date-fns/format';
import { Calendar, Eye, MapPin, QrCode, Trash2, Users, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const EventCard = ({
    event,
    onClick,
    onDelete,
    variant = "grid",
    action = null,
    className = "",
}) => {

    // ── List variant ──────────────────────────────────────────
    if (variant === "list") {
        return (
            <Card
                className={`
                    py-0 group cursor-pointer
                    bg-[oklch(0.99_0.006_80)]
                    border border-[oklch(0.87_0.025_85_/_0.5)]
                    hover:border-[oklch(0.75_0.09_150_/_0.5)]
                    hover:shadow-[0_6px_28px_-8px_oklch(0.45_0.13_155_/_0.18)]
                    transition-all duration-250 rounded-2xl overflow-hidden
                    ${className}
                `}
                onClick={onClick}
            >
                <CardContent className="p-3 flex gap-3 items-start">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0 overflow-hidden relative">
                        {event.coverImage ? (
                            <Image
                                src={event.coverImage}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div
                                className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl"
                                style={{ backgroundColor: event.themeColor || "oklch(0.88 0.055 150)" }}
                            >
                                {getCategoryIcon(event.category)}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 py-0.5">
                        <h3 className="
                            font-medium text-sm text-[oklch(0.18_0.02_80)] mb-1
                            group-hover:text-[oklch(0.38_0.13_155)] transition-colors duration-200
                            line-clamp-2 leading-snug
                        ">
                            {event.title}
                        </h3>

                        <p className="text-xs text-[oklch(0.60_0.025_80)] font-light mb-1.5">
                            {format(event.startDate, "EEE, dd MMM · HH:mm")}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-[oklch(0.62_0.025_80)] font-light mb-1">
                            <MapPin className="w-3 h-3 text-[oklch(0.55_0.13_152)] shrink-0" />
                            <span className="line-clamp-1">
                                {event.locationType === "online" ? "Online Event" : event.city}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-[oklch(0.62_0.025_80)] font-light">
                            <Users className="w-3 h-3 text-[oklch(0.55_0.13_152)] shrink-0" />
                            <span>{event.registrationCount} attending</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ── Compact variant ───────────────────────────────────────
    if (variant === "compact") {
        return (
            <Card
                className={`
                    py-0 group overflow-hidden
                    bg-[oklch(0.99_0.006_80)]
                    border border-[oklch(0.87_0.025_85_/_0.5)]
                    hover:border-[oklch(0.75_0.09_150_/_0.5)]
                    hover:shadow-[0_6px_28px_-8px_oklch(0.45_0.13_155_/_0.18)]
                    transition-all duration-250 rounded-2xl
                    ${onClick ? "cursor-pointer" : ""}
                    ${className}
                `}
                onClick={onClick}
            >
                {/* Image */}
                <div className="relative h-36 overflow-hidden">
                    {event.coverImage ? (
                        <Image
                            src={event.coverImage}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center text-3xl"
                            style={{ backgroundColor: event.themeColor || "oklch(0.88 0.055 150)" }}
                        >
                            {getCategoryIcon(event.category)}
                        </div>
                    )}
                    <div className="absolute top-2.5 right-2.5">
                        <span className="
                            text-[10px] font-semibold px-2 py-1 rounded-full
                            bg-[oklch(0.99_0.006_80_/_0.92)] backdrop-blur-sm
                            text-[oklch(0.30_0.10_155)] border border-[oklch(0.87_0.025_85_/_0.5)]
                        ">
                            {event.ticketType === "free" ? "Free" : `₹${event.ticketPrice}`}
                        </span>
                    </div>
                </div>

                <CardContent className="p-3">
                    <h3 className="
                        font-medium text-sm text-[oklch(0.18_0.02_80)] mb-1.5
                        group-hover:text-[oklch(0.38_0.13_155)] transition-colors duration-200
                        line-clamp-2 leading-snug
                    ">
                        {event.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[oklch(0.62_0.025_80)] font-light">
                        <Calendar className="w-3 h-3 text-[oklch(0.55_0.13_152)] shrink-0" />
                        <span>{format(event.startDate, "dd MMM")}</span>
                        <span className="mx-1 text-[oklch(0.78_0.025_80)]">·</span>
                        <MapPin className="w-3 h-3 text-[oklch(0.55_0.13_152)] shrink-0" />
                        <span className="line-clamp-1">
                            {event.locationType === "online" ? "Online" : event.city}
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ── Grid variant (default) ────────────────────────────────
    return (
        <Card
            className={`
                overflow-hidden group pt-0
                bg-[oklch(0.99_0.006_80)]
                border border-[oklch(0.87_0.025_85_/_0.5)]
                hover:border-[oklch(0.75_0.09_150_/_0.5)]
                hover:shadow-[0_8px_36px_-10px_oklch(0.45_0.13_155_/_0.2)]
                transition-all duration-250 rounded-2xl
                ${onClick ? "cursor-pointer" : ""}
                ${className}
            `}
            onClick={onClick}
        >
            {/* Cover image */}
            <div className="relative h-44 sm:h-48 overflow-hidden">
                {event.coverImage ? (
                    <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center text-4xl"
                        style={{ backgroundColor: event.themeColor || "oklch(0.88 0.055 150)" }}
                    >
                        {getCategoryIcon(event.category)}
                    </div>
                )}

                {/* Ticket type badge */}
                <div className="absolute top-3 right-3">
                    <span className="
                        text-[10px] font-semibold px-2.5 py-1 rounded-full
                        bg-[oklch(0.99_0.006_80_/_0.92)] backdrop-blur-sm
                        text-[oklch(0.30_0.10_155)] border border-[oklch(0.87_0.025_85_/_0.5)]
                    ">
                        {event.ticketType === "free" ? "Free" : `₹${event.ticketPrice}`}
                    </span>
                </div>
            </div>

            <CardContent className="p-4 space-y-3">
                {/* Category + title */}
                <div>
                    <span className="
                        inline-flex items-center gap-1.5
                        text-[10px] font-medium uppercase tracking-wide
                        px-2.5 py-1 rounded-full mb-2
                        bg-[oklch(0.88_0.055_150_/_0.6)] text-[oklch(0.30_0.10_155)]
                        border border-[oklch(0.75_0.09_150_/_0.3)]
                    ">
                        {getCategoryIcon(event.category)}{" "}
                        {getCategoryLabel(event.category)}
                    </span>
                    <h3 className="
                        font-display text-base sm:text-lg text-[oklch(0.18_0.02_80)]
                        group-hover:text-[oklch(0.35_0.13_155)] transition-colors duration-200
                        line-clamp-2 leading-snug
                    ">
                        {event.title}
                    </h3>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 text-xs text-[oklch(0.55_0.025_80)] font-light">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[oklch(0.55_0.13_152)] shrink-0" />
                        <span>{format(event.startDate, "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[oklch(0.55_0.13_152)] shrink-0" />
                        <span className="line-clamp-1">
                            {event.locationType === "online"
                                ? "Online Event"
                                : `${event.city}${event.state ? `, ${event.state}` : ""}`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[oklch(0.55_0.13_152)] shrink-0" />
                        <span>
                            {event.registrationCount}
                            <span className="text-[oklch(0.70_0.020_80)]"> / {event.capacity}</span> registered
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                {action && (
                    <div className="flex gap-2 pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="
                                flex-1 gap-1.5 rounded-xl text-xs font-medium
                                border-[oklch(0.85_0.025_85)] text-[oklch(0.35_0.08_155)]
                                hover:bg-[oklch(0.88_0.055_150_/_0.5)]
                                hover:border-[oklch(0.75_0.09_150_/_0.5)]
                                transition-all duration-200
                            "
                            onClick={(e) => {
                                e.stopPropagation();
                                onClick?.(e);
                            }}
                        >
                            {action === "event" ? (
                                <><Eye className="w-3.5 h-3.5" /> View</>
                            ) : (
                                <><QrCode className="w-3.5 h-3.5" /> Show Ticket</>
                            )}
                        </Button>

                        {onDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(event._id);
                                }}
                                className="
                                    rounded-xl gap-1.5 text-xs
                                    border-[oklch(0.85_0.025_85)]
                                    text-[oklch(0.55_0.18_28)]
                                    hover:bg-[oklch(0.97_0.03_28_/_0.4)]
                                    hover:border-[oklch(0.75_0.12_28_/_0.4)]
                                    transition-all duration-200
                                "
                            >
                                {action === "event"
                                    ? <Trash2 className="w-3.5 h-3.5" />
                                    : <X className="w-3.5 h-3.5" />
                                }
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default EventCard;