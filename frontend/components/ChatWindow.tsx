"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, FileText } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    text?: string;
    metadata?: {
      filename?: string;
      chunkIndex?: number;
    };
    filename?: string;
    chunkIndex?: number;
    distance?: number;
  }>;
}

interface ChatWindowProps {
  messages: Message[];
}

export function ChatWindow({ messages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload a PDF document and start asking questions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div key={index} className="space-y-3">
            {/* Message */}
            <div
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (
              <div className="ml-11 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Sources:
                </p>
                {message.sources.map((source, sourceIndex) => (
                  <div
                    key={sourceIndex}
                    className="text-xs bg-muted/50 rounded p-3 border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">
                        {(source.metadata?.filename ?? source.filename ?? "Unknown file")} (Chunk{" "}
                        {(source.metadata?.chunkIndex ?? source.chunkIndex ?? "N/A")})
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2">
                      {source.text ?? "No source preview available."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
    </Card>
  );
}
