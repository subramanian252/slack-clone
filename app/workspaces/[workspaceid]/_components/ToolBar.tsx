import { Button } from "@/components/ui/button";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { Info, Search } from "lucide-react";
import { useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import useGetMembers from "@/features/members/api/use-get-members";
import useGetChannels from "@/features/channels/api/use-get-channels";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

interface Props {}

function ToolBar(props: Props) {
  const {} = props;
  const workspaceId = useWorkSpaceId();

  const { data } = useGetWorkspace(workspaceId);

  const [open, setOpen] = useState(false);

  const router = useRouter();

  const { data: memberData, isLoading: isMembersLoading } =
    useGetMembers(workspaceId);
  const { data: channels, isLoading: isChannelsLoading } =
    useGetChannels(workspaceId);

  const onChannelClick = (channelId: Id<"channels">) => {
    setOpen(false);

    router.push(`/workspaces/${workspaceId}/channel/${channelId}`);
  };

  const onMemberClick = (memberId: Id<"members">) => {
    setOpen(false);

    router.push(`/workspaces/${workspaceId}/member/${memberId}`);
  };

  return (
    <div className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1" />
      <div className="min-w-[280px] max-w-[642px] shrink grow-[2]">
        <Button
          size={"sm"}
          className="bg-accent/25 hover:bg-accent-25 w-full h-7 px-2"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4 text-white mr-2" />
          <span className="text-white text-xs">search in {data?.name}</span>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Channels">
              {channels?.map((channel) => (
                <CommandItem
                  onSelect={() => onChannelClick(channel._id)}
                  key={channel._id}
                >
                  {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Members">
              {memberData?.map((member) => (
                <CommandItem
                  onSelect={() => onMemberClick(member._id)}
                  key={member._id}
                >
                  {member.user?.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
      <div className="flex-1 ml-auto flex items-center justify-end">
        <Button variant={"transparent"} size={"iconSm"}>
          <Info className="size-5 text-white" />
        </Button>
      </div>
    </div>
  );
}

export default ToolBar;
