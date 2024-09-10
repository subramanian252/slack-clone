import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";

function useCurrentUser() {
  const data = useQuery(api.users.get);
  const isLoading = data === undefined;

  return { data, isLoading };
}

export default useCurrentUser;
