import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

function useGetWorkspaceInfo(id: Id<"workspaces">) {
  const data = useQuery(api.workspaces.getInfobyId, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
}

export default useGetWorkspaceInfo;
