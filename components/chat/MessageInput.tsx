"use client";

import React, { useState } from "react";
import { Send, Plus, Smile, AtSign } from "lucide-react";

export default function MessageInput({ onSend, placeholder, disabled }: { onSend: (text: string) => Promise<void> | void; placeholder?: string; disabled?: boolean }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSend(message);
      setMessage("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setIsSending(false);
    }
  };

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  return (
    <div className="p-4 bg-card/50 border-t border-border backdrop-blur-sm">
      <div className="relative bg-input border border-border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm px-4 py-3 min-h-[48px] max-h-32 resize-none focus:outline-none custom-scrollbar"
          rows={1}
        />

        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-1">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" title="Add attachment">
              <Plus className="w-5 h-5" />
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" title="Emoji">
              <Smile className="w-4 h-4" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" title="Mention">
              <AtSign className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled || isSending}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${!message.trim() || disabled || isSending
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-gradient-to-r from-[hsl(174,72%,45%)] to-[hsl(186,72%,55%)] text-primary-foreground shadow-md hover:shadow-lg hover:opacity-90 active:scale-95"
              }
            `}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-primary">Tip:</span> Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
