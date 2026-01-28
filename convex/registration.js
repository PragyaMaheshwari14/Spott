import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const generateQRCode = () => {
  return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const registerForEvent = mutation({
  args: {
    eventId: v.id("events"),
    attendeeName: v.string(),
    attendeeEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    //Check if event is full
    if (event.registrationCount >= event.capacity) {
      throw new Error("Event is full");
    }

    const existingRegistration = await ctx.db
      .query("registration")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .unique();

    if (existingRegistration) {
      if (existingRegistration.status === "confirmed") {
        throw new Error("You are already registered for this Event");
      }

      // Re-activate cancelled registration
      await ctx.db.patch(existingRegistration._id, {
        status: "confirmed",
        registeredAt: Date.now(),
        qrCode: generateQRCode(),
      });

      await ctx.db.patch(args.eventId, {
        registrationCount: event.registrationCount + 1,
      });

      return existingRegistration._id;
    }

    const qrCode = generateQRCode();
    const registrationId = await ctx.db.insert("registration", {
      eventId: args.eventId,
      userId: user._id,
      attendeeName: args.attendeeName,
      attendeeEmail: args.attendeeEmail,
      qrCode: qrCode,
      checkedIn: false,
      status: "confirmed",
      registeredAt: Date.now(),
    });

    //Update event registration Count
    await ctx.db.patch(args.eventId, {
      registrationCount: event.registrationCount + 1,
    });

    return registrationId;
  },
});

// export const checkRegistration = query({
//   args: { eventId: v.id("events") },
//   handler: async (ctx, args) => {
//     const user = await ctx.runQuery(internal.users.getCurrentUser);

//     const registration = await ctx.db
//       .query("registration")
//       .withIndex("by_event_user", (q) =>
//         q.eq("eventId", args.eventId).eq("userId", user._id)
//       )
//       .unique();

//     return registration?.status === "confirmed" ? registration : null;
//   },
// });

export const checkRegistration = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return null;
    }

    return await ctx.db
      .query("registration")
      .withIndex("by_event_user", q =>
        q.eq("eventId", args.eventId)
         .eq("userId", user._id)
      )
      .unique();
  },
});


export const getMyRegistrations = query({
  handler: async (ctx) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const registration = await ctx.db
      .query("registration")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    const registrationsWithEvents = await Promise.all(
      registration.map(async (reg) => {
        const event = await ctx.db.get(reg.eventId);
        return { ...reg, event };
      })
    );

    return registrationsWithEvents;
  },
});

export const cancelRegistration = mutation({
  args: { registrationId: v.id("registration") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const registration = await ctx.db.get(args.registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }
    if (registration.userId !== user._id) {
      throw new Error("you can only cancel your own registrations");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    //Update registration status
    await ctx.db.patch(args.registrationId, {
      status: "cancelled",
    });

    //Decrement event registartion count
    if (event.registrationCount > 0) {
      await ctx.db.patch(registration.eventId, {
        registrationCount: event.registrationCount - 1,
      });
    }
    return { success: true };
  },
});

export const checkInAttendee = mutation({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const registration = await ctx.db
      .query("registration")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique();

    if (!registration) {
      throw new Error("Invalid QR Code");
    }

    const event = await ctx.db.get(registration.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    //Check if user is the organizer
    if (event.organizerId !== user._id) {
      throw new Error("You are not authorized to check in attendees");
    }

    //Check if already checked in
    if(registration.checkedIn) {
      return {
        success: false,
        message: "Already checked in",
        registration,
      }
    }

    //Check-in
    await ctx.db.patch(registration._id , {
      checkedIn: true,
      checkedInAt: Date.now(),
    });

    return {
      success: true,
      message: "Check-in successfull",
      registration: {
        ...registration,
        checkedIn: true,
        checkedInAt: Date.now(),
      }
    }
  },
});

export const getEventRegistrations = query({
  args: {eventId: v.id("events")},
  handler: async(ctx, args) => {
    const user = await ctx.runQuery(internal.users.getCurrentUser);

    const event = await ctx.db.get(args.eventId);
    if(!event){
      throw new Error("Event not found");
    }

    //Check if user is the organizer
    if(event.organizerId !== user._id) {
      throw new Error("You are not authorized to view registration")
    }

    const registartion = await ctx.db
      .query("registration")
      .withIndex("by_event", (q)=> q.eq("eventId", args.eventId))
      .collect();

    return registartion
  },
});