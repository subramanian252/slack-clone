"use client";

import { useState } from "react";
import { SignInFlow } from "../types";
import SignInCard from "./sign-in-card";
import SignUpCard from "./sign-up-card";

interface Props {}

function AuthScreen(props: Props) {
  const {} = props;

  const [state, setState] = useState<SignInFlow>("signIn");

  return (
    <div className="h-full flex items-center justify-center bg-[#5c3b58]">
      <div className="md:h-auto md:w-[420px] ">
        {state === "signUp" ? (
          <SignUpCard setState={setState} />
        ) : (
          <SignInCard setState={setState} />
        )}
      </div>
    </div>
  );
}

export default AuthScreen;
