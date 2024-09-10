import React, { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { Input } from "@/components/ui/input";
import useChannelId from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useDeleteChannel } from "@/features/channels/api/use-delete-channel";
import { useRouter } from "next/navigation";
import confirmDialog from "@/components/confirmDialog";
import useWorkSpaceId from "@/hooks/use-workspace-id";

interface Props {
  title: string;
}

function Header(props: Props) {
  const { title } = props;

  const [open2, setOpen2] = useState(false);

  const router = useRouter();

  const [value, setValue] = useState<string>(title);

  const channelId = useChannelId();

  const [DialogConfirm, confirm] = confirmDialog({
    title: "Remove Channel",
    description: "Are you sure you want to remove this channel?",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-");
    setValue(value);
  };

  const workSpaceId = useWorkSpaceId();

  const { mutate: updateChannel, isPending: isUpdatePending } =
    useUpdateChannel();

  const { mutate: removeChannel, isPending: isRemovePending } =
    useDeleteChannel();

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateChannel(
      { name: value, id: channelId },
      {
        onSuccess: () => {
          toast.success("channel name updated successfully");
          setOpen2(false);
        },
        onError: () => {
          toast.error("Failed to update channel name");
        },
      }
    );
  };

  const handleRemove = async () => {
    const confirmRemove = await confirm();

    if (!confirmRemove) return;
    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success("Workspace removed successfully");
          router.push(`/workspaces/${workSpaceId}`);
        },
        onError: () => {
          toast.error("Failed to remove workspace");
        },
      }
    );
  };

  return (
    <div className="bg-white h-[49px] border-b flex items-center px-4 overflow-hidden">
      <DialogConfirm />
      <Dialog>
        <DialogTrigger>
          <Button
            variant={"ghost"}
            size={"sm"}
            className="text-lg font-semibold overflow-hidden w-auto px-2"
          >
            <span># {title}</span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel Name</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-y-4">
            <Dialog open={open2} onOpenChange={setOpen2}>
              <DialogTrigger asChild>
                <div className="flex flex-row justify-between bg-white p-4 rounded-md">
                  <div className="flex flex-col items-start gap-y-1">
                    <span className="font-semibold">WorkSpace Name</span>
                    <span className="text-muted-foreground text-xs">
                      {title}
                    </span>
                  </div>
                  <p className="text-blue-500">Edit</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Channel Name</DialogTitle>
                </DialogHeader>
                <div>
                  <form onSubmit={handleEdit} className="flex flex-col gap-4">
                    <Input
                      placeholder="Enter New Workspace Name"
                      value={value}
                      onChange={handleChange}
                      disabled={isUpdatePending}
                      required
                      autoFocus
                      minLength={3}
                      maxLength={30}
                    />

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant={"outline"} disabled={isUpdatePending}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" disabled={isUpdatePending}>
                        Save
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
            <div className="bg-white p-4 rounded-md border border-rose-500">
              <button
                onClick={handleRemove}
                className="flex items-center gap-x-2 text-rose-500"
              >
                <Trash2Icon className="w-4 h-4 text-red-500" />
                Delete Channel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Header;
