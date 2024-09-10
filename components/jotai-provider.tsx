import { Provider } from "jotai";
import React from "react";

interface Props {
  children: React.ReactNode;
}

function JotaiProvider(props: Props) {
  const { children } = props;

  return <Provider>{children}</Provider>;
}

export default JotaiProvider;
