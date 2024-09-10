import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

function useChannelId() {
  const params = useParams();

  return params.channelId as Id<"channels">;
}

export default useChannelId;
