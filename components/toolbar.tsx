import React from "react";
import { Button } from "./ui/button";
import { MessageSquareTextIcon, Pencil, SmileIcon, Trash } from "lucide-react";
import Hint from "./Hint";
import { EmojIPicker } from "./emoji-picker";

interface Props {
  isAuthor: boolean;
  isPending: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (e: any) => void;
  hideThreadButton?: boolean;
}

function Toolbar(props: Props) {
  const {
    isAuthor,
    isPending,
    handleEdit,
    handleThread,
    handleDelete,
    handleReaction,
    hideThreadButton,
  } = props;

  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <EmojIPicker
          hint="Reaction"
          onSelectEmoji={(emoji) => handleReaction(emoji)}
        >
          <Button variant={"ghost"} disabled={isPending} size={"iconSm"}>
            <SmileIcon className="size-4" />
          </Button>
        </EmojIPicker>
        {!hideThreadButton && (
          <Hint label="Reply in thread">
            <Button
              onClick={handleThread}
              variant={"ghost"}
              disabled={isPending}
              size={"iconSm"}
            >
              <MessageSquareTextIcon className="size-4" />
            </Button>
          </Hint>
        )}
        {isAuthor && (
          <>
            <Hint label="Edit message">
              <Button
                variant={"ghost"}
                disabled={isPending}
                onClick={handleEdit}
                size={"iconSm"}
              >
                <Pencil className="size-4" />
              </Button>
            </Hint>
            <Hint label="Delete message">
              <Button
                onClick={handleDelete}
                variant={"ghost"}
                disabled={isPending}
                size={"iconSm"}
              >
                <Trash className="size-4" />
              </Button>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
}

export default Toolbar;
