"use client";

import { Button } from "@/components/ui/button";
import useGetWorkspaceInfo from "@/features/workspaces/api/use-get-workspaceInfo";
import { useJoinWorkSpace } from "@/features/workspaces/api/use-join-workspace";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import VerificationInput from "react-verification-input";
import { toast } from "sonner";

interface Props {}

function Page(props: Props) {
  const {} = props;

  const router = useRouter();

  const workspaceId = useWorkSpaceId();

  const { data, isLoading } = useGetWorkspaceInfo(workspaceId);

  const { mutate, isPending } = useJoinWorkSpace();

  const isMember = useMemo(() => {
    return data?.isMember;
  }, [data?.isMember]);

  useEffect(() => {
    if (isMember) {
      router.replace(`/workspaces/${workspaceId}`);
    }
  }, [isMember, router, workspaceId]);

  const handleComplete = (value: string) => {
    mutate(
      { id: workspaceId, joinCode: value },
      {
        onSuccess: () => {
          router.replace(`/workspaces/${workspaceId}`);
          toast.success("Joined workspace successfully");
        },
        onError: () => {
          toast.error("Failed to join workspace");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-y-8">
        <Loader2 className="size-5 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center gap-y-8">
      <Image src="/next.svg" alt="logo" width={100} height={100} />
      <div className="text-center flex flex-col gap-y-4">
        <h1 className="text-3xl font-semibold">Join a {data?.name}</h1>
        <p>Enter the WorkSpace code to join</p>
      </div>
      <div>
        <VerificationInput
          onComplete={handleComplete}
          length={6}
          classNames={{
            container: cn(
              "flex gap-x-2",
              isPending && "opacity-50 cursor-not-allowed"
            ),
            character:
              "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center font-semibold",
            characterInactive: "bg-muted",
            characterSelected: "bg-white text-black",
            characterFilled: "bg-white text-black",
          }}
        />
      </div>
      <div className="flex gap-x-4">
        <Button size={"lg"} variant={"outline"} asChild>
          <Link href={`/`} className="capitalize">
            go back home
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default Page;
