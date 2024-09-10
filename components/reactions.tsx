import { Doc, Id } from "@/convex/_generated/dataModel";
import useGetMember from "@/features/members/api/use-get-member";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import React from "react";
import Hint from "./Hint";
import { EmojIPicker } from "./emoji-picker";
import { MdOutlineAddReaction } from "react-icons/md";

interface Props {
  data: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;

  onChange: (value: string) => void;
}

function Reactions(props: Props) {
  const { data, onChange } = props;

  const worksapceId = useWorkSpaceId();

  const { data: currentMember, isLoading: memberLoading } =
    useGetMember(worksapceId);

  const currentMemberId = currentMember?._id;

  if (!data || data.length < 0 || !currentMemberId || data === undefined) {
    return <div>hello</div>;
  }

  return (
    <div className="flex items-center gap-1 mt-1 mb-1">
      {data.map((reaction) => {
        return (
          <Hint
            label={`${reaction.count} ${reaction.count === 1 ? "person" : "people"} has reacted with ${reaction.value}`}
          >
            <button
              onClick={() => onChange(reaction.value)}
              className={cn(
                "h-6 px-2 rounded-full hover:border-slate-500 bg-slate-200/70 border border-transparent text-slate-800 flex items-center gap-x-1",
                reaction.memberIds.includes(currentMemberId) &&
                  "bg-blue-100/70 border-blue-500 text-white"
              )}
            >
              {reaction.value}
              <span
                className={cn(
                  "text-xs font-semibold text-muted-foreground",
                  reaction.memberIds.includes(currentMemberId) &&
                    "text-blue-500"
                )}
              >
                {reaction.count}
              </span>
            </button>
          </Hint>
        );
      })}
      <EmojIPicker onSelectEmoji={(e) => onChange(e)} hint="Add reaction">
        <button className="h-7 px-3 rounded-full bg-slate-200/70 border border-transparent hover:border-slate-500 text-slate-800 flex items-center gap-x-1">
          <MdOutlineAddReaction className="size-4" />
        </button>
      </EmojIPicker>
    </div>
  );
}

export default Reactions;
