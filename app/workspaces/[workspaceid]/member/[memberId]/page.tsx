"use client";

import { useCreateOrGetConversations } from "@/features/conversations/api/use-create-get-conversations";
import useMemberId from "@/hooks/use-member-id";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import Conversations from "./_components/conversations";

interface Props {}

function Page(props: Props) {
  const {} = props;

  const memberId = useMemberId();

  const workspaceId = useWorkSpaceId();

  const { data, mutate, isPending } = useCreateOrGetConversations();

  useEffect(() => {
    mutate({ workspaceId, memberId });
  }, [memberId, workspaceId, mutate]);

  if (isPending) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-[#5e2c5f]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <AlertTriangle className="size-5  text-[#5e2c5f]" />
        <p>Could not find member</p>
      </div>
    );
  }

  return (
    <>
      <Conversations id={data._id} />
    </>
  );
}

export default Page;
