import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { usePaginatedQuery, useQuery } from "convex/react";

const BATCH_SIZE = 20;

interface Props {
  id: Id<"messages">;
}

export type GetMessageReturnType =
  typeof api.messages.getmessageById._returnType;

function useGetMessage({ id }: Props) {
  const data = useQuery(api.messages.getmessageById, { id });
  const isLoading = data === undefined;

  return { data, isLoading };
}

export default useGetMessage;
