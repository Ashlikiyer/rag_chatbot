import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  question: string;
  sessionId?: string;
  filename?: string;
}

export interface ChatResponse {
  success: boolean;
  answer: string;
  sources: Array<{
    text: string;
    metadata: {
      filename: string;
      chunkIndex: number;
      [key: string]: any;
    };
  }>;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  filename: string;
  chunks: number;
  pages: number;
}

export interface StatusResponse {
  status: string;
  documentCount: number;
}

/**
 * Upload a PDF file to the backend
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadResponse>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Send a chat message and get a response
 * @param message - Chat message with optional filename to filter results
 */
export async function sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
  const payload = {
    question: message.question,
    sessionId: message.sessionId || 'default',
    filename: message.filename || undefined
  };
  
  console.log('[API] Sending chat message with payload:', payload);
  
  const response = await api.post<ChatResponse>('/api/chat', payload);
  return response.data;
}

/**
 * Get the status of the backend
 */
export async function getStatus(): Promise<StatusResponse> {
  const response = await api.get<StatusResponse>('/status');
  return response.data;
}

export default api;
