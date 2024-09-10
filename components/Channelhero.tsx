import { format } from "date-fns";
import React from "react";

interface Props {
  name: string;
  creationTime: number;
}

function Channelhero(props: Props) {
  const { name, creationTime } = props;

  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="text-2xl font-bold flex items-center mb-2"># {name}</p>
      <p className="font-normal text-salte-800 mb-4">
        This Channel was created{" "}
        {format(new Date(creationTime), "MMMM do, yyyy")}. This is the very
        beginning of the <strong>{name}</strong> channel
      </p>
    </div>
  );
}

export default Channelhero;
