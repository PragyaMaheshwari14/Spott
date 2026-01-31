import { mutation, query } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import {v} from "convex/values";

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    // Note: If you don't want to define an index right away, you can use
    // ctx.db.query("users")
    //  .filter(q => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    //  .unique();
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user !== null) {
      // If we've seen this identity before but the name has changed, patch the value.
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, {
          name: identity.name,
          updatedAt: Date.now(), 
        });
      }
      return user._id;
    }
    // If it's a new identity, create a new `User`.
    return await ctx.db.insert("users", {
      name: identity.name ?? "Anonymous",
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email ?? "",
      imageUrl: identity.pictureUrl,
      // ✅ DEFAULT ROLE
       role: "user",
      hasCompletedOnboarding: false,
      freeEventCreated: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});


// export const getCurrentUser =  query({
//     handler: async(ctx) => {
//       const identity = await ctx.auth.getUserIdentity();

//       if(!identity){
//         return null;
//       }

//       const user = await ctx.db
//       .query("users")
//       .withIndex("by_token", (q)=>
//         q.eq("tokenIdentifier", identity.tokenIdentifier)
//       ) 
//       .unique();

//     if(!user) {
//       throw new Error("User not found");
//     }
//     return user;
//   },
// });

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    return user ?? null;
  },
});


export const completeOnboarding = mutation({
  args: {
    location: v.object({
      city: v.string(),
      state: v.optional(v.string()),
      country: v.string(),
    }),
    interests: v.array(v.string()),  //Min 3 categories
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      location: args.location,
      interests: args.interests,
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    });

    return user._id;
  },
});

export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", q =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    // 🔐 ONLY ADMINS CAN CHANGE ROLES
    if (currentUser.role !== "admin") {
      throw new Error("Only admins can change user roles");
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const bootstrapAdmin = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
