import { useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { ChatSidebar } from "@/components/chat/sidebar";
import { Message } from "@/components/chat/message";
import { InputArea } from "@/components/chat/input";
import { useChat } from "@/hooks/use-chat";
import { FileText, Code2, BookOpen, Sparkles } from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: FileText,
    title: "PDF to Quiz",
    description: "Paste text from your notes. Get MCQs with explanations instantly.",
    prompt: "Convert this text into a structured quiz with MCQs and explanations:",
    color: "from-violet-500/10 to-purple-600/10",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Code2,
    title: "Code Debugger",
    description: "Paste your Java, C++ or Python code. Get clean fixes and explanations.",
    prompt: "Debug and explain this code step by step:\n\n",
    color: "from-cyan-500/10 to-blue-600/10",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    icon: BookOpen,
    title: "BCA Study Assistant",
    description: "Ask about any BCA subject — Networking, DBMS, OS, or Web Dev.",
    prompt: "Explain this BCA concept in detail with examples: ",
    color: "from-emerald-500/10 to-teal-600/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
];

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
  } = useChat({ conversationId: conversationId || null });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = async (content: string) => {
    const newId = await sendMessage(content);
    if (newId && newId !== conversationId) {
      setLocation(`/c/${newId}`);
    }
  };

  const showGreeting =
    !conversationId &&
    (!messages || messages.length === 0) &&
    !isStreaming;

  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden">
      <ChatSidebar currentId={conversationId || null} />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto" data-testid="chat-scroll-area">
          <div className="max-w-3xl mx-auto px-4 md:px-6 pt-6 pb-36 space-y-6">

            {/* Welcome screen */}
            {showGreeting && (
              <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-8 text-center">
                {/* Icon + Greeting */}
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/25">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                    Luffy AI at your service.
                  </h1>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    How can I assist you today, Sir? Choose a quick action or type your question below.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
                  {FEATURE_CARDS.map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.title}
                        data-testid={`card-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => handleSend(card.prompt)}
                        className={`feature-card text-left p-4 rounded-xl border bg-gradient-to-br ${card.color} ${card.border} hover:bg-card/80 transition-all duration-200 group cursor-pointer`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-background/40 flex items-center justify-center mb-3 ${card.iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <p className="font-medium text-sm text-foreground mb-1">{card.title}</p>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">{card.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {isMessagesLoading && !showGreeting && (
              <div className="space-y-4 pt-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages?.map((msg) => (
              <Message
                key={msg.id}
                role={msg.role as "user" | "assistant"}
                content={msg.content}
              />
            ))}

            {/* Streaming */}
            {streamingContent && (
              <Message role="assistant" content={streamingContent} isStreaming />
            )}

            {/* Typing indicator while waiting for first chunk */}
            {isStreaming && !streamingContent && (
              <div className="flex gap-4 msg-animate">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating input bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pt-8 pb-5 px-4">
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
