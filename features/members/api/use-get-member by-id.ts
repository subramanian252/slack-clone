import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

function useGetMemberById(id: Id<"members">) {
  const data = useQuery(api.members.getMemberById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
}

export default useGetMemberById;
