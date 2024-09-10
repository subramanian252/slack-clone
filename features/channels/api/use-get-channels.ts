import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

function useGetChannels(id: Id<"workspaces">) {
  const data = useQuery(api.channels.getChannels, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
}

export default useGetChannels;
