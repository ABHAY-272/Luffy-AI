import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  useListGeminiMessages,
  getListGeminiMessagesQueryKey,
  GeminiMessage,
  useCreateGeminiConversation,
  useListGeminiConversations,
  getListGeminiConversationsQueryKey,
} from "@workspace/api-client-react";

interface UseChatOptions {
  conversationId: number | null;
}

export function useChat({ conversationId }: UseChatOptions) {
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading: isMessagesLoading } = useListGeminiMessages(
    conversationId || 0,
    {
      query: {
        enabled: !!conversationId,
        queryKey: getListGeminiMessagesQueryKey(conversationId || 0),
      },
    }
  );

  const { mutateAsync: createConversation } = useCreateGeminiConversation();

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      // Load voices
      synthRef.current.getVoices();
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";
      }
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceOutputEnabled || !synthRef.current) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    
    // Try to find Google UK English Male, fallback to any English male, or default
    const preferredVoice = voices.find(v => v.name === "Google UK English Male") ||
                           voices.find(v => v.lang.includes("en") && v.name.toLowerCase().includes("male")) ||
                           voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.pitch = 0.9;
    utterance.rate = 1.05;
    
    synthRef.current.speak(utterance);
  }, [voiceOutputEnabled]);

  const toggleVoice = () => {
    setVoiceOutputEnabled(prev => {
      const next = !prev;
      if (!next && synthRef.current) {
        synthRef.current.cancel();
      }
      return next;
    });
  };

  const startListening = (onResult: (text: string) => void) => {
    if (!recognitionRef.current) {
      toast({ title: "Speech recognition not supported", variant: "destructive" });
      return;
    }

    setIsListening(true);
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      toast({ title: `Microphone error: ${event.error}`, variant: "destructive" });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const sendMessage = async (content: string, cid: number | null = conversationId) => {
    if (!content.trim()) return null;
    
    let targetCid = cid;
    
    // Create conversation if none exists
    if (!targetCid) {
      try {
        const newConv = await createConversation({ data: { title: content.slice(0, 30) + "..." } });
        targetCid = newConv.id;
        queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
      } catch (err) {
        toast({ title: "Failed to create conversation", variant: "destructive" });
        return null;
      }
    }

    // Optimistically add user message to UI
    const tempUserMessage: GeminiMessage = {
      id: Date.now(),
      conversationId: targetCid,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };

    queryClient.setQueryData(
      getListGeminiMessagesQueryKey(targetCid),
      (old: GeminiMessage[] | undefined) => [...(old || []), tempUserMessage]
    );

    setIsStreaming(true);
    setStreamingContent("");
    let fullResponse = "";

    try {
      const response = await fetch(`/api/gemini/conversations/${targetCid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                fullResponse += data.content;
                setStreamingContent(prev => prev + data.content);
              }
              if (data.done) {
                // Done, let the finally block handle cleanup
              }
            } catch (e) {
              console.error("Error parsing SSE chunk", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      toast({ title: "Failed to get response", variant: "destructive" });
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      
      // Speak the response if voice is enabled
      if (fullResponse) {
        speak(fullResponse);
      }

      // Invalidate to get the real messages from DB
      queryClient.invalidateQueries({ queryKey: getListGeminiMessagesQueryKey(targetCid) });
    }
    
    return targetCid;
  };

  return {
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
  };
}
