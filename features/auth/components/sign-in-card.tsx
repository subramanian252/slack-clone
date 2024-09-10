import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { TriangleAlert } from "lucide-react";

import { useAuthActions } from "@convex-dev/auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignInFlow } from "../types";
import { useState } from "react";

interface Props {
  setState: React.Dispatch<React.SetStateAction<SignInFlow>>;
}

function SignInCard(props: Props) {
  const { setState } = props;

  const { signIn } = useAuthActions();

  const [email, setEmail] = useState<string>("");

  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");

  const [pending, setPending] = useState<boolean>(false);

  const handleSocialLogin = (provider: "github" | "google") => {
    setPending(true);
    signIn(provider).finally(() => {
      setPending(false);
    });
  };

  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    setPending(true);
    signIn("password", { email, password, flow: "signIn" })
      .catch(() => {
        setError("Invalid Credentials");
      })
      .finally(() => {
        setPending(false);
      });
  };

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Login To Continue</CardTitle>
        <CardDescription className="mb-4">
          Use your email or other socials to login
        </CardDescription>
      </CardHeader>
      {error && (
        <div className="text-red-500 bg-red-500/15 p-3 rounded-md flex gap-x-4 items-center">
          <TriangleAlert className="size-5" />
          {error}
        </div>
      )}

      <CardContent className="space-y-5 px-0 pb-0">
        <form onSubmit={handlePasswordSignIn} className="space-y-3">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            required
          />
          <Input
            placeholder="password"
            type="password"
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={pending}
            size={"lg"}
          >
            <span>Continue</span>
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            disabled={pending}
            size={"lg"}
            variant={"outline"}
            className="w-full relative"
            onClick={() => {
              console.log("clicked");
              handleSocialLogin("google");
            }}
          >
            <FcGoogle className="absolute top-1/2 -translate-y-1/2 left-4 size-5" />
            Continue with google
          </Button>
          <Button
            disabled={pending}
            size={"lg"}
            variant={"outline"}
            className="w-full relative"
            onClick={() => handleSocialLogin("github")}
          >
            <FaGithub className="absolute top-1/2 -translate-y-1/2 left-4 size-5" />
            Continue with github
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => setState("signUp")}
            className="underline text-sky-500 cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

export default SignInCard;
