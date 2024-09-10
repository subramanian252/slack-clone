import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import React from "react";
import { FaChevronDown } from "react-icons/fa";

interface Props {
  memberName?: string;
  memberImage?: string;
  onClick?: () => void;
}

function ConversationHeader(props: Props) {
  const { memberImage, memberName } = props;

  return (
    <div className="bg-white h-[49px] border-b flex items-center px-4 overflow-hidden">
      <Button
        variant="ghost"
        size={"sm"}
        className="text-lg font-semibold px-2 overflow-hidden w-auto"
        onClick={props.onClick}
      >
        <Avatar className="size-6 rounded-md mr-1">
          <AvatarFallback className="rounded-md bg-blue-500 text-white">
            {memberName?.charAt(0).toUpperCase()}
          </AvatarFallback>
          <AvatarImage src={memberImage} className="rounded-md" />
        </Avatar>
        <span className="truncate">{memberName}</span>
        <FaChevronDown className="size-3 ml-2" />
      </Button>
    </div>
  );
}

export default ConversationHeader;
