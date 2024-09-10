import Hint from "@/components/Hint";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "@/convex/_generated/dataModel";
import { ChevronDown, ListFilter, SquarePen } from "lucide-react";
import React, { useState } from "react";
import WorkSpacePreferences from "./workspace-prefernces";
import InviteModal from "./invite-modal";

interface Props {
  workspace: Doc<"workspaces">;
  isAdmin: boolean;
}

function WorkSpaceHeader(props: Props) {
  const { workspace, isAdmin } = props;

  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between h-[49px] gap-0.5 px-4">
      <WorkSpacePreferences
        open={preferencesOpen}
        setOpen={setPreferencesOpen}
        label={workspace.name}
      />
      <InviteModal
        open={inviteModalOpen}
        setOpen={setInviteModalOpen}
        name={workspace.name}
        joinCode={workspace.joinCode}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="p-1.5 text-lg font-semibold w-auto"
            variant={"transparent"}
            size={"sm"}
          >
            <span>{workspace.name}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          className="w-64 font-medium"
        >
          <DropdownMenuItem className="cursor-pointer capitalize">
            <div className="size-9 overflow-hidden bg-[#616061] text-white rounded-md flex items-center justify-center mr-2">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-bold">{workspace.name}</p>
              <p className="text-xs text-muted-foreground">Active WorkSpace</p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isAdmin && (
            <>
              <DropdownMenuItem
                className="cursor-pointer capitalize truncate"
                onClick={() => setInviteModalOpen(true)}
              >
                Invite people to {workspace.name}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer capitalize truncate"
                onClick={() => setPreferencesOpen(true)}
              >
                Preferences
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-2">
        <Hint label="Filter" side="bottom">
          <Button variant={"transparent"} size={"iconSm"}>
            <ListFilter className="size-5" />
          </Button>
        </Hint>
        <Hint label="Edit" side="bottom">
          <Button variant={"transparent"} size={"iconSm"}>
            <SquarePen className="size-5" />
          </Button>
        </Hint>
      </div>
    </div>
  );
}

export default WorkSpaceHeader;
