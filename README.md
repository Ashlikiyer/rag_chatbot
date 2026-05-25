# RAG Chatbot - AI Document Q&A Platform

A full-stack RAG (Retrieval-Augmented Generation) chatbot that allows users to upload PDF documents and ask questions about them using natural language. Built with Next.js, Express.js, ChromaDB, and Groq's Llama 3.1 70B model.

## 🎯 Project Overview

This project implements a complete RAG pipeline from scratch:
- **Document Ingestion**: Upload PDFs, extract text, chunk into manageable pieces
- **Vector Embeddings**: Convert text chunks into vector representations
- **Semantic Search**: Find relevant chunks using similarity search
- **LLM Generation**: Generate accurate answers using Groq's Llama 3.1 70B

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Next.js   │ ───> │   Express    │ ───> │  ChromaDB   │
│  Frontend   │      │   Backend    │      │ Vector Store│
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Groq API    │
                     │ (Llama 3.1)  │
                     └──────────────┘
```

## 🚀 Current Status

### ✅ Completed (Phases 0-3)

**Backend Infrastructure:**
- ✅ Express.js REST API server
- ✅ PDF upload and processing pipeline
- ✅ Text chunking with LangChain (500 tokens, 50 overlap)
- ✅ Vector embedding generation
- ✅ ChromaDB integration for vector storage
- ✅ Groq LLM integration (Llama 3.1 70B)
- ✅ Chat API with streaming support
- ✅ Source citation tracking

**API Endpoints:**
- `GET /` - Health check
- `POST /api/upload` - Upload and process PDF
- `POST /api/chat` - Ask questions about uploaded documents
- `GET /api/chat/status` - Get vector store status

### 🔄 In Progress (Phase 4)

**Frontend Development:**
- Next.js 15 with TypeScript
- TailwindCSS + ShadCN UI components
- File upload interface
- Real-time chat UI
- Markdown rendering for responses

### 📋 Upcoming (Phases 5-6)

- Pinecone integration for production
- Deployment to Vercel (frontend) + Render (backend)
- Multi-document support
- Conversation memory
- Usage metrics and admin dashboard

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 24.13.0
- **Framework**: Express.js 5.2.1
- **AI/ML**: 
  - Groq SDK (Llama 3.1 70B)
  - LangChain.js
  - ChromaDB (vector database)
- **File Processing**: Multer, pdf-parse
- **Environment**: dotenv, cors

### Frontend (Planned)
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: ShadCN UI
- **HTTP Client**: Axios
- **Markdown**: react-markdown

## 📦 Installation

### Prerequisites
- Node.js 20+ 
- Python 3.10+ (for ChromaDB)
- Groq API key

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd chatbot
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

4. **Start the backend server**
```bash
npm start
```

Server will run on `http://localhost:3001`

## 🔑 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
VECTOR_STORE=chroma
PINECONE_API_KEY=your_pinecone_key_here  # For production
PINECONE_INDEX=rag-docs                   # For production
```

## 📖 API Documentation

### Upload PDF
```bash
POST /api/upload
Content-Type: multipart/form-data

# Example with curl
curl -X POST http://localhost:3001/api/upload \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "File processed successfully",
  "filename": "document.pdf",
  "chunks": 45,
  "pages": 10
}
```

### Ask Question
```bash
POST /api/chat
Content-Type: application/json

{
  "question": "What is the main topic of the document?",
  "stream": false
}
```

**Response:**
```json
{
  "answer": "The main topic is...",
  "sources": [
    {
      "filename": "document.pdf",
      "chunkIndex": 3,
      "distance": 0.234
    }
  ]
}
```

### Get Status
```bash
GET /api/chat/status
```

**Response:**
```json
{
  "status": "ready",
  "documentCount": 45,
  "message": "45 document chunks available"
}
```

## 📁 Project Structure

```
chatbot/
├── backend/
│   ├── index.js                 # Express server entry point
│   ├── routes/
│   │   ├── upload.js           # PDF upload endpoint
│   │   └── chat.js             # Chat endpoint
│   ├── services/
│   │   ├── chunker.js          # Text chunking logic
│   │   ├── embedder.js         # Embedding generation
│   │   ├── vectorStore.js      # ChromaDB operations
│   │   └── llm.js              # Groq LLM integration
│   ├── middleware/
│   │   └── upload.js           # Multer configuration
│   ├── uploads/                # Temporary file storage
│   ├── .env                    # Environment variables (not in git)
│   ├── .env.example            # Environment template
│   └── package.json
│
├── frontend/                    # (Coming in Phase 4)
│   └── ...
│
├── .gitignore
├── README.md
├── IMPLEMENTATION_TRACKER.md    # Detailed progress tracker
└── Project1_RAG_Chatbot_Documentation.md
```

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:3001/
```

### Test PDF Upload
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@sample.pdf"
```

### Test Chat
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is this document about?"}'
```

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ RAG pipeline implementation from scratch
- ✅ Vector database integration (ChromaDB)
- ✅ LLM API integration (Groq)
- ✅ Document processing and chunking strategies
- ✅ RESTful API design
- ✅ File upload handling
- ✅ Streaming responses
- ✅ Error handling and validation

## 📚 Resources

- [Project Documentation](./Project1_RAG_Chatbot_Documentation.md)
- [Implementation Tracker](./IMPLEMENTATION_TRACKER.md)
- [Groq API Docs](https://console.groq.com/docs)
- [LangChain.js Docs](https://js.langchain.com/)
- [ChromaDB Docs](https://docs.trychroma.com/)

## 🤝 Contributing

This is a portfolio/learning project. Feel free to fork and experiment!

## 📝 License

ISC

## 👤 Author

**Ashley Kier Ferreol**
- GitHub: [@Ashlikiyer](https://github.com/Ashlikiyer)
- School: Gordon College, Olongapo
- Program: BSCS (Expected Jul. 2026)

---

**Status**: 🟢 Backend Complete | 🟡 Frontend In Progress  
**Last Updated**: May 22, 2026
