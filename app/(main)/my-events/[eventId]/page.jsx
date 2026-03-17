"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { getCategoryIcon, getCategoryLabel } from "@/lib/data";
import { format } from "date-fns/format";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Loader2,
  MapPin,
  QrCode,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import { notFound, useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import AttendeeCard from "./_components/attendee-card";
import QRScannerModal from "./_components/qr-scanner-modal";

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, iconColor, value, label }) => (
  <Card className="py-0 bg-[oklch(0.99_0.006_80)] border border-[oklch(0.87_0.025_85_/_0.5)] rounded-2xl hover:border-[oklch(0.75_0.09_150_/_0.4)] hover:shadow-[0_4px_20px_-8px_oklch(0.45_0.13_155_/_0.12)] transition-all duration-200">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="font-display text-2xl text-[oklch(0.18_0.02_80)] leading-none mb-1">{value}</p>
        <p className="text-xs text-[oklch(0.60_0.025_80)] font-light">{label}</p>
      </div>
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────────────────────
const EventDashboard = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);

  const { data: dashboardData, isLoading } = useConvexQuery(
    api.dashboard.getEventDashboard,
    { eventId }
  );

  const { data: registration, isLoading: loadingRegistrations } =
    useConvexQuery(api.registration.getEventRegistrations, { eventId });

  /* ── Loading ── */
  if (isLoading || loadingRegistrations) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-[oklch(0.45_0.13_155)]" />
          </div>
          <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) notFound();

  const { event, stats } = dashboardData;

  /* ── Filter registrations ── */
  const filteredRegistrations = registration.filter((reg) => {
    const matchesSearch =
      reg.attendeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.attendeeEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.qrCode.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === "all") return matchesSearch && reg.status === "confirmed";
    if (activeTab === "checked-in") return matchesSearch && reg.checkedIn && reg.status === "confirmed";
    if (activeTab === "pending") return matchesSearch && !reg.checkedIn && reg.status === "confirmed";
    return matchesSearch;
  });

  /* ── CSV export ── */
  const handleExportCSV = () => {
    if (!registration || registration.length === 0) {
      toast.error("No registrations to export");
      return;
    }
    const csvContent = [
      ["Name", "Email", "Registered At", "Checked In", "Checked At", "QR Code"],
      ...registration.map((reg) => [
        reg.attendeeName,
        reg.attendeeEmail,
        new Date(reg.registeredAt).toLocaleString(),
        reg.checkedIn ? "Yes" : "No",
        reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleString() : "-",
        reg.qrCode,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title || "event"}_registrations.csv`;
    a.click();
    toast.success("CSV exported successfully");
  };

  /* ── Capacity fill % ── */
  const capacityPct = Math.min(
    Math.round((stats.totalRegistrations / stats.capacity) * 100),
    100
  );

  return (
    <div className="min-h-screen pb-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Back button ── */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/my-events")}
            className="flex items-center gap-2 text-sm text-[oklch(0.55_0.025_80)] hover:text-[oklch(0.45_0.13_155)] font-light transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to My Events
          </button>
        </div>

        {/* ── Cover image ── */}
        {event.coverImage && (
          <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden mb-8 shadow-[0_8px_40px_-12px_oklch(0.18_0.02_80_/_0.2)]">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay at bottom for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[oklch(0.10_0.01_80_/_0.5)] to-transparent" />
          </div>
        )}

        {/* ── Event header ── */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
              <span className="text-[10px] tracking-[0.18em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
                Event Dashboard
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-[oklch(0.18_0.02_80)] leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="text-xs rounded-full bg-[oklch(0.88_0.055_150)] text-[oklch(0.30_0.10_155)] border-0 px-3 py-1">
                {getCategoryIcon(event.category)}&nbsp;{getCategoryLabel(event.category)}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-[oklch(0.55_0.025_80)] font-light">
                <Calendar className="w-3.5 h-3.5 text-[oklch(0.55_0.13_152)]" />
                <span>{format(event.startDate, "PPP")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[oklch(0.55_0.025_80)] font-light">
                <MapPin className="w-3.5 h-3.5 text-[oklch(0.55_0.13_152)]" />
                <span>{`${event.city}, ${event.state || event.country}`}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/events/${event.slug}`)}
            className="
              shrink-0 rounded-full gap-2 text-xs font-medium
              border-[oklch(0.80_0.06_150_/_0.5)]
              text-[oklch(0.35_0.10_155)]
              hover:bg-[oklch(0.88_0.055_150)]
              hover:border-[oklch(0.65_0.09_150)]
              transition-all duration-200
            "
          >
            <Eye className="w-3.5 h-3.5" />
            View Public Page
          </Button>
        </div>

        {/* ── QR scan CTA — only on event day ── */}
        {stats.isEventToday && !stats.isEventPast && (
          <button
            onClick={() => setShowQRScanner(true)}
            className="
              w-full mb-8 py-4 rounded-2xl flex items-center justify-center gap-3
              bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)]
              text-[oklch(0.97_0.01_85)] font-medium text-base
              shadow-[0_6px_28px_-8px_oklch(0.45_0.13_155_/_0.5)]
              hover:shadow-[0_8px_36px_-8px_oklch(0.45_0.13_155_/_0.65)]
              hover:scale-[1.005] transition-all duration-200
            "
          >
            <QrCode className="w-5 h-5" />
            Scan QR Code to Check-In Attendees
          </button>
        )}

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {/* Capacity with fill bar */}
          <Card className="py-0 col-span-2 md:col-span-1 bg-[oklch(0.99_0.006_80)] border border-[oklch(0.87_0.025_85_/_0.5)] rounded-2xl hover:border-[oklch(0.75_0.09_150_/_0.4)] transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[oklch(0.38_0.11_155)]" />
                </div>
                <div>
                  <p className="font-display text-2xl text-[oklch(0.18_0.02_80)] leading-none mb-0.5">
                    {stats.totalRegistrations}
                    <span className="text-base text-[oklch(0.65_0.025_80)] font-sans font-light">
                      /{stats.capacity}
                    </span>
                  </p>
                  <p className="text-xs text-[oklch(0.60_0.025_80)] font-light">Capacity</p>
                </div>
              </div>
              {/* Capacity bar */}
              <div className="h-1.5 rounded-full bg-[oklch(0.90_0.025_82)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[oklch(0.55_0.13_152)] transition-all duration-500"
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
              <p className="text-[10px] text-[oklch(0.65_0.025_80)] font-light mt-1">{capacityPct}% filled</p>
            </CardContent>
          </Card>

          <StatCard
            icon={CheckCircle}
            iconBg="bg-[oklch(0.88_0.055_150)]"
            iconColor="text-[oklch(0.38_0.11_155)]"
            value={stats.checkedInCount}
            label="Checked In"
          />

          {event.ticketType === "paid" ? (
            <StatCard
              icon={TrendingUp}
              iconBg="bg-[oklch(0.93_0.018_85)]"
              iconColor="text-[oklch(0.45_0.13_155)]"
              value={`₹${stats.totalRevenue}`}
              label="Revenue"
            />
          ) : (
            <StatCard
              icon={TrendingUp}
              iconBg="bg-[oklch(0.93_0.018_85)]"
              iconColor="text-[oklch(0.45_0.13_155)]"
              value={`${stats.checkIRate}%`}
              label="Check-in Rate"
            />
          )}

          <StatCard
            icon={Clock}
            iconBg="bg-[oklch(0.95_0.03_85)]"
            iconColor="text-[oklch(0.55_0.06_80)]"
            value={
              stats.isEventPast
                ? "Ended"
                : stats.hoursUntilEvent > 24
                  ? `${Math.floor(stats.hoursUntilEvent / 24)}d`
                  : `${stats.hoursUntilEvent}h`
            }
            label={stats.isEventPast ? "Event Over" : "Time Left"}
          />
        </div>

        {/* ── Attendee management ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
            <h2 className="font-display text-2xl text-[oklch(0.18_0.02_80)]">
              Attendee Management
            </h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tab list */}
            <TabsList className="
              bg-[oklch(0.93_0.018_85)] rounded-xl p-1 gap-1 mb-5
              border border-[oklch(0.87_0.025_85_/_0.4)]
            ">
              {[
                { value: "all",        label: "All",       count: stats.totalRegistrations },
                { value: "checked-in", label: "Checked In", count: stats.checkedInCount },
                { value: "pending",    label: "Pending",   count: stats.pendingCount },
              ].map(({ value, label, count }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="
                    rounded-lg text-xs font-medium px-4 py-2
                    text-[oklch(0.55_0.025_80)]
                    data-[state=active]:bg-[oklch(0.99_0.006_80)]
                    data-[state=active]:text-[oklch(0.35_0.10_155)]
                    data-[state=active]:shadow-sm
                    transition-all duration-150
                  "
                >
                  {label}
                  <span className="
                    ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full
                    bg-[oklch(0.88_0.055_150_/_0.6)] text-[oklch(0.38_0.10_155)]
                  ">
                    {count}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Search + Export */}
            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.60_0.05_150)] pointer-events-none" />
                <Input
                  placeholder="Search by name, email, or QR code…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    pl-9 h-10 rounded-xl
                    bg-[oklch(0.97_0.012_85)]
                    border border-[oklch(0.85_0.025_85)]
                    text-[oklch(0.18_0.02_80)] placeholder:text-[oklch(0.65_0.025_80)] placeholder:font-light
                    focus-visible:ring-1 focus-visible:ring-[oklch(0.55_0.13_152)]
                    focus-visible:border-[oklch(0.75_0.09_150)]
                    text-sm transition-all duration-200
                  "
                />
              </div>

              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="
                  h-10 rounded-xl gap-2 text-xs font-medium shrink-0
                  border-[oklch(0.80_0.06_150_/_0.5)]
                  text-[oklch(0.35_0.10_155)]
                  hover:bg-[oklch(0.88_0.055_150)]
                  hover:border-[oklch(0.65_0.09_150)]
                  transition-all duration-200
                "
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            </div>

            {/* Attendee list */}
            <TabsContent value={activeTab} className="space-y-3 mt-0">
              {filteredRegistrations && filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg) => (
                  <AttendeeCard key={reg._id} registration={reg} />
                ))
              ) : (
                <div className="
                  rounded-2xl border border-dashed border-[oklch(0.82_0.045_150)]
                  bg-[oklch(0.97_0.012_85)] py-14 text-center
                ">
                  <p className="text-sm text-[oklch(0.60_0.025_80)] font-light">
                    {searchQuery ? "No attendees match your search" : "No attendees in this category"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
};

export default EventDashboard;