import { Id } from "@/convex/_generated/dataModel";
import useGetMember from "@/features/members/api/use-get-member";
import { useCreateMessages } from "@/features/messages/api/use-create-messages";
import { useGenerateUrl } from "@/features/messages/api/use-generate-url";
import useGetMessage from "@/features/messages/api/use-get-message";
import useGetMessages from "@/features/messages/api/use-get-messages";
import useChannelId from "@/hooks/use-channel-id";
import { usePanel } from "@/hooks/use-panel";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { AlertTriangle, Loader2, XIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Message from "./message";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface Props {}

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "EEEE, MMMM d");
};

function Thread(props: Props) {
  const {} = props;

  const editoRef = useRef<Quill | null>(null);

  const [editorKey, setEditorKey] = useState(0);

  const [isPending, setIsPending] = useState(false);

  const channelId = useChannelId();

  const { mutate } = useCreateMessages();

  const { mutate: createUploadUrl } = useGenerateUrl();

  const { parentMessageId, onClosePanel } = usePanel();

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const workspaceId = useWorkSpaceId();

  const currentMember = useGetMember(workspaceId);

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image?: File | null;
  }) => {
    try {
      setIsPending(true);

      editoRef.current?.enable(false);

      const values = {
        body,
        workspaceId: workspaceId,
        channelId: channelId,
        parenMessageId: parentMessageId as Id<"messages">,
        image: undefined,
      };

      if (image) {
        const url = await createUploadUrl({}, { throwError: true });

        if (!url) throw new Error("Failed to generate url");

        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": image.type,
          },
          body: image,
        });

        if (!result.ok) throw new Error("Failed to upload image");

        const { storageId } = await result.json();
        values.image = storageId;
      }

      await mutate(
        values,

        { throwError: true }
      );

      toast.success("Message sent");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      setEditorKey((prev) => prev + 1);
      editoRef.current?.enable(true);
    }
  };

  const { results, loadMore, status } = useGetMessages({
    parentMessageId: parentMessageId as Id<"messages">,
    channelId: channelId,
  });

  const { data, isLoading } = useGetMessage({
    id: parentMessageId as Id<"messages">,
  });

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof results>
  );

  if (isLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full">
        <div className=" h-[49px] border-b overflow-hidden">
          <div className="h-full flex justify-between items-center px-2">
            <h1 className="font-semibold">Thread</h1>
            <XIcon className="w-4 h-4 cursor-pointer" onClick={onClosePanel} />
          </div>
        </div>
        <div className="h-full flex justify-center  items-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full">
        <div className=" h-[49px] border-b overflow-hidden">
          <div className="h-full flex justify-between items-center px-2">
            <h1 className="font-semibold">Thread</h1>
            <XIcon className="w-4 h-4 cursor-pointer" onClick={onClosePanel} />
          </div>
        </div>
        <div className="h-full flex justify-center flex-col gap-y-2  items-center">
          <AlertTriangle className="size-6 " />
          <p>Thread not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className=" h-[49px] border-b overflow-hidden">
        <div className="h-full flex justify-between items-center px-2">
          <h1 className="font-semibold">Thread</h1>
          <XIcon className="w-4 h-4 cursor-pointer" onClick={onClosePanel} />
        </div>
      </div>
      <div className="h-full flex-1 flex flex-col-reverse overflow-y-auto messages-scrollbar px-2  pb-12">
        <Editor
          key={editorKey}
          placeholder={"type..."}
          onSubmit={handleSubmit}
          innerRef={editoRef}
          disabled={false}
        />
        {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className="text-center my-2 relative">
              <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-2">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              const prevmessage = messages[index - 1];
              const isCompact =
                prevmessage &&
                prevmessage.user?.name === message.user?.name &&
                differenceInMinutes(
                  new Date(message._creationTime),
                  new Date(prevmessage._creationTime)
                ) < 5;
              return (
                <Message
                  key={message?._id}
                  id={message?._id}
                  memberId={message?.memeberId}
                  authorImage={message?.user?.image}
                  authorName={message?.user?.name}
                  isAuthor={message.memeberId === currentMember?.data?._id}
                  reactions={message.reactions}
                  body={message.body}
                  image={message?.image}
                  updatedAt={message?.updatedAt}
                  createdAt={message._creationTime}
                  isEditing={editingId === message?._id}
                  setEditingId={setEditingId}
                  isCompact={isCompact}
                  hideThreadButton
                  threadCount={message?.threadCount}
                  threadImage={message?.threadImage}
                  threadTimeStamp={message?.threadTimestamp}
                />
              );
            })}
          </div>
        ))}
        <Message
          key={data?._id}
          id={data?._id}
          memberId={data?.memeberId}
          authorImage={data?.popUser?.image}
          authorName={data?.popUser?.name}
          isAuthor={data.memeberId === currentMember?.data?._id}
          reactions={data.reactions}
          body={data.body}
          image={data?.image}
          updatedAt={data?.updatedAt}
          createdAt={data._creationTime}
          isEditing={editingId === data?._id}
          setEditingId={setEditingId}
          hideThreadButton
        />
      </div>
    </div>
  );
}

export default Thread;
