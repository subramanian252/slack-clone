import useGetMember from "@/features/members/api/use-get-member";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import {
  AlertTriangle,
  HashIcon,
  Loader2,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";
import React from "react";
import WorkSpaceHeader from "./workspace-header";
import SideBarItem from "./sidebar-item";
import useGetChannels from "@/features/channels/api/use-get-channels";
import WorkspaceSection from "./workspace-section";
import useGetMembers from "@/features/members/api/use-get-members";
import UserItem from "./user-item";
import { useCreateChannelModel } from "@/features/channels/store/use-create-channel-modal";
import useChannelId from "@/hooks/use-channel-id";
import useMemberId from "@/hooks/use-member-id";

interface Props {}

function WorkSpaceSideBar(props: Props) {
  const {} = props;

  const workspaceId = useWorkSpaceId();

  const workspace = useGetWorkspace(workspaceId);

  const channelId = useChannelId();

  const memberId = useMemberId();

  const [open, setOpen] = useCreateChannelModel();

  const { data: member, isLoading } = useGetMember(workspaceId);

  const { data: channels, isLoading: isChannelLoading } =
    useGetChannels(workspaceId);

  const { data: members, isLoading: isMembersLoading } =
    useGetMembers(workspaceId);

  if (isLoading || workspace.isLoading) {
    return (
      <div className="h-full flex bg-[#5e2c5f] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!member || !workspace.data) {
    return (
      <div className="h-full flex gap-x-2 bg-[#5e2c5f] items-center justify-center">
        <AlertTriangle className="size-5  text-white" />
        <span className="text-white capitalize">no data found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <WorkSpaceHeader
        workspace={workspace.data}
        isAdmin={member.role === "admin"}
      />
      <div className="flex flex-col px-2 mt-3">
        <SideBarItem label="Threads" icon={MessageSquareText} id="threads" />
        <SideBarItem label="Drafts & Sent" icon={SendHorizonal} id="threads" />
      </div>
      <WorkspaceSection
        label="Channels"
        hint="Add Channel"
        onNew={() => {
          if (member.role === "admin") setOpen(true);
        }}
      >
        {channels?.map((channel) => (
          <SideBarItem
            key={channel._id}
            label={channel.name}
            icon={HashIcon}
            id={channel._id}
            variant={channelId === channel._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
      <WorkspaceSection label="Direct Messsages" hint="Select a member">
        {members?.map((member) => (
          <UserItem
            key={member._id}
            id={member._id}
            label={member.user.name}
            image={member.user.image}
            variant={member._id === memberId ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
}

export default WorkSpaceSideBar;
