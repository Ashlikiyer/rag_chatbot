 "use client";

import React, { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ChatWindow, Message } from "@/components/ChatWindow";
import { MessageInput } from "@/components/MessageInput";
import { sendChatMessage, getStatus, clearDocuments } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Check if documents are uploaded
  const checkStatus = async () => {
    try {
      const status = await getStatus();
      setHasDocuments(status.documentCount > 0);
      setDocumentCount(status.documentCount);
    } catch (error) {
      console.error("Failed to check status:", error);
      // Don't block the app if status check fails
      // User can still upload and use the app
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    console.log('[PAGE] Selected file before sending:', selectedFile);
    console.log('[PAGE] Sending message with filename:', selectedFile || 'NO FILENAME');

    try {
      const response = await sendChatMessage({
        question: content,
        sessionId: "default",
        filename: selectedFile ?? undefined,
      });
      
      console.log('[PAGE] Response received:', response);

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: `Error: ${error.response?.data?.message || "Failed to get response. Please try again."}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (filename?: string) => {
    checkStatus();
    if (filename) {
      setSelectedFile(filename);
      // Add welcome message for new document
      const welcomeMessage: Message = {
        role: "assistant",
        content: `Document uploaded! Ask me anything about **${filename}**.`,
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleManualClear = async () => {
    // Clear chat messages
    setMessages([]);
    
    // Clear selected file from vector store if exists
    if (selectedFile) {
      try {
        await clearDocuments(selectedFile);
        console.log(`Manually cleared: ${selectedFile}`);
      } catch (error) {
        console.error('Error clearing documents:', error);
      }
    }
    
    // Reset state
    setSelectedFile(null);
    setHasDocuments(false);
    checkStatus();
  };

  return (
    <main className="h-screen overflow-hidden bg-white dark:bg-slate-950 flex">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Document Assistant
            </h1>
          </div>
        </div>

        {/* Documents Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4" />
              Documents
            </h2>
          </div>
          
          <FileUpload 
            onUploadSuccess={handleUploadSuccess} 
            onFileSelect={setSelectedFile}
            onClearChat={handleClearChat}
          />
          
          {/* Status and Clear Button */}
          {documentCount > 0 && (
            <div className="mt-4 space-y-2">
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                {documentCount} chunks ready
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualClear}
                className="w-full text-xs"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Clear Chat
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow messages={messages} />
        </div>

        {/* Active Document Indicator */}
        {selectedFile && (
          <div className="px-6 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-600 dark:text-slate-400">
            <FileText className="h-3.5 w-3.5 inline mr-2" />
            Searching in: <span className="font-medium text-slate-900 dark:text-white">{selectedFile}</span>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-6">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!hasDocuments}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
}
