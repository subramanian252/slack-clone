import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface Props {
  title: string;
  description: string;
}

function ConfirmDialog(
  props: Props
): [() => JSX.Element, () => Promise<unknown>] {
  const { title, description } = props;

  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () =>
    new Promise((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleCancel = () => {
    promise?.resolve(false);
    handleClose();
  };

  const handleConfirm = () => {
    promise?.resolve(true);
    handleClose();
  };

  const DialogConfirm = () => {
    return (
      <Dialog open={promise !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} variant={"destructive"}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  return [DialogConfirm, confirm];
}

export default ConfirmDialog;
