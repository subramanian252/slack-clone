import { Id } from "@/convex/_generated/dataModel";
import useShowThread from "./use-show-thread";
import useShowProfile from "./use-show-profile";

export const usePanel = () => {
  const [parentMessageId, setParentMessageId] = useShowThread();
  const [profileId, setProfileId] = useShowProfile();

  const onOpenPanel = (id: Id<"messages">) => {
    setParentMessageId(id);
    setProfileId(null);
  };

  const onClosePanel = () => {
    setParentMessageId(null);
    setProfileId(null);
  };

  const onOpenProfile = (id: Id<"members">) => {
    setParentMessageId(null);
    setProfileId(id);
  };

  return {
    parentMessageId,
    onOpenPanel,
    onClosePanel,
    onOpenProfile,
    profileId,
  };
};
