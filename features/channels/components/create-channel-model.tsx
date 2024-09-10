import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateChannelModel } from "../store/use-create-channel-modal";
import { useCreateWorkSpace } from "@/features/workspaces/api/use-create-workspace";
import { useCreateChannel } from "../api/use-create-workspace";
import useWorkSpaceId from "@/hooks/use-workspace-id";

interface Props {}

function CreateChannelModel(props: Props) {
  const {} = props;

  const workSpaceId = useWorkSpaceId();

  const [open, setOpen] = useCreateChannelModel();

  const [name, setName] = useState("");

  const { data, mutate, isPending } = useCreateChannel();

  const router = useRouter();

  const handleClose = () => {
    setOpen(false);

    setName("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-");
    setName(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { name, id: workSpaceId },
      {
        onSuccess: (data) => {
          router.push(`/workspaces/${workSpaceId}/channel/${data}`);
          toast.success("Channel created");

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
          <DialogTitle>Create a Channel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            autoFocus
            value={name}
            onChange={handleChange}
            placeholder="Enter Channel name"
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

export default CreateChannelModel;
