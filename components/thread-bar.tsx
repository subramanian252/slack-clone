import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";

interface Props {
  onClick: () => void;
  count?: number;
  image?: string;
  name?: string;
  timeStamp?: number;
}

function ThreadBar(props: Props) {
  const { name = "Member", image, onClick, count, timeStamp } = props;

  if (!props.count || !timeStamp) {
    return null;
  }

  return (
    <button
      className="w-80 bg-white p-1 rounded-md border border-transparent hover:border-border flex items-center justify-start group/thread-bar"
      onClick={onClick}
    >
      <div className="flex itesm-center gap-2 overflow-hidden">
        <Avatar className="size-5 rounded-md mr-1">
          <AvatarFallback className="rounded-md bg-blue-500 text-white">
            {name?.charAt(0).toUpperCase()}
          </AvatarFallback>
          <AvatarImage src={image} className="rounded-md" />
        </Avatar>
        <span className="text-xs text-sky-700 hover:underline font-bold truncate">
          {count} {count === 1 ? "message" : "messages"}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden block">
          Last Reply {formatDistanceToNow(timeStamp, { addSuffix: true })}
        </span>
        <span className="text-xs text-muted-foreground truncate hidden group-hover/thread-bar:block">
          View Thread
        </span>
      </div>
      <ChevronRight className="size-4 ml-auto text-muted-foreground opacity-0 transition-all group-hover/thread-bar:opacity-100" />
    </button>
  );
}

export default ThreadBar;
