import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

function useMemberId() {
  const params = useParams();

  return params.memberId as Id<"members">;
}

export default useMemberId;
