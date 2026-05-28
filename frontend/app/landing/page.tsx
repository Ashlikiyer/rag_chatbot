"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Upload, Sparkles, Zap, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <Upload className="h-4 w-4 text-white dark:text-slate-900" />
            </div>
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              Document Assistant
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/chat")}
            className="text-sm"
          >
            Try it free
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          Get instant answers from your documents
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          Upload any PDF and ask questions. Our AI reads, understands, and provides accurate answers in seconds.
        </p>
        <Button
          size="lg"
          onClick={() => router.push("/chat")}
          className="h-12 px-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900"
        >
          Get started for free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">
          No credit card required • Process up to 10MB
        </p>
      </section>

      {/* Demo Preview */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <div className="bg-slate-50 dark:bg-slate-900 p-8">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="flex-1">
                    <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl px-4 py-2 inline-block text-sm">
                      What are the main findings in this research paper?
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white dark:text-slate-900" />
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                    The research paper presents three main findings: 1) AI models show 47% improvement in accuracy when fine-tuned on domain-specific data, 2) Performance scales logarithmically with dataset size, and 3) Transfer learning reduces training time by 60%...
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything you need to understand your documents
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Powerful AI technology that makes document analysis simple and accessible
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Easy Upload
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Simply drag and drop your PDF files. We'll process them instantly and make them ready for questions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Smart Analysis
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Advanced AI reads and understands your documents, providing accurate and contextual answers to your questions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white dark:text-slate-900" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Instant Results
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get answers in seconds. No more scrolling through pages trying to find what you need.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Get started in three simple steps
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Upload your document
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Drag and drop any PDF file or click to browse. We support documents up to 10MB.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  AI processes your content
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Our AI reads and indexes your document, understanding the context and relationships.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Ask questions and get answers
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Start chatting with your document. Get summaries, extract key points, or ask specific questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Ready to understand your documents?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Start getting instant answers from your PDFs in seconds
        </p>
        <Button
          size="lg"
          onClick={() => router.push("/chat")}
          className="h-12 px-8 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900"
        >
          Get started for free
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <Upload className="h-3 w-3 text-white dark:text-slate-900" />
            </div>
            <span>Document Assistant</span>
          </div>
          <p>© 2026 Document Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}