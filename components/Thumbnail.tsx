import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

interface Props {
  url: string | null | undefined;
}

function Thumbnail(props: Props) {
  const {} = props;

  if (!props.url) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative overflow-hidden max-w-[360px] border rounded-lg my-2 cursor-pointer">
          <img
            src={props.url}
            alt="message"
            className="w-full rounded-md object-cover"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none">
        <img
          src={props.url}
          alt="message"
          className="w-full rounded-md object-cover"
        />
      </DialogContent>
    </Dialog>
  );
}

export default Thumbnail;
