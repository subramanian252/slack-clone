import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

function useGetChannel(id: Id<"channels">) {
  const data = useQuery(api.channels.getChannelById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
}

export default useGetChannel;
