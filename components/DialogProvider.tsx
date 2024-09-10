"use client";

import CreateChannelModel from "@/features/channels/components/create-channel-model";
import CreateWorkSpaceModel from "@/features/workspaces/components/create-workspace-model";
import React, { useEffect, useState } from "react";

interface Props {}

function DialogProvider(props: Props) {
  const {} = props;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CreateWorkSpaceModel />
      <CreateChannelModel />
    </>
  );
}

export default DialogProvider;
