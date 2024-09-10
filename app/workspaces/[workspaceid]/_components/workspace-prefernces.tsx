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
import { Trash2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEditWorkSpace } from "@/features/workspaces/api/use-edit-workspace";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRemoveWorkSpace } from "@/features/workspaces/api/use-delete-workspace";
import { useRouter } from "next/navigation";
import confirmDialog from "@/components/confirmDialog";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  label: string;
}

function WorkSpacePreferences(props: Props) {
  const workSpaceId = useWorkSpaceId();

  const router = useRouter();

  const { open, setOpen, label } = props;

  const [open2, setOpen2] = useState(false);

  const [value, setValue] = useState<string>(label);

  const [DialogConfirm, confirm] = confirmDialog({
    title: "Remove Workspace",
    description: "Are you sure you want to remove this workspace?",
  });

  const { mutate: updateWorkSpaceName, isPending: isUpdatePending } =
    useEditWorkSpace();

  const { mutate: removeWorkSpace, isPending: isRemovePending } =
    useRemoveWorkSpace();

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkSpaceName(
      { name: value, id: workSpaceId },
      {
        onSuccess: () => {
          toast.success("Workspace name updated successfully");
          setOpen2(false);
        },
        onError: () => {
          toast.error("Failed to update workspace name");
        },
      }
    );
  };

  const handleRemove = async () => {
    const confirmRemove = await confirm();

    if (!confirmRemove) return;
    removeWorkSpace(
      { id: workSpaceId },
      {
        onSuccess: () => {
          toast.success("Workspace removed successfully");

          setOpen(false);

          router.replace("/");
        },
        onError: () => {
          toast.error("Failed to remove workspace");
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
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-y-4">
            <Dialog open={open2} onOpenChange={setOpen2}>
              <DialogTrigger asChild>
                <div className="flex flex-row justify-between bg-white p-4 rounded-md">
                  <div className="flex flex-col items-start gap-y-1">
                    <span className="font-semibold">WorkSpace Name</span>
                    <span className="text-muted-foreground text-xs">
                      {label}
                    </span>
                  </div>
                  <p className="text-blue-500">Edit</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Workspace Name</DialogTitle>
                </DialogHeader>
                <div>
                  <form onSubmit={handleEdit} className="flex flex-col gap-4">
                    <Input
                      placeholder="Enter New Workspace Name"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
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
                Delete workspace
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default WorkSpacePreferences;
