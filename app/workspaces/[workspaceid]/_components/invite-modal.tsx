import confirmDialog from "@/components/confirmDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateJoinCode } from "@/features/workspaces/api/use-update-joincode";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { CopyIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  joinCode: string;
}

function InviteModal(props: Props) {
  const { open, setOpen, name, joinCode } = props;

  const workspaceId = useWorkSpaceId();

  const [DialogConfirm, confirm] = confirmDialog({
    title: "Create new code",
    description: "Are you sure you want to create a new code?",
  });

  const { mutate, isPending } = useUpdateJoinCode();

  const handleClick = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await confirm();
    if (!ok) return;
    mutate(
      { id: workspaceId },
      {
        onSuccess: () => {
          toast.success("new code generated");
        },
      }
    );
  };

  return (
    <>
      <DialogConfirm />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white/95">
          <DialogHeader>
            <DialogTitle>Invite people to your {name}</DialogTitle>
            <DialogDescription>
              Use the code below to invite people to your workspace
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col py-8 justify-center items-center">
            <span className="text-4xl font-bold tracking-widest uppercase">
              {joinCode}
            </span>
            <Button
              variant="ghost"
              className="mt-6"
              size={"sm"}
              onClick={() => {
                const link = `${window.location.origin}/workspaces/join/${workspaceId}`;
                navigator.clipboard.writeText(link).then(() => {
                  toast.success("Link copied to clipboard");
                });
              }}
            >
              <CopyIcon className="w-5 h-5" />
              <span className="ml-2">Copy</span>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Button
              disabled={isPending}
              onClick={handleClick}
              variant={"default"}
            >
              New Code
            </Button>
            <DialogClose asChild>
              <Button disabled={isPending} variant="ghost">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InviteModal;
