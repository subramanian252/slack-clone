import { Id } from "@/convex/_generated/dataModel";
import useGetMemberById from "@/features/members/api/use-get-member by-id";
import useGetMessages from "@/features/messages/api/use-get-messages";
import useMemberId from "@/hooks/use-member-id";
import { Loader2 } from "lucide-react";
import React from "react";
import ConversationHeader from "./conversation-header";
import ChatInputConversations from "./chat-input-conversations";
import MessageList from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";

interface Props {
  id: Id<"conversations">;
}

function Conversations(props: Props) {
  const { id } = props;

  const memberId = useMemberId();

  const { data: otherMember, isLoading } = useGetMemberById(memberId);

  const { onOpenProfile } = usePanel();

  const { results, status, loadMore } = useGetMessages({
    conversationId: id,
  });

  if (isLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-[#5e2c5f]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader
        memberName={otherMember?.user?.name}
        memberImage={otherMember?.user?.image}
        onClick={() => onOpenProfile(memberId)}
      />
      <MessageList
        memberName={otherMember?.user?.name}
        memberImage={otherMember?.user?.image}
        variant="conversation"
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
        data={results}
      />
      <ChatInputConversations placeholder="Send a message" id={id} />
    </div>
  );
}

export default Conversations;
