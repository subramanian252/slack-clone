import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateWorkSpaceModel } from "../store/use-create-workspace-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkSpace } from "../api/use-create-workspace";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {}

function CreateWorkSpaceModel(props: Props) {
  const {} = props;

  const [open, setOpen] = useCreateWorkSpaceModel();

  const [name, setName] = useState("");

  const { data, mutate, isPending } = useCreateWorkSpace();

  const router = useRouter();

  const handleClose = () => {
    setOpen(false);

    setName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { name },
      {
        onSuccess: (data) => {
          router.push(`/workspaces/${data}`);
          toast.success("Workspace created");
          handleClose();
        },
        onError: (err) => {
          console.log(err);
        },
        onSettled: () => {},
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a WorkSpace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name eg. Work, Class, etc."
            required
            disabled={isPending}
            minLength={3}
          />
          <div className="flex justify-end">
            <Button disabled={isPending} variant="default" type="submit">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorkSpaceModel;
