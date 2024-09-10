"use client";

import Thread from "@/components/thread";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { usePanel } from "@/hooks/use-panel";
import React from "react";
import SideBar from "./_components/SideBar";
import ToolBar from "./_components/ToolBar";
import WorkSpaceSideBar from "./_components/workspace-sidebar";
import Profile from "@/components/profile";
import { Id } from "@/convex/_generated/dataModel";

interface Props {
  children: React.ReactNode;
}

function Layout(props: Props) {
  const { children } = props;

  const {
    parentMessageId,
    onOpenPanel,
    onClosePanel,
    onOpenProfile,
    profileId,
  } = usePanel();

  const showPanel = !!parentMessageId || !!profileId;

  return (
    <div className="h-full">
      <ToolBar />
      <div className="flex h-[calc(100vh-40px)] ">
        <SideBar />
        <ResizablePanelGroup direction="horizontal" autoSaveId={"layout"}>
          <ResizablePanel
            className="bg-[#5e2c5f]"
            defaultSize={20}
            minSize={11}
          >
            <WorkSpaceSideBar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20} defaultSize={80}>
            {children}
          </ResizablePanel>
          {showPanel && parentMessageId && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={29} minSize={20}>
                <Thread />
              </ResizablePanel>
            </>
          )}
          {showPanel && profileId && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={29} minSize={20}>
                <Profile
                  memberId={profileId as Id<"members">}
                  onClosePanel={onClosePanel}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

export default Layout;
