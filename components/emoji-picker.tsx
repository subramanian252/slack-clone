import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import EmojiPickerReact, { EmojiClickData } from "emoji-picker-react";
import { useState } from "react";

interface Props {
  children: React.ReactNode;
  hint?: string;
  onSelectEmoji: (emoji: string) => void;
}

export function EmojIPicker({
  children,
  hint = "Emoji",
  onSelectEmoji,
}: Props) {
  const onSelect = (value: EmojiClickData) => {
    onSelectEmoji(value.emoji);

    setPopOverOpen(false);

    setTimeout(() => {
      setToolTipOpen(false);
    }, 500);
  };

  const [popOverOpen, setPopOverOpen] = useState(false);
  const [toolTipOpen, setToolTipOpen] = useState(false);
  return (
    <TooltipProvider>
      <Popover open={popOverOpen} onOpenChange={setPopOverOpen}>
        <Tooltip
          open={toolTipOpen}
          onOpenChange={setToolTipOpen}
          delayDuration={50}
        >
          <TooltipTrigger>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{hint}</TooltipContent>
          <PopoverContent className="bg-transparent outline-none border-none">
            {/* <Picker data={data} onEmojiSelect={onSelect} /> */}
            <EmojiPickerReact onEmojiClick={onSelect} />
          </PopoverContent>
        </Tooltip>
      </Popover>
    </TooltipProvider>
  );
}
