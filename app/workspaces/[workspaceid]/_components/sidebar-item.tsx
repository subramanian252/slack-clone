import { Button } from "@/components/ui/button";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { IconType } from "react-icons/lib";

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
  label: string;
  icon: IconType | LucideIcon;
  id?: string;
  variant?: VariantProps<typeof sideBarvariants>["variant"];
}

function SideBarItem(props: Props) {
  const { label, icon: Icon, id, variant } = props;

  const workSpaceId = useWorkSpaceId();

  return (
    <Button
      variant={"transparent"}
      size={"sm"}
      asChild
      className={cn(sideBarvariants({ variant }))}
    >
      <Link href={`/workspaces/${workSpaceId}/channel/${id}`}>
        <Icon className="w-4 h-4" />
        <span className="text-small truncate">{label}</span>
      </Link>
    </Button>
  );
}

export default SideBarItem;
