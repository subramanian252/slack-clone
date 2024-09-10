import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface Props {
  name?: string;
  image?: string;
}

function ConversationHero(props: Props) {
  const { name = "Member", image } = props;

  return (
    <div className="mt-[88px] mx-5 mb-4">
      <div className="flex items-center gap-x-1 mb-2">
        <Avatar className="size-6 rounded-md mr-1">
          <AvatarFallback className="rounded-md bg-blue-500 text-white">
            {name?.charAt(0).toUpperCase()}
          </AvatarFallback>
          <AvatarImage src={image} className="rounded-md" />
        </Avatar>
      </div>
      <p className="text-2xl font-bold">{name}</p>
      <p>
        This Conversation is just between you and<strong> {name}</strong>
      </p>
    </div>
  );
}

export default ConversationHero;
