"use client";

import React, { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ChatWindow, Message } from "@/components/ChatWindow";
import { MessageInput } from "@/components/MessageInput";
import { sendChatMessage, getStatus } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare } from "lucide-react";

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
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">RAG Chatbot</h1>
          <p className="text-muted-foreground">
            Upload PDF documents and ask questions using AI-powered retrieval augmented generation
          </p>
        </div>

        {/* Status Bar */}
        {documentCount > 0 && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {documentCount} document chunk{documentCount !== 1 ? "s" : ""} loaded
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - File Upload */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Upload Document
                </CardTitle>
                <CardDescription>
                  Upload a PDF file to start asking questions
                </CardDescription>
              </CardHeader>
              <CardContent>
               <FileUpload onUploadSuccess={handleUploadSuccess} onFileSelect={setSelectedFile} />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How to use</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Upload a PDF document using the upload area above</li>
                  <li>Wait for the document to be processed</li>
                  <li>Ask questions about the document in the chat</li>
                  <li>View the AI's answers with source citations</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </CardTitle>
                <CardDescription>
                  Ask questions about your uploaded documents
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Chat Window */}
            <div className="h-[500px]">
              <ChatWindow messages={messages} />
            </div>

            {/* Active Document Indicator */}
            {selectedFile && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-800 dark:text-blue-200">
                📄 Searching in: <span className="font-semibold">{selectedFile}</span>
              </div>
            )}

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!hasDocuments}
              loading={loading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Powered by Groq (Llama 3.3 70B) • ChromaDB • Next.js
          </p>
        </div>
      </div>
    </main>
  );
}
