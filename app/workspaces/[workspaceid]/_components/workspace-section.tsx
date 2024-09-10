import Hint from "@/components/Hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import React from "react";
import { FaCaretDown } from "react-icons/fa";
import { useToggle } from "react-use";

interface Props {
  children: React.ReactNode;
  label: string;
  hint: string;
  onNew?: () => void;
}

function WorkspaceSection(props: Props) {
  const { children, label, hint, onNew } = props;

  const [on, toggle] = useToggle(true);

  return (
    <div className="flex  flex-col px-2 mt-3">
      <div className="flex px-1.5 items-center group">
        <Button
          variant={"transparent"}
          className="p-0.5 text-sm shrink-0 size-6 text-[#f9edffcc]"
          onClick={toggle}
        >
          <FaCaretDown
            className={cn("w-4 h-4 transition-transform", on && "-rotate-90")}
          />
        </Button>
        <Button
          variant={"transparent"}
          className="group p-0.5 text-sm text-[#f9edffcc] h-[28px] justify-start overflow-hidden"
          size={"sm"}
        >
          <span className="truncate">{label}</span>
        </Button>
        {onNew && (
          <Hint label={hint} side="top">
            <Button
              variant={"transparent"}
              className="opacity-0  group-hover:opacity-100 trensition-opacity ml-auto p-0.5 text-sm text-[#f9edffcc] size-6"
              size={"iconSm"}
              onClick={onNew}
            >
              <PlusIcon className="w-4 h-4" />
            </Button>
          </Hint>
        )}
      </div>
      {on && children}
    </div>
  );
}

export default WorkspaceSection;
