"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { uploadFile, clearDocuments } from "@/lib/api";

interface FileUploadProps {
  onUploadSuccess?: (filename?: string) => void;
  onFileSelect?: (filename: string | null) => void;
  onClearChat?: () => void;
}

export function FileUpload({ onUploadSuccess, onFileSelect, onClearChat }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Clear previous file from vector store if exists
      if (currentFile) {
        try {
          await clearDocuments(currentFile);
          console.log(`Cleared previous file: ${currentFile}`);
        } catch (clearErr) {
          console.error('Error clearing previous file:', clearErr);
        }
      }

      // Clear chat messages
      onClearChat?.();

      const response = await uploadFile(file);
      setUploadedFiles([response.filename]); // Replace with new file only
      setCurrentFile(response.filename);
      setSuccess(
        `Successfully uploaded ${response.filename} (${response.chunks} chunks, ${response.pages} pages)`
      );
      onUploadSuccess?.(response.filename);
      onFileSelect?.(response.filename);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess, onFileSelect, onClearChat, currentFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const removeFile = (filename: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== filename));
    // If removing the selected file, clear selection
    onFileSelect?.(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 md:p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-8 w-8 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
            {isDragActive ? (
              <p className="text-base md:text-lg font-medium">Drop the PDF here...</p>
            ) : (
              <>
                <p className="text-base md:text-lg font-medium mb-2">
                  Drag & drop a PDF file here
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                  or click to select a file
                </p>
                <Button type="button" variant="outline" size="sm" disabled={uploading} className="text-xs md:text-sm">
                  {uploading ? "Uploading..." : "Select PDF"}
                </Button>
              </>
            )}
            <p className="text-xs text-muted-foreground mt-3 md:mt-4">
              Maximum file size: 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-2 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-green-800 dark:text-green-200 break-words">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-800 dark:text-red-200 break-words">{error}</p>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-4 md:pt-6">
            <h3 className="text-xs md:text-sm font-medium mb-3">Uploaded Documents</h3>
            <div className="space-y-2">
              {uploadedFiles.map((filename, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 md:p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <File className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs md:text-sm truncate">{filename}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      removeFile(filename);
                    }}
                    className="h-7 w-7 md:h-8 md:w-8 flex-shrink-0"
                    title="Remove from list (does not delete from server)"
                  >
                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
