import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

type Response = string | null;

type Options = {
  onSuccess?: (data: Response) => void;
  onError?: (err: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useGenerateUrl = () => {
  const mutation = useMutation(api.upload.generateUploadUrl);

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
    async (_values: {}, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");
        const response = await mutation();
        setData(response);
        options?.onSuccess?.(response as Response);
        return response;
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
