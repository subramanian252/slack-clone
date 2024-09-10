"use client";

import useGetChannel from "@/features/channels/api/use-get-channel";
import useGetMessages from "@/features/messages/api/use-get-messages";
import useChannelId from "@/hooks/use-channel-id";
import { Loader2, TriangleAlert } from "lucide-react";
import ChatInput from "./_components/chat-input";
import Header from "./_components/HEader";
import MessageList from "@/components/message-list";

interface Props {}

function Page(props: Props) {
  const {} = props;

  const channelId = useChannelId();

  const { data: channel, isLoading } = useGetChannel(channelId);

  const { results, status, loadMore } = useGetMessages({ channelId });

  if (isLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-[#5e2c5f]" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-full flex-1 flex flex-col gap-y-2 items-center justify-center">
        <TriangleAlert className="size-5  text-[#5e2c5f]" />
        <p>No workspace Found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />
      <MessageList
        channelName={channel.name}
        channelCreationTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput placeholder={`Message # ${channel.name}`} />
    </div>
  );
}

export default Page;
