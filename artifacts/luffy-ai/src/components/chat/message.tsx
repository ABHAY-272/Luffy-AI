import { MarkdownRenderer } from "./markdown";
import { Bot, User } from "lucide-react";
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
        "flex w-full p-4 md:p-6 gap-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
        isUser
          ? "bg-secondary/30 ml-auto max-w-3xl border border-border/50"
          : "bg-background border border-primary/20 glow-cyan max-w-4xl"
      )}
    >
      {/* Decorative scanline for assistant */}
      {!isUser && (
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      )}

      <div
        className={cn(
          "w-10 h-10 shrink-0 rounded-full flex items-center justify-center border z-10",
          isUser
            ? "bg-secondary text-secondary-foreground border-border"
            : "bg-primary/10 text-primary border-primary/50 shadow-[0_0_10px_rgba(0,255,255,0.4)]"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0 z-10 pt-1">
        {isUser ? (
          <div className="text-foreground whitespace-pre-wrap">{content}</div>
        ) : (
          <div className="relative">
            <MarkdownRenderer content={content} />
            {isStreaming && <span className="typewriter-cursor" />}
          </div>
        )}
      </div>
    </div>
  );
}
