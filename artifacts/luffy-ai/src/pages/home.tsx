import { useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { ChatSidebar } from "@/components/chat/sidebar";
import { Message } from "@/components/chat/message";
import { InputArea } from "@/components/chat/input";
import { useChat } from "@/hooks/use-chat";
import { Cpu } from "lucide-react";

export default function Home() {
  const [match, params] = useRoute("/c/:id");
  const conversationId = match ? parseInt(params?.id || "0") : null;
  const [, setLocation] = useLocation();

  const {
    messages,
    isMessagesLoading,
    streamingContent,
    isStreaming,
    sendMessage,
    voiceOutputEnabled,
    toggleVoice,
    isListening,
    startListening,
    stopListening,
    speak
  } = useChat({ conversationId: conversationId || null });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Initial greeting when starting a new chat
  useEffect(() => {
    if (!conversationId && !isMessagesLoading && (!messages || messages.length === 0)) {
      const greeting = "Luffy AI at your service. How can I assist you, Sir?";
      if (voiceOutputEnabled) {
        // Optional: play audio automatically, though browser may block it without interaction
      }
    }
  }, [conversationId, isMessagesLoading, messages, voiceOutputEnabled]);

  const handleSend = async (content: string) => {
    const newId = await sendMessage(content);
    if (newId && newId !== conversationId) {
      setLocation(`/c/${newId}`);
    }
  };

  const showGreeting = !conversationId && (!messages || messages.length === 0) && !isStreaming;

  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden selection:bg-primary/30 selection:text-primary-foreground font-sans">
      <ChatSidebar currentId={conversationId || null} />
      
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide relative z-10">
          <div className="max-w-4xl mx-auto space-y-6 pb-32">
            
            {showGreeting && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-1000">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan shadow-[0_0_30px_rgba(0,255,255,0.2)] mb-4">
                  <Cpu className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-wider glow-text">SYSTEM ONLINE</h2>
                <p className="text-xl text-muted-foreground font-mono">
                  Luffy AI at your service. How can I assist you, Sir?
                </p>
              </div>
            )}

            {messages?.map((msg) => (
              <Message
                key={msg.id}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
              />
            ))}

            {streamingContent && (
              <Message
                role="assistant"
                content={streamingContent}
                isStreaming={true}
              />
            )}

            {isMessagesLoading && !showGreeting && (
              <div className="flex justify-center py-8">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background/80 to-transparent z-20">
          <InputArea 
            onSend={handleSend}
            isStreaming={isStreaming}
            voiceEnabled={voiceOutputEnabled}
            onToggleVoice={toggleVoice}
            isListening={isListening}
            onStartListening={startListening}
            onStopListening={stopListening}
          />
        </div>
      </main>
    </div>
  );
}
