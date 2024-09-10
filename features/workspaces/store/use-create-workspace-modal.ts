import { atom, useAtom } from "jotai";

const state = atom(false);

export const useCreateWorkSpaceModel = () => {
  return useAtom(state);
};
