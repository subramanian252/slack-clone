import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { AvatarImage } from "@radix-ui/react-avatar";
import { cva, VariantProps } from "class-variance-authority";
import Link from "next/link";
import React from "react";

const sideBarvariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7, px-[10px] text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc] ",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface Props {
  id: Id<"members">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof sideBarvariants>["variant"];
}

function UserItem(props: Props) {
  const { id, label, image, variant } = props;

  const workSpaceId = useWorkSpaceId();

  return (
    <Button
      variant={"transparent"}
      size={"sm"}
      asChild
      className={cn("px-5", sideBarvariants({ variant }))}
    >
      <Link href={`/workspaces/${workSpaceId}/member/${id}`}>
        <Avatar className="size-5 rounded-md mr-1">
          <AvatarFallback className="rounded-md bg-blue-500 text-white">
            {label?.charAt(0).toUpperCase()}
          </AvatarFallback>
          <AvatarImage src={image} className="rounded-md" />
        </Avatar>
        <span className="text-small truncate">{label}</span>
      </Link>
    </Button>
  );
}

export default UserItem;
