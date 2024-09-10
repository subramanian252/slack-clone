import Quill, { QuillOptions } from "quill";

import "quill/dist/quill.snow.css";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "./ui/button";

import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";

import { ImageIcon, Keyboard, Smile, XIcon } from "lucide-react";
import Hint from "./Hint";
import { Delta, Op } from "quill/core";
import { cn } from "@/lib/utils";
import { EmojIPicker } from "./emoji-picker";
import Image from "next/image";

type EditorValue = {
  image?: File | null;
  body: string;
};

interface Props {
  variant?: "create" | "update";
  onSubmit: ({ image, body }: EditorValue) => void;
  onCancel?: () => void;
  placeholder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
}

function Editor(props: Props) {
  const {
    variant = "create",
    onCancel,
    onSubmit,
    placeholder = "Write something...",
    defaultValue = [],
    innerRef,
    disabled = false,
  } = props;

  const [text, setText] = useState("");

  const [image, setImage] = useState<File | null>(null);

  const [toolBarVisible, setToolBarVisible] = useState(true);

  const containeRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef(onSubmit);
  const placeHolderRef = useRef(placeholder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);
  const imageRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeHolderRef.current = placeholder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containeRef.current) return;

    const container = containeRef.current;

    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeHolderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              shiftKey: false,
              handler: () => {
                const text = quill.getText();
                const addedImage = imageRef.current?.files?.[0] || null;

                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                if (isEmpty) {
                  return;
                }

                const body = JSON.stringify(quill.getContents());

                submitRef.current({ image: addedImage, body });
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editorContainer, options);

    quillRef.current = quill;
    quillRef.current.focus();

    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, []);

  const isEmpty = text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

  const onSelectEmoji = (emojiValue: string) => {
    const quill = quillRef.current;
    quill?.insertText(quill?.getSelection()?.index || 0, emojiValue);
  };

  const toggleToolBar = () => {
    setToolBarVisible(!toolBarVisible);
    const toolBarElement = containeRef.current?.querySelector(".ql-toolbar");

    if (toolBarElement) {
      toolBarElement.classList.toggle("hidden");
    }
  };

  return (
    <div className="flex flex-col py-3">
      <input
        type="file"
        accept="image/*"
        ref={imageRef}
        onChange={(e) => setImage(e.target.files![0])}
        hidden
      />
      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white ",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="h-full ql-custom" ref={containeRef} />
        {!!image && (
          <div className="p-2">
            <div className="relative size-[62px] flex items-center justify-center group/image">
              <Hint label="Remove image">
                <button
                  onClick={() => {
                    setImage(null);
                    imageRef.current!.value = "";
                  }}
                  className="hidden group-hover/image:flex rounded-full bg-black/50 hover:bg-black items-center justify-center absolute -top-2.5 -right-2.5 text-white z-[4] border-2"
                >
                  <XIcon className="h-4 w-4 text-slate-400" />
                </button>
              </Hint>
              <Image
                src={URL.createObjectURL(image)}
                alt="image"
                fill
                className="object-cover rounded-xl border overflow-hidden"
              />
            </div>
          </div>
        )}
        <div className="flex px-2 pb-2 z-[5]">
          <Hint label={toolBarVisible ? "Hide Fomatting" : "Show Fomatting"}>
            <Button
              onClick={toggleToolBar}
              disabled={disabled}
              size={"sm"}
              variant={"ghost"}
            >
              <PiTextAa className="h-4 w-4" />
            </Button>
          </Hint>
          <EmojIPicker onSelectEmoji={onSelectEmoji} hint="Emoji">
            <Button disabled={disabled} size={"sm"} variant={"ghost"}>
              <Smile className="h-4 w-4" />
            </Button>
          </EmojIPicker>
          {variant === "create" && (
            <Hint label="Insert Image">
              <Button
                onClick={() => imageRef.current?.click()}
                disabled={disabled}
                size={"sm"}
                variant={"ghost"}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
            </Hint>
          )}
          {variant === "create" && (
            <Button
              disabled={disabled || isEmpty}
              size={"iconSm"}
              onClick={() =>
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  image: imageRef.current?.files?.[0] || null,
                })
              }
              className={cn(
                "ml-auto",
                isEmpty
                  ? "bg-white hover:bg-white/80 text-muted-foreground"
                  : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              )}
            >
              <MdSend className="h-4 w-4" />
            </Button>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                size={"sm"}
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image: imageRef.current?.files?.[0] || null,
                  })
                }
                disabled={disabled || isEmpty}
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
      {variant === "create" && (
        <div
          className={cn(
            "p-2 flex justify-end text-sm text-muted-foreground opacity-100 transition",
            isEmpty && "opacity-0"
          )}
        >
          <p>
            <strong>Shift + Enter</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
}

export default Editor;
