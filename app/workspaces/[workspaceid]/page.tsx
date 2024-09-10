"use client";

import useGetChannels from "@/features/channels/api/use-get-channels";
import { useCreateChannelModel } from "@/features/channels/store/use-create-channel-modal";
import useGetMember from "@/features/members/api/use-get-member";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { Loader2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

interface Props {
  params: { workspaceid: string };
}

function Page(props: Props) {
  const workspaceId = useWorkSpaceId();

  const { data: workspace, isLoading: workspaceLoading } =
    useGetWorkspace(workspaceId);

  const { data: channels, isLoading: isChannelLoading } =
    useGetChannels(workspaceId);

  const { data: member, isLoading: memberLoading } = useGetMember(workspaceId);

  const router = useRouter();

  const [open, setOpen] = useCreateChannelModel();

  const channelId = useMemo(() => {
    return channels?.[0]?._id;
  }, [channels]);

  const isAdmin = useMemo(() => {
    return member?.role === "admin";
  }, [member]);

  useEffect(() => {
    if (
      workspaceLoading ||
      isChannelLoading ||
      !workspace ||
      memberLoading ||
      !member
    ) {
      return;
    }

    if (channelId) {
      router.push(`/workspaces/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [
    workspaceLoading,
    isChannelLoading,
    workspace,
    channelId,
    router,
    open,
    setOpen,
    member,
    workspaceId,
    memberLoading,
    isAdmin,
  ]);

  if (workspaceLoading || isChannelLoading || memberLoading) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-[#5e2c5f]" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="size-5  text-[#5e2c5f]" />
        <p>No workspace Found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
      <TriangleAlert className="size-5  text-[#5e2c5f]" />
      <p>No Channel Found</p>
    </div>
  );
}

export default Page;
