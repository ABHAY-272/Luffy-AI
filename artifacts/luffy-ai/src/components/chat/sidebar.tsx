import { Plus, MessageSquare, Trash2, Menu, X, Cpu } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useListGeminiConversations, useDeleteGeminiConversation, getListGeminiConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  currentId: number | null;
}

export function ChatSidebar({ currentId }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: conversations, isLoading } = useListGeminiConversations({
    query: {
      queryKey: getListGeminiConversationsQueryKey()
    }
  });

  const { mutate: deleteConv } = useDeleteGeminiConversation();

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConv({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
        if (currentId === id) {
          setLocation("/");
        }
      }
    });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-72 shrink-0 relative overflow-hidden">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="p-6 border-b border-sidebar-border/50 relative z-10">
        <div className="flex items-center gap-3 text-primary mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-lg glow-text">LUFFY AI</h1>
            <p className="text-xs text-primary/60 font-mono tracking-widest uppercase">OS VER 1.0</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setLocation("/")}
          className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 hover:border-primary/60 transition-all glow-cyan"
        >
          <Plus className="w-4 h-4" />
          New Directive
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative z-10 scrollbar-hide">
        <div className="text-xs font-mono text-muted-foreground mb-4 px-2 tracking-widest">ACTIVE PROTOCOLS</div>
        
        {isLoading ? (
          <div className="text-center text-muted-foreground text-sm font-mono animate-pulse py-4">LOADING SYSTEMS...</div>
        ) : conversations?.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm font-mono py-4">NO PROTOCOLS FOUND</div>
        ) : (
          conversations?.map((conv) => (
            <Link key={conv.id} href={`/c/${conv.id}`}>
              <a className={cn(
                "group flex items-center justify-between p-3 rounded-lg text-sm transition-all border border-transparent",
                currentId === conv.id 
                  ? "bg-primary/10 text-primary border-primary/30 shadow-[inset_0_0_10px_rgba(0,255,255,0.1)]" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                  <span className="truncate font-medium">{conv.title || "Untitled Protocol"}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all shrink-0"
                  onClick={(e) => handleDelete(e, conv.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </a>
            </Link>
          ))
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border/50 text-xs text-muted-foreground text-center font-mono relative z-10 tracking-widest">
        CREATED BY ABHAY & DIPANSHU
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(true)} className="bg-background/80 backdrop-blur border-primary/30 text-primary">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="absolute top-0 left-0 bottom-0 w-72 bg-sidebar border-r border-border shadow-2xl transition-transform" onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground z-20" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="hidden md:block h-screen">
        <SidebarContent />
      </div>
    </>
  );
}
