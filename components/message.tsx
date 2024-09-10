import { Doc, Id } from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns";
import React from "react";
import Hint from "./Hint";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Thumbnail from "./Thumbnail";
import Toolbar from "./toolbar";
import { useEditMessage } from "@/features/messages/api/use-edit-message";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDeleteMessage } from "@/features/messages/api/use-delete-message";
import confirmDialog from "./confirmDialog";
import { useToggleReactions } from "@/features/reactions/api/use-create-messages";
import Reactions from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import ThreadBar from "./thread-bar";

const Renderer = dynamic(() => import("./Renderer"), { ssr: false });
const Editor = dynamic(() => import("./Editor"), { ssr: false });

const formatFullTime = (dateStr: Date) => {
  return `${isToday(dateStr) ? "Today" : isYesterday(dateStr) ? "Yesterday" : format(dateStr, "EEEE, MMMM d, yyyy")} at ${format(dateStr, "h:mm a")}`;
};

interface Props {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorName?: string;
  authorImage?: string;
  isAuthor: boolean;
  body: Doc<"messages">["body"];
  reactions?: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimeStamp?: number;
  threadName?: string;
}

function Message(props: Props) {
  const {
    id,
    memberId,
    authorName,
    authorImage,
    isAuthor,
    body,
    reactions,
    image,
    createdAt,
    updatedAt,
    isEditing,
    isCompact,
    setEditingId,
    hideThreadButton,
    threadCount,
    threadImage,
    threadTimeStamp,
    threadName,
  } = props;

  const [DialogConfirm, confirm] = confirmDialog({
    title: "Delete a message",
    description: "Are you sure you want to delete the message?",
  });

  const { parentMessageId, onOpenPanel, onClosePanel, onOpenProfile } =
    usePanel();

  const { mutate: editMutate, isPending: isUpdatePending } = useEditMessage();
  const { mutate: deleteMutate, isPending: isDeletingMessage } =
    useDeleteMessage();

  const { mutate: toggleReaction, isPending: isReactionPending } =
    useToggleReactions();

  const handleThread = () => {
    onOpenPanel(id);
  };

  const handleEdit = ({ body }: { body: string }) => {
    console.log(body);
    editMutate(
      { id: id, body: body },
      {
        onSuccess: () => {
          setEditingId(null);
          toast.success("message updated successfully");
        },
        onError: () => {
          toast.error("failed to update message");
        },
      }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    deleteMutate(
      { id: id },
      {
        onSuccess: (id) => {
          if (parentMessageId === id) onClosePanel();
          toast.success("message deleted successfully");
        },
        onError: () => {
          toast.error("failed to delete message");
        },
      }
    );
  };

  const HandleToggleReaction = (value: string) => {
    toggleReaction(
      { id, value: value },
      {
        onError: () => {
          toast.error("failed to toggle reaction");
        },
      }
    );
  };

  const isPending = isUpdatePending || isDeletingMessage || isReactionPending;

  if (isCompact) {
    return (
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c7443] hover:bg-[#f2c7443]",
          isDeletingMessage &&
            "bg-rose-500/50 transform transition scale-y-0 origin-bottom duration-200"
        )}
      >
        <DialogConfirm />
        <div className="flex items-start gap-2">
          <Hint label={formatFullTime(new Date(createdAt))}>
            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px]text-center hover:underline">
              {format(new Date(createdAt), "HH:mm")}
            </button>
          </Hint>
          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                variant="update"
                onSubmit={handleEdit}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="flex flex-col w-full">
              <Renderer value={body} />
              <Thumbnail url={image} />

              {updatedAt ? (
                <span className="text-xs text-muted-foreground">edited</span>
              ) : null}
              <Reactions
                // @ts-ignore

                data={reactions}
                onChange={HandleToggleReaction}
              />
              <ThreadBar
                onClick={() => onOpenPanel(id)}
                image={threadImage}
                count={threadCount}
                name={threadName}
                timeStamp={threadTimeStamp}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={handleThread}
            handleDelete={handleDelete}
            handleReaction={HandleToggleReaction}
            hideThreadButton={hideThreadButton}
          />
        )}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
        isEditing && "bg-[#f2c7443] hover:bg-[#f2c7443]",
        isDeletingMessage &&
          "bg-rose-500/50 transform transition scale-y-0 origin-bottom duration-200"
      )}
    >
      <DialogConfirm />

      <div className="flex items-start gap-2">
        <button className="" onClick={() => onOpenProfile(memberId)}>
          <Avatar className="">
            <AvatarImage src={authorImage} />
            <AvatarFallback className="rounded-md bg-sky-500 text-white text-xs">
              <span className="text-2xl">{authorName?.slice(0, 1)}</span>
            </AvatarFallback>
          </Avatar>
        </button>
        {isEditing ? (
          <div className="w-full h-full">
            <Editor
              variant="update"
              onSubmit={handleEdit}
              disabled={isPending}
              defaultValue={JSON.parse(body)}
              onCancel={() => setEditingId(null)}
            />
          </div>
        ) : (
          <div className="flex flex-col w-full overflow-hidden">
            <div className="text-sm space-x-2">
              <button
                onClick={() => onOpenProfile(memberId)}
                className="font-bold text-primary hover:underline"
              >
                {authorName}
              </button>
              <Hint label={formatFullTime(new Date(createdAt))}>
                <button className="text-xs text-muted-foreground hover:underline">
                  {format(new Date(createdAt), "h:mm a")}
                </button>
              </Hint>
            </div>
            <Renderer value={body} />
            <Thumbnail url={image} />
            {updatedAt ? (
              <span className="text-xs text-muted-foreground">edited</span>
            ) : null}
            <Reactions
              // @ts-ignore
              data={reactions}
              onChange={HandleToggleReaction}
            />
            <ThreadBar
              onClick={() => onOpenPanel(id)}
              image={threadImage}
              count={threadCount}
              name={threadName}
              timeStamp={threadTimeStamp}
            />
          </div>
        )}
      </div>
      {!isEditing && (
        <Toolbar
          isAuthor={isAuthor}
          isPending={isPending}
          handleEdit={() => setEditingId(id)}
          handleThread={handleThread}
          handleDelete={handleDelete}
          handleReaction={HandleToggleReaction}
          hideThreadButton={hideThreadButton}
        />
      )}
    </div>
  );
}

export default Message;
