import UserButton from "@/features/auth/components/user-button";
import React from "react";
import WorkSpaceSwitcher from "./WorkSpaceSwitcher";
import SideBarButton from "./sidebar-button";
import {
  BellIcon,
  Home,
  HomeIcon,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface Props {}

function SideBar(props: Props) {
  const {} = props;

  const pathName = usePathname();

  return (
    <aside className="h-full bg-[#481349] w-[70px] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
      <WorkSpaceSwitcher />
      <SideBarButton
        icon={HomeIcon}
        label={"Home"}
        isActive={pathName.includes("/workspaces")}
      />
      <SideBarButton icon={MessageSquare} label={"DM's"} />
      <SideBarButton icon={BellIcon} label={"activity"} />
      <SideBarButton icon={MoreHorizontal} label={"More"} />

      <div className="mt-auto">
        <UserButton />
      </div>
    </aside>
  );
}

export default SideBar;
