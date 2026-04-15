import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface InputAreaProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  isListening: boolean;
  onStartListening: (cb: (text: string) => void) => void;
  onStopListening: () => void;
}

export function InputArea({
  onSend,
  isStreaming,
  voiceEnabled,
  onToggleVoice,
  isListening,
  onStartListening,
  onStopListening,
}: InputAreaProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening((text) => {
        setInput((prev) => (prev ? prev + " " + text : text));
      });
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Glassmorphic input container */}
      <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-lg shadow-black/20 focus-within:border-primary/40 transition-colors duration-200">
        {/* Text area */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Luffy AI anything..."
          disabled={isStreaming}
          data-testid="input-message"
          className="min-h-[52px] max-h-[160px] bg-transparent border-none focus-visible:ring-0 resize-none px-4 pt-3.5 pb-12 text-sm text-foreground placeholder:text-muted-foreground leading-relaxed"
          rows={1}
        />

        {/* Bottom toolbar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-2.5">
          {/* Left tools */}
          <div className="flex items-center gap-1">
            {/* PDF Upload */}
            <button
              title="Upload PDF"
              data-testid="button-upload-pdf"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Input */}
            <button
              onClick={handleVoiceInput}
              title={isListening ? "Stop listening" : "Voice input"}
              data-testid="button-voice-input"
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                isListening
                  ? "text-red-400 bg-red-500/10 animate-pulse"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Voice Output */}
            <button
              onClick={onToggleVoice}
              title={voiceEnabled ? "Mute voice" : "Enable voice"}
              data-testid="button-toggle-voice"
              className={cn(
                "p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1",
                voiceEnabled
                  ? "text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            data-testid="button-send"
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
              input.trim() && !isStreaming
                ? "bg-primary text-primary-foreground hover:opacity-90 shadow-sm shadow-primary/30"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground mt-2">
        Luffy AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
