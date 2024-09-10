import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

function useWorkSpaceId() {
  const params = useParams();

  return params.workspaceid as Id<"workspaces">;
}

export default useWorkSpaceId;
