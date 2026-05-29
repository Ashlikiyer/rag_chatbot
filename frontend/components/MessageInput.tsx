"use client";

import React, { useState, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function MessageInput({
  onSendMessage,
  disabled = false,
  loading = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() && !disabled && !loading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 md:gap-3 items-center">
      <Input
        type="text"
        placeholder={
          disabled
            ? "Upload a document to start..."
            : "Ask a question..."
        }
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled || loading}
        className="flex-1 border-slate-300 dark:border-slate-700 focus-visible:ring-1 focus-visible:ring-slate-400 rounded-lg h-10 md:h-11 px-3 md:px-4 text-sm"
      />
      <Button
        onClick={handleSubmit}
        disabled={disabled || loading || !message.trim()}
        size="icon"
        className="h-10 w-10 md:h-11 md:w-11 rounded-lg bg-slate-700 hover:bg-slate-800 dark:bg-slate-200 dark:hover:bg-slate-300 transition-colors disabled:opacity-50 shrink-0"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-white dark:text-slate-900" />
        ) : (
          <Send className="h-4 w-4 text-white dark:text-slate-900" />
        )}
      </Button>
    </div>
  );
}
