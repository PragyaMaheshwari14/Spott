import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  //Users Table
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(), //Clerk use ID for auth
    email: v.string(),
    imageUrl: v.optional(v.string()),

    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),

    //Onboarding
    hasCompletedOnboarding: v.boolean(),

    location: v.optional(
      v.object({
        city: v.string(),
        state: v.optional(v.string()),
        country: v.string(),
      }),
    ),

    interests: v.optional(v.array(v.string())), //Min 3 Categories

    // Organizer tracking(User Subscription)
    freeEventCreated: v.number(), //Track free event limit(1 free)

    //Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_token", ["tokenIdentifier"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    slug: v.string(),

    //Organizer
    organizerId: v.id("users"),
    organizerName: v.string(),

    //Event details
    category: v.string(),
    tags: v.array(v.string()),

    // Date & Time
    startDate: v.number(),
    endDate: v.number(),
    timezone: v.string(),

    //Location
    locationType: v.union(v.literal("physical"), v.literal("online")),
    venue: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),

    //Capacity & Ticketing
    capacity: v.number(),
    ticketType: v.union(v.literal("free"), v.literal("paid")),
    ticketPrice: v.optional(v.number()),
    registrationCount: v.number(),

    //Custimization
    coverImage: v.optional(v.string()),
    themeColor: v.optional(v.string()),

    //TimeStamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organizer", ["organizerId"])
    .index("by_category", ["category"])
    .index("by_start_date", ["startDate"])
    .index("by_slug", ["slug"])
    .index("by_city_state", ["city", "state"])
    .searchIndex("search_title", { searchField: "title" }),

  registration: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),

    //Attending Info
    attendeeName: v.string(),
    attendeeEmail: v.string(),

    //Qr COde for entry
    qrCode: v.string(), //Unique ID for QR

    //Check-in
    checkedIn: v.boolean(),
    checkedInAt: v.optional(v.number()),

    //status
    status: v.union(v.literal("confirmed"), v.literal("cancelled")),

    registeredAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_qr_code", ["qrCode"]),
});
