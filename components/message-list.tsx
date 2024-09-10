import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { useState } from "react";

import { Id } from "@/convex/_generated/dataModel";
import useGetMember from "@/features/members/api/use-get-member";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import Channelhero from "./Channelhero";
import Message from "./message";
import { useEditMessage } from "@/features/messages/api/use-edit-message";
import { Loader } from "lucide-react";
import ConversationHero from "./conversation-hero";

const TIME_THRESHOLD = 5;

interface Props {
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  loadMore: () => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
  data: GetMessagesReturnType | undefined;
  variant?: "channel" | "conversation" | "thread";
}

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

function MessageList(props: Props) {
  const {
    memberName,
    memberImage,
    channelName,
    channelCreationTime,
    loadMore,
    isLoadingMore,
    canLoadMore,
    data,
    variant = "channel",
  } = props;

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const workspaceId = useWorkSpaceId();

  const { data: member } = useGetMember(workspaceId);

  const groupedMessages = data?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof data>
  );

  return (
    <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
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
              ) < TIME_THRESHOLD;
            return (
              <Message
                key={message?._id}
                id={message?._id}
                memberId={message?.memeberId}
                authorImage={message?.user?.image}
                authorName={message?.user?.name}
                isAuthor={message.memeberId === member?._id}
                reactions={message.reactions}
                body={message.body}
                image={message?.image}
                updatedAt={message?.updatedAt}
                createdAt={message._creationTime}
                isEditing={editingId === message?._id}
                setEditingId={setEditingId}
                isCompact={isCompact}
                hideThreadButton={variant === "thread"}
                threadCount={message?.threadCount}
                threadImage={message?.threadImage}
                threadTimeStamp={message?.threadTimestamp}
                threadName={message?.threadName}
              />
            );
          })}
        </div>
      ))}
      <div
        className="h-1 "
        ref={(el) => {
          if (el) {
            const observer = new IntersectionObserver(
              ([entries]) => {
                if (entries.isIntersecting && canLoadMore) {
                  loadMore();
                }
              },
              { threshold: 1 }
            );
            observer.observe(el);
            return () => observer.disconnect();
          }
        }}
      />
      {isLoadingMore && (
        <div className="text-center my-2 relative">
          <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
          <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-2">
            <Loader className="size-4 animate-spin" />
          </span>
        </div>
      )}
      {variant === "channel" && channelName && channelCreationTime && (
        <Channelhero name={channelName} creationTime={channelCreationTime} />
      )}
      {variant === "conversation" && (
        <ConversationHero name={memberName} image={memberImage} />
      )}
    </div>
  );
}

export default MessageList;
