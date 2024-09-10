import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useGetWorkspace from "@/features/workspaces/api/use-get-workspace";
import useGetWorkspaces from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkSpaceModel } from "@/features/workspaces/store/use-create-workspace-modal";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface Props {}

function WorkSpaceSwitcher(props: Props) {
  const {} = props;

  const router = useRouter();

  const workspaceId = useWorkSpaceId();

  const [_open, setOpen] = useCreateWorkSpaceModel();

  const { data: workspace, isLoading: loadingWorkspace } =
    useGetWorkspace(workspaceId);

  const { data: workspaces, isLoading: loadingWorkspaces } = useGetWorkspaces();

  const filteredWorkSpaces = workspaces?.filter((w) => w._id !== workspaceId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm" asChild>
        <Button className="size-9 overflow-hidden bg-[#ababad] hover:bg-[#ababad]/25 text-slate-800 font-semibold text-lg">
          {loadingWorkspace ? (
            <Loader className="size-5 animate-spin shrink-0" />
          ) : (
            workspace?.name.charAt(0).toUpperCase()
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-64">
        <DropdownMenuItem
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
          className="cursor-pointer flex-col justify-start items-start capitalize"
        >
          {workspace?.name}
          <span className="text-xs">Active WorkSpace</span>
        </DropdownMenuItem>
        {loadingWorkspaces ? (
          <DropdownMenuItem>
            <Loader className="size-5 animate-spin shrink-0" />
          </DropdownMenuItem>
        ) : (
          filteredWorkSpaces?.map((workspace) => (
            <DropdownMenuItem
              key={workspace._id}
              className="capitalize cursor-pointer overflow-hidden"
              onClick={() => {
                router.push(`/workspaces/${workspace._id}`);
              }}
            >
              <div className="shrink-0 size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-lg rounded-md flex items-center justify-center mr-2">
                {workspace?.name.charAt(0).toUpperCase()}
              </div>
              <p className="truncate">{workspace.name}</p>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuItem
          onClick={() => setOpen(true)}
          className="cursor-pointer"
        >
          <div className="size-9 relative overflow-hidden bg-[#f2f2f2] text-slate-800 font-semibold text-lg rounded-md flex items-center justify-center mr-2">
            <Plus className="size-5 shrink-0" />
          </div>
          <span className="text-sm">New Workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WorkSpaceSwitcher;
