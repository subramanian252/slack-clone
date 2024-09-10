import { atom, useAtom } from "jotai";

const state = atom(false);

export const useCreateChannelModel = () => {
  return useAtom(state);
};
