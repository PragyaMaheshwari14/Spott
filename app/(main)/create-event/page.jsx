"use client";
import { api } from "@/convex/_generated/api";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { City, State } from "country-state-city";
import Image from "next/image";
import { UnslpashImagePicker } from "@/components/unslpash-image-picker";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  Clock,
  ImagePlus,
  Loader2,
  MapPin,
  Tag,
  Ticket,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns/format";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/data";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useIsAdmin } from "@/hooks/use-is-admin";

// HH:MM in 24 hr
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characaters long"),
  category: z.string().min(1, "Please select a category"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  startTime: z.string().regex(timeRegex, "Start time must be HH:MM"),
  endTime: z.string().regex(timeRegex, "End time must be HH:MM"),
  locationType: z.enum(["physical", "online"]).default("physical"),
  venue: z.string().url("Mus be a valid url").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().min(1, "City is reuired"),
  state: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  ticketType: z.enum(["free", "paid"]).default("free"),
  ticketPrice: z.number().optional(),
  coverImage: z.string().optional(),
  themeColor: z.string().default("#1e3a8a"),
});

// ── Section wrapper ───────────────────────────────────────────
const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-[oklch(0.38_0.11_155)]" />
      </div>
      <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[oklch(0.50_0.04_150)]">
        {title}
      </span>
    </div>
    {children}
  </div>
);

// ── Field error ───────────────────────────────────────────────
const FieldError = ({ message }) =>
  message ? (
    <p className="text-xs text-[oklch(0.55_0.18_28)] mt-1 flex items-center gap-1">
      <span>⚠</span> {message}
    </p>
  ) : null;

// ── Shared class strings ──────────────────────────────────────
const inputCls =
  "h-10 rounded-xl bg-[oklch(0.97_0.012_85)] border border-[oklch(0.85_0.025_85)] " +
  "text-[oklch(0.18_0.02_80)] placeholder:text-[oklch(0.65_0.025_80)] placeholder:font-light " +
  "focus-visible:ring-1 focus-visible:ring-[oklch(0.55_0.13_152)] focus-visible:border-[oklch(0.75_0.09_150)] " +
  "text-sm transition-all duration-200";

const selectTriggerCls =
  "h-10 rounded-xl w-full bg-[oklch(0.97_0.012_85)] border border-[oklch(0.85_0.025_85)] " +
  "text-sm text-[oklch(0.18_0.02_80)] focus:ring-1 focus:ring-[oklch(0.55_0.13_152)] disabled:opacity-50";

const selectContentCls =
  "rounded-xl border-[oklch(0.87_0.025_85)] bg-[oklch(0.99_0.006_80)]";

const CreateEvent = () => {
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const [showImagePicker, setShowImagePicker] = useState(false);

  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { mutate: createEvent, isLoading: isCreatingEvent } = useConvexMutation(
    api.events.createEvent,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      locationType: "physical",
      ticketType: "free",
      capacity: 50,
      themeColor: "#121212",
      category: "",
      state: "",
      city: "",
      startTime: "",
      endTime: "",
    },
  });

  const themeColor = watch("themeColor");
  const ticketType = watch("ticketType");
  const selectedState = watch("state");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const coverImage = watch("coverImage");

  const indianStates = State.getStatesOfCountry("IN");

  const cities = useMemo(() => {
    if (!selectedState) return [];
    const st = indianStates.find((s) => s.name === selectedState);
    if (!st) return [];
    return City.getCitiesOfState("IN", st.isoCode);
  }, [selectedState, indianStates]);

  //Color presets = show all for Pro, only default for free

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hh, mm, 0, 0);
    return d;
  };

  const onSubmit = async (data) => {
    try {
      const start = combineDateTime(data.startDate, data.startTime);
      const end = combineDateTime(data.endDate, data.endTime);

      if (!start || !end) {
        toast.error("Please select both date and time for start and end");
        return;
      }

      if (end.getTime() <= start.getTime()) {
        toast.error("End date/time must be after start date/time");
        return;
      }

      await createEvent({
        title: data.title,
        description: data.description,
        category: data.category,
        tags: [data.category],
        startDate: start.getTime(),
        endDate: end.getTime(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locationType: data.locationType,
        venue: data.venue || undefined,
        city: data.city,
        state: data.state || undefined,
        country: "India",
        address: data.address || undefined,
        capacity: data.capacity,
        ticketType: data.ticketType,
        ticketPrice: data.ticketPrice || undefined,
        coverImage: data.coverImage || undefined,
        themeColor: data.themeColor,
      });

      toast.success("Event created successfully!");
      router.push("/my-events");
    } catch (error) {
      toast.error(error.message || "Failed to create event");
    }
  };

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.replace("/");
    }
  }, [isAdmin, isAdminLoading, router]);

  if (isAdminLoading) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 -mt-6 md:-mt-16 lg:-mt-5">
      {/* ── Page header ── */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.55_0.13_152)]" />
          <span className="text-[10px] tracking-[0.18em] uppercase text-[oklch(0.60_0.05_150)] font-medium">
            Spott
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-[oklch(0.18_0.02_80)] leading-tight">
          Create an Event
        </h1>
        <p className="text-sm text-[oklch(0.55_0.025_80)] font-light mt-2">
          Fill in the details below to publish your event to the community.
        </p>
      </div>

      {/* ── Two-column grid ── */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-[300px_1fr] gap-10 items-start">
        {/* ── Left: cover image (sticky) ── */}
        <div className="space-y-4 md:sticky md:top-36">
          {/* Image picker tile */}
          <div
            onClick={() => setShowImagePicker(true)}
            className={
              "w-full aspect-[4/3] md:aspect-square rounded-3xl overflow-hidden " +
              "border-2 flex flex-col items-center justify-center gap-3 " +
              "transition-all duration-300 group cursor-pointer " +
              (coverImage
                ? "border-transparent"
                : "border-dashed border-[oklch(0.82_0.045_150)] bg-[oklch(0.95_0.018_85)] " +
                  "hover:border-[oklch(0.60_0.09_152)] hover:bg-[oklch(0.92_0.025_85)]")
            }
          >
            {coverImage ? (
              <div className="relative w-full h-full">
                <Image
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  width={500}
                  height={500}
                  priority
                />
                <div className="absolute inset-0 bg-[oklch(0.18_0.02_80_/_0)] group-hover:bg-[oklch(0.18_0.02_80_/_0.35)] transition-all duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" /> Change image
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-[oklch(0.88_0.055_150)] flex items-center justify-center">
                  <ImagePlus className="w-5 h-5 text-[oklch(0.38_0.11_155)]" />
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-medium text-[oklch(0.35_0.08_155)]">
                    Add cover image
                  </p>
                  <p className="text-xs text-[oklch(0.60_0.025_80)] font-light mt-0.5">
                    Browse Unsplash
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Tips card */}
          <div className="rounded-2xl p-4 bg-[oklch(0.88_0.055_150_/_0.35)] border border-[oklch(0.80_0.06_150_/_0.3)]">
            <p className="text-[10px] font-semibold text-[oklch(0.30_0.10_155)] mb-2 uppercase tracking-widest">
              Tips
            </p>
            <ul className="text-xs text-[oklch(0.40_0.06_155)] font-light space-y-1.5 leading-relaxed">
              <li>• Use a high-quality landscape photo</li>
              <li>• Pick a cover that reflects the mood</li>
              <li>• Complete all fields for better reach</li>
            </ul>
          </div>
        </div>

        {/* ── Right: form ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Event title */}
          <div className="space-y-1">
            <Input
              {...register("title")}
              placeholder="Event Name"
              className="
                text-2xl md:text-3xl font-display font-normal
                bg-transparent border-none border-b border-[oklch(0.85_0.025_85)] rounded-none
                focus-visible:ring-0 focus-visible:border-[oklch(0.55_0.13_152)]
                px-0 py-3 h-auto
                text-[oklch(0.18_0.02_80)] placeholder:text-[oklch(0.75_0.025_80)]
                transition-colors duration-200
              "
            />
            <FieldError message={errors.title?.message} />
          </div>


          {/* ── Date & Time ── */}
          <Section icon={Clock} title="Date & Time">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Start */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[oklch(0.40_0.025_80)] uppercase tracking-wide">
                  Start
                </Label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={
                          "w-full justify-between h-10 rounded-xl font-light text-sm " +
                          "bg-[oklch(0.97_0.012_85)] border-[oklch(0.85_0.025_85)] " +
                          (startDate
                            ? "text-[oklch(0.18_0.02_80)]"
                            : "text-[oklch(0.65_0.025_80)]") +
                          " hover:bg-[oklch(0.93_0.018_85)] hover:border-[oklch(0.75_0.09_150)] transition-all duration-200"
                        }
                      >
                        {startDate ? format(startDate, "PPP") : "Pick date"}
                        <CalendarIcon className="w-3.5 h-3.5 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 rounded-2xl border-[oklch(0.87_0.025_85)]">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => setValue("startDate", date)}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    {...register("startTime")}
                    placeholder="hh:mm"
                    className={inputCls + " w-28"}
                  />
                </div>
                {(errors.startDate || errors.startTime) && (
                  <FieldError
                    message={
                      errors.startDate?.message || errors.startTime?.message
                    }
                  />
                )}
              </div>

              {/* End */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-[oklch(0.40_0.025_80)] uppercase tracking-wide">
                  End
                </Label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={
                          "w-full justify-between h-10 rounded-xl font-light text-sm " +
                          "bg-[oklch(0.97_0.012_85)] border-[oklch(0.85_0.025_85)] " +
                          (endDate
                            ? "text-[oklch(0.18_0.02_80)]"
                            : "text-[oklch(0.65_0.025_80)]") +
                          " hover:bg-[oklch(0.93_0.018_85)] hover:border-[oklch(0.75_0.09_150)] transition-all duration-200"
                        }
                      >
                        {endDate ? format(endDate, "PPP") : "Pick date"}
                        <CalendarIcon className="w-3.5 h-3.5 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 rounded-2xl border-[oklch(0.87_0.025_85)]">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => setValue("endDate", date)}
                        disabled={(date) => date < (startDate || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    {...register("endTime")}
                    placeholder="hh:mm"
                    className={inputCls + " w-28"}
                  />
                </div>
                {(errors.endDate || errors.endTime) && (
                  <FieldError
                    message={errors.endDate?.message || errors.endTime?.message}
                  />
                )}
              </div>
            </div>
          </Section>

          <div className="h-px bg-[oklch(0.90_0.020_85)]" />

          {/* ── Category ── */}
          <Section icon={Tag} title="Category">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className={selectContentCls}>
                    <SelectGroup>
                      {CATEGORIES.map((cat) => (
                        <SelectItem
                          key={cat.id}
                          value={cat.id}
                          className="text-sm"
                        >
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.category?.message} />
          </Section>

          <div className="h-px bg-[oklch(0.90_0.020_85)]" />

          {/* ── Location ── */}
          <Section icon={MapPin} title="Location">
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setValue("city", "");
                    }}
                  >
                    <SelectTrigger className={selectTriggerCls}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className={selectContentCls}>
                      <SelectGroup>
                        {indianStates.map((s) => (
                          <SelectItem
                            key={s.isoCode}
                            value={s.name}
                            className="text-sm"
                          >
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="city"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedState}
                  >
                    <SelectTrigger className={selectTriggerCls}>
                      <SelectValue
                        placeholder={
                          selectedState ? "Select City" : "Select state first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className={selectContentCls}>
                      <SelectGroup>
                        {cities.map((c) => (
                          <SelectItem
                            key={c.name}
                            value={c.name}
                            className="text-sm"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-[oklch(0.40_0.025_80)] uppercase tracking-wide">
                Venue Details
              </Label>
              <Input
                {...register("venue")}
                placeholder="Venue link (Google Maps Link)"
                type="url"
                className={inputCls}
              />
              <FieldError message={errors.venue?.message} />
              <Input
                {...register("address")}
                placeholder="Full address / street / building (optional)"
                className={inputCls}
              />
            </div>
          </Section>

          <div className="h-px bg-[oklch(0.90_0.020_85)]" />

          {/* ── Description ── */}
          <Section icon={Tag} title="Description">
            <Textarea
              {...register("description")}
              placeholder="Tell people about your events..."
              rows={5}
              className="resize-none rounded-xl bg-[oklch(0.97_0.012_85)] border border-[oklch(0.85_0.025_85)] text-[oklch(0.18_0.02_80)] placeholder:text-[oklch(0.65_0.025_80)] placeholder:font-light focus-visible:ring-1 focus-visible:ring-[oklch(0.55_0.13_152)] focus-visible:border-[oklch(0.75_0.09_150)] text-sm leading-relaxed transition-all duration-200"
            />
            <FieldError message={errors.description?.message} />
          </Section>

          <div className="h-px bg-[oklch(0.90_0.020_85)]" />

          {/* ── Tickets ── */}
          <Section icon={Ticket} title="Tickets">
            <div className="flex items-center gap-3">
              <label
                className={
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer " +
                  "border-[oklch(0.55_0.13_152)] bg-[oklch(0.88_0.055_150)] text-[oklch(0.28_0.10_155)] font-medium"
                }
              >
                <input
                  type="radio"
                  value="free"
                  {...register("ticketType")}
                  className="sr-only"
                  checked
                  readOnly
                />
                 Free
              </label>
            </div>
          </Section>

          <div className="h-px bg-[oklch(0.90_0.020_85)]" />

          {/* ── Capacity ── */}
          <Section icon={Users} title="Capacity">
            <div className="max-w-48">
              <Input
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                placeholder="Ex: 100"
                className={inputCls}
              />
            </div>
            <FieldError message={errors.capacity?.message} />
          </Section>

          {/* ── Submit ── */}
          <div className="pt-4 pb-10">
            <Button
              type="submit"
              disabled={isCreatingEvent}
              className="w-full py-5 rounded-2xl text-base font-medium gap-2 bg-[oklch(0.45_0.13_155)] hover:bg-[oklch(0.40_0.13_155)] text-[oklch(0.97_0.01_85)] shadow-[0_6px_28px_-8px_oklch(0.45_0.13_155_/_0.5)] hover:shadow-[0_8px_36px_-8px_oklch(0.45_0.13_155_/_0.65)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isCreatingEvent ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Unsplash Picker */}
      {showImagePicker && (
        <UnslpashImagePicker
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={(url) => {
            setValue("coverImage", url);
            setShowImagePicker(false);
          }}
        />
      )}
    </div>
  );
};

export default CreateEvent;
