import { useQueryState } from "nuqs";

export default function useShowThread() {
  return useQueryState("parentMessageId");
}
