import { Mic, MicOff, Send, Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onStopListening
}: InputAreaProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input);
    setInput("");
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
        setInput(prev => prev ? prev + " " + text : text);
      });
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  return (
    <div className="relative max-w-4xl mx-auto w-full">
      <div className="absolute -top-10 left-0 right-0 flex justify-end px-4 gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVoice}
          className={cn(
            "rounded-full transition-all duration-300",
            voiceEnabled ? "text-primary glow-text" : "text-muted-foreground"
          )}
          title={voiceEnabled ? "Mute Voice Output" : "Enable Voice Output"}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
          {voiceEnabled ? "Voice ON" : "Voice OFF"}
        </Button>
      </div>

      <div className="relative group bg-background/50 backdrop-blur-xl rounded-2xl border border-primary/30 p-2 shadow-[0_0_20px_rgba(0,255,255,0.05)] focus-within:shadow-[0_0_30px_rgba(0,255,255,0.15)] transition-all duration-500">
        {/* Glow border effect */}
        <div className="absolute inset-0 rounded-2xl border border-primary/50 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none glow-cyan" />
        
        <div className="flex items-end gap-2 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVoiceInput}
            className={cn(
              "rounded-full shrink-0 transition-colors",
              isListening ? "text-destructive animate-pulse bg-destructive/10" : "text-primary hover:bg-primary/10"
            )}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="System awaiting input..."
            className="min-h-[44px] max-h-[200px] bg-transparent border-none focus-visible:ring-0 resize-none p-2 text-foreground placeholder:text-muted-foreground font-mono text-sm"
            rows={1}
            disabled={isStreaming}
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="rounded-full shrink-0 bg-primary/20 text-primary border border-primary/50 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(0,255,255,0.8)] transition-all duration-300"
          >
            {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      
      <div className="text-center mt-2 text-xs text-primary/60 font-mono tracking-widest uppercase opacity-70">
        LUFFY OS VER 1.0 // B.C.A CO-PILOT
      </div>
    </div>
  );
}
