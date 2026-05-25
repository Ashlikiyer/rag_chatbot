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
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={
              disabled
                ? "Upload a document first..."
                : "Ask a question about your document..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || loading}
            className="flex-1"
          />
          <Button
            onClick={handleSubmit}
            disabled={disabled || loading || !message.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </CardContent>
    </Card>
  );
}
