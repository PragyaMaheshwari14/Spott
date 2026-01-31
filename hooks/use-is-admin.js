"use client";

import { api } from "@/convex/_generated/api";
import { useConvexQuery } from "@/hooks/use-convex-query";

export function useIsAdmin() {
  const { data: user, isLoading } = useConvexQuery(api.users.getCurrentUser);

  return {
    isAdmin: user?.role === "admin",
    isLoading,
    user,
  };
}
