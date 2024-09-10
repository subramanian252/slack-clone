import { useQueryState } from "nuqs";

export default function useShowProfile() {
  return useQueryState("profileId");
}
