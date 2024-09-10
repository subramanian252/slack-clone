import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

type Request = {
  workspaceId: Id<"workspaces">;
  memberId: Id<"members">;
};
type Response = Doc<"conversations">;

type Options = {
  onSuccess?: (data: Response) => void;
  onError?: (err: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useCreateOrGetConversations = () => {
  const mutation = useMutation(api.conversations.createOrGetConversations);

  const [data, setData] = useState<Response | null>(null);

  const [error, setError] = useState<Error | null>(null);

  const [status, setStatus] = useState<
    "error" | "pending" | "settled" | "" | "success"
  >("");

  const isPending = useMemo(() => status === "pending", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isSettled = useMemo(() => status !== "settled", [status]);

  const mutate = useCallback(
    async (values: Request, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");
        const response = await mutation(values);
        setData(response);
        options?.onSuccess?.(response as Response);
      } catch (err) {
        setStatus("error");

        setError(err as Error);
        options?.onError?.(err as Error);
        if (options?.throwError) throw err;
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return {
    mutate,
    data,
    error,
    status,
    isPending,
    isError,
    isSuccess,
    isSettled,
  };
};
