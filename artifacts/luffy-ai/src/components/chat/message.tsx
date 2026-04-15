import { MarkdownRenderer } from "./markdown";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function Message({ role, content, isStreaming }: MessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "group flex gap-4 w-full msg-animate",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          isUser
            ? "bg-secondary border border-border text-muted-foreground"
            : "bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-md shadow-cyan-500/20"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[75%]",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm ml-auto"
            : "bg-card border border-border text-foreground rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div>
            <MarkdownRenderer content={content} />
            {isStreaming && <span className="typewriter-cursor" />}
          </div>
        )}
      </div>
    </div>
  );
}
