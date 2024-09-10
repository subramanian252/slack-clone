import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";

function useGetWorkspaces() {
  const data = useQuery(api.workspaces.get);
  const isLoading = data === undefined;

  return { data, isLoading };
}

export default useGetWorkspaces;
