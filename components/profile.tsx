import { Id } from "@/convex/_generated/dataModel";
import { useUpdateRole } from "@/features/members/api/use-change-role";
import useGetMemberById from "@/features/members/api/use-get-member by-id";
import {
  AlertTriangle,
  ChevronDownIcon,
  Loader2,
  MailIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import confirmDialog from "./confirmDialog";
import { useRemoveMember } from "@/features/members/api/use-remove-member";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import useGetMember from "@/features/members/api/use-get-member";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface Props {
  memberId: Id<"members">;
  onClosePanel: () => void;
}

function Profile(props: Props) {
  const { memberId, onClosePanel } = props;

  const { data: member, isLoading } = useGetMemberById(memberId);

  const workspaceId = useWorkSpaceId();

  const { data: currentMember, isLoading: isLoadingMember } =
    useGetMember(workspaceId);

  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateRole();
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();

  const router = useRouter();

  const [UpdateDialog, updateConfirm] = confirmDialog({
    title: "update role",
    description: "Are you sure you want to update the role?",
  });

  const [RemoveDialog, removeConfirm] = confirmDialog({
    title: "remove user",
    description: "Are you sure you want to remove the user?",
  });

  const [LeaveDialog, leaveConfirm] = confirmDialog({
    title: "leave workspace",
    description: "Are you sure you want to leave the workspace?",
  });

  const handleUpdate = async (role: "admin" | "member") => {
    const ok = await updateConfirm();
    if (!ok) return;
    updateMember(
      { id: memberId, role },
      {
        onSuccess: () => {
          toast.success("Role updated");
          onClosePanel();
        },
        onError: (err) => {
          //   console.log(err);
          toast.error("Failed to update role");
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await removeConfirm();
    if (!ok) return;
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("removed successfully");
          onClosePanel();
        },
        onError: () => {
          toast.error("Failed to remove the member");
        },
      }
    );
  };
  const handleLeave = async () => {
    const ok = await leaveConfirm();
    if (!ok) return;
    removeMember(
      { id: memberId },
      {
        onSuccess: () => {
          toast.success("you left the workspace");
          onClosePanel();
          router.replace("/");
        },
        onError: () => {
          toast.error("Failed to leave workspace");
        },
      }
    );
  };

  if (isLoading || isLoadingMember) {
    return (
      <div className="h-full">
        <div className=" h-[49px] border-b overflow-hidden">
          <div className="h-full flex justify-between items-center px-2">
            <h1 className="font-semibold">Thread</h1>
            <XIcon className="w-4 h-4 cursor-pointer" onClick={onClosePanel} />
          </div>
        </div>
        <div className="h-full flex justify-center  items-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="h-full">
        <div className=" h-[49px] border-b overflow-hidden">
          <div className="h-full flex justify-between items-center px-2">
            <h1 className="font-semibold">Thread</h1>
            <XIcon className="w-4 h-4 cursor-pointer" onClick={onClosePanel} />
          </div>
        </div>
        <div className="h-full flex justify-center flex-col gap-y-2  items-center">
          <AlertTriangle className="size-6 " />
          <p>Thread not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <LeaveDialog />
      <RemoveDialog />
      <UpdateDialog />

      <div className=" h-[49px] border-b overflow-hidden">
        <div className="h-full flex justify-between items-center px-2">
          <h1 className="font-semibold">Thread</h1>
          <XIcon className="w-4 h-4 cursor-pointer" onClick={onClosePanel} />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-4">
        <Avatar className="max-w-[256px] max-h-[256px] size-full">
          <AvatarFallback className="rounded-md bg-blue-500 text-white aspect-square text-6xl font-semibold">
            {member.user?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
          <AvatarImage src={member.user?.image} className="rounded-md" />
        </Avatar>
      </div>
      <div className="flex flex-col p-4 ">
        <p className="font-semibold text-xl">{member.user?.name}</p>
        {currentMember?.role === "admin" && currentMember._id !== member._id ? (
          <div className="flex items-center gap-2 mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={"outline"} className="w-full capitalize">
                  {member.role} <ChevronDownIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup
                  value={member.role}
                  onValueChange={(v) => handleUpdate(v as "admin" | "member")}
                >
                  <DropdownMenuRadioItem value="admin">
                    Admin
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="member">
                    member
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleRemove}>
              Remove
            </Button>
          </div>
        ) : currentMember?._id === memberId &&
          currentMember?.role !== "admin" ? (
          <div className="mt-4">
            <Button variant="outline" onClick={handleLeave} className="w-full">
              Leave
            </Button>
          </div>
        ) : null}
      </div>
      <Separator />

      <div className="flex flex-col p-4 ">
        <p className="text-sm font-bold mb-4">Contact User</p>
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-muted-foreground/50 flex items-center justify-center text-white">
            <MailIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-muted-foreground">
              Email Address
            </p>
            <Link href={`mailto:${member.user?.email}`}>
              <p className="text-sm font-semibold text-sky-500 hover:underline">
                {member.user?.email}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
