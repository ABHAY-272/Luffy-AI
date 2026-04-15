import { Plus, MessageSquare, Trash2, Menu, X, Sparkles, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  useListGeminiConversations,
  useDeleteGeminiConversation,
  getListGeminiConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SettingsModal } from "./settings-modal";

interface SidebarProps {
  currentId: number | null;
}

function LuffyLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="font-semibold text-sm text-foreground tracking-tight">Luffy AI</p>
        <p className="text-[10px] text-muted-foreground">BCA Co-Pilot</p>
      </div>
    </div>
  );
}

export function ChatSidebar({ currentId }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useListGeminiConversations({
    query: { queryKey: getListGeminiConversationsQueryKey() },
  });

  const { mutate: deleteConv } = useDeleteGeminiConversation();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConv(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
          if (currentId === id) setLocation("/");
        },
      }
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full w-64 shrink-0 bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <LuffyLogo />
      </div>

      {/* New Chat */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={() => { setLocation("/"); setIsOpen(false); }}
          data-testid="button-new-chat"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors border border-transparent hover:border-border"
        >
          <Plus className="w-4 h-4 shrink-0" />
          New Chat
        </button>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto px-3 py-1 min-h-0">
        <p className="text-[11px] font-medium text-muted-foreground px-2 mb-1.5 uppercase tracking-wider">
          Recent Chats
        </p>

        {isLoading ? (
          <div className="space-y-1 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded-md bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : conversations?.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-3">No chats yet. Start a conversation!</p>
        ) : (
          <div className="space-y-0.5">
            {conversations?.map((conv) => (
              <Link key={conv.id} href={`/c/${conv.id}`}>
                <a
                  data-testid={`link-conv-${conv.id}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-colors cursor-pointer",
                    currentId === conv.id
                      ? "bg-accent text-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 overflow-hidden min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span className="truncate text-[13px]">{conv.title || "Untitled Chat"}</span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-destructive transition-all shrink-0"
                    onClick={(e) => handleDelete(e, conv.id)}
                    data-testid={`button-delete-conv-${conv.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-0.5">
        {/* Settings row */}
        <button
          onClick={() => setSettingsOpen(true)}
          data-testid="button-settings"
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0 opacity-70" />
          <span className="text-[13px]">Settings</span>
        </button>

        {/* Credits */}
        <div className="px-2.5 py-2.5 mt-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/15">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Crafted with precision by
          </p>
          <p className="text-[12px] font-semibold text-cyan-400 mt-0.5">
            Abhay Sir & Dipanshu Sir
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Mobile toggle */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsOpen(true)}
          data-testid="button-open-sidebar"
          className="p-2 rounded-lg bg-background/90 backdrop-blur border border-border text-foreground shadow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute top-0 left-0 bottom-0 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen">
        <SidebarContent />
      </div>
    </>
  );
}
