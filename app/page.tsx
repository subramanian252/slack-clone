"use client";

import UserButton from "@/features/auth/components/user-button";
import useGetWorkspaces from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkSpaceModel } from "@/features/workspaces/store/use-create-workspace-modal";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function Home() {
  const router = useRouter();

  const { data, isLoading } = useGetWorkspaces();

  const [open, setOpen] = useCreateWorkSpaceModel();

  const workSpaceId = useMemo(() => {
    return data?.[0]?._id;
  }, [data]);

  useEffect(() => {
    if (isLoading) return;
    if (workSpaceId) {
      router.replace(`/workspaces/${workSpaceId}`);
    } else if (!open) {
      setOpen(true);
    }
  }, [workSpaceId, isLoading]);

  return (
    <div>
      <UserButton />
    </div>
  );
}
