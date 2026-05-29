"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, FileText, ChevronDown } from "lucide-react";
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
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSourceExpanded = (messageIndex: number) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageIndex)) {
        newSet.delete(messageIndex);
      } else {
        newSet.add(messageIndex);
      }
      return newSet;
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-slate-950 px-4">
        <div className="text-center">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center mx-auto mb-4 md:mb-6">
            <FileText className="h-6 w-6 md:h-8 md:w-8 text-white dark:text-slate-900" />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white mb-2">
            Upload a document to start
          </h3>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md">
            Upload a PDF to get instant AI-powered answers and insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {messages.map((message, index) => (
          <div key={index} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Message */}
            <div
              className={`flex gap-2 md:gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="shrink-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm ${
                  message.role === "user"
                    ? "bg-linear-to-br from-blue-600 to-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none *:text-sm md:*:text-base">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm md:text-base wrap-break-word">{message.content}</p>
                )}
              </div>
              {message.role === "user" && (
                <div className="shrink-0 w-7 h-7 md:w-9 md:h-9 rounded-full bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
              )}
            </div>

            {/* Sources */}
            {message.sources && message.sources.length > 0 && (() => {
              // Deduplicate sources by filename and chunkIndex
              const uniqueSources = message.sources.filter((source, idx, self) =>
                idx === self.findIndex(s =>
                  (s.metadata?.filename ?? s.filename) === (source.metadata?.filename ?? source.filename) &&
                  (s.metadata?.chunkIndex ?? s.chunkIndex) === (source.metadata?.chunkIndex ?? source.chunkIndex)
                )
              );
              
              const isExpanded = expandedSources.has(index);
              
              return (
                <div className="ml-9 md:ml-12">
                  <button
                    onClick={() => toggleSourceExpanded(index)}
                    className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors py-1 px-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <ChevronDown
                      className={`h-3 w-3 md:h-3.5 md:w-3.5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                    📄 View Sources ({uniqueSources.length})
                  </button>
                  
                  {isExpanded && (
                    <div className="space-y-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      {uniqueSources.map((source, sourceIndex) => (
                        <div
                          key={sourceIndex}
                          className="text-xs bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-lg p-2.5 md:p-3 border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 flex-wrap">
                            <FileText className="h-3 w-3 md:h-3.5 md:w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs wrap-break-word">
                              {(source.metadata?.filename ?? source.filename ?? "Unknown file")} 
                              <span className="text-slate-500 dark:text-slate-400 font-normal ml-1">
                                (Chunk {(source.metadata?.chunkIndex ?? source.chunkIndex ?? "N/A")})
                              </span>
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-3 md:line-clamp-2 leading-relaxed text-xs">
                            {source.text ?? "No source preview available."}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
