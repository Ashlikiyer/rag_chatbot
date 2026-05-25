# RAG Chatbot Backend

Express.js backend server for the RAG (Retrieval-Augmented Generation) Chatbot.

## Features

- PDF document upload and processing
- Text chunking with LangChain
- Vector embeddings generation
- ChromaDB vector storage
- Groq LLM integration (Llama 3.1 70B)
- RESTful API endpoints
- Streaming chat responses

## Prerequisites

- Node.js 20+
- Python 3.10+ (for ChromaDB)
- Groq API key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Add your Groq API key to `.env`:
```
GROQ_API_KEY=your_actual_groq_api_key_here
```

## Running the Server

```bash
npm start
```

Server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /
```

### Upload PDF
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (PDF)
```

### Chat
```
POST /api/chat
Content-Type: application/json
Body: {
  "question": "Your question here",
  "stream": false
}
```

### Get Status
```
GET /api/chat/status
```

## Project Structure

```
backend/
├── index.js              # Express server entry point
├── routes/
│   ├── upload.js         # PDF upload endpoint
│   └── chat.js           # Chat endpoint
├── services/
│   ├── chunker.js        # Text chunking
│   ├── embedder.js       # Embedding generation
│   ├── vectorStore.js    # ChromaDB operations
│   └── llm.js            # Groq LLM integration
├── middleware/
│   └── upload.js         # Multer file upload config
└── uploads/              # Temporary file storage
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `GROQ_API_KEY` - Groq API key (required)
- `VECTOR_STORE` - Vector store type: 'chroma' or 'pinecone'
- `PINECONE_API_KEY` - Pinecone API key (for production)
- `PINECONE_INDEX` - Pinecone index name

## Development

The backend uses:
- Express.js for REST API
- Multer for file uploads
- pdf-parse for PDF text extraction
- LangChain for text chunking
- ChromaDB for vector storage
- Groq SDK for LLM calls
