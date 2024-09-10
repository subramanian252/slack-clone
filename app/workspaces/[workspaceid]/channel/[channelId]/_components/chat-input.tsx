import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useCreateMessages } from "@/features/messages/api/use-create-messages";
import useWorkSpaceId from "@/hooks/use-workspace-id";
import useChannelId from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useGenerateUrl } from "@/features/messages/api/use-generate-url";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface Props {
  placeholder: string;
}

function ChatInput(props: Props) {
  const { placeholder } = props;

  const editoRef = useRef<Quill | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const { mutate } = useCreateMessages();
  const { mutate: createUploadUrl } = useGenerateUrl();

  const workSpaceId = useWorkSpaceId();

  const channelId = useChannelId();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image?: File | null;
  }) => {
    try {
      setIsPending(true);

      editoRef.current?.enable(false);

      const values = {
        body,
        workspaceId: workSpaceId,
        channelId: channelId,
        image: undefined,
      };

      if (image) {
        const url = await createUploadUrl({}, { throwError: true });

        if (!url) throw new Error("Failed to generate url");

        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": image.type,
          },
          body: image,
        });

        if (!result.ok) throw new Error("Failed to upload image");

        const { storageId } = await result.json();
        values.image = storageId;
      }

      await mutate(
        values,

        { throwError: true }
      );

      toast.success("Message sent");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      setEditorKey((prev) => prev + 1);
      editoRef.current?.enable(true);
    }
  };

  return (
    <div className="px-5 w-full ">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        innerRef={editoRef}
        disabled={isPending}
      />
    </div>
  );
}

export default ChatInput;
