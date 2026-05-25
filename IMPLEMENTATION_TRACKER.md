# RAG Chatbot - Implementation Tracker
**Project:** Personal RAG Chatbot — AI Document Q&A Platform  
**Timeline:** 1-2 Weeks  
**Started:** May 22, 2026

---

## 📋 Implementation Phases Checklist

### Phase 0 — Project Planning & Setup
- [x] Read project documentation
- [x] Create implementation tracker with checkboxes
- [x] Review tech stack requirements
- [x] Set up project repository structure

---

### Phase 1 — Environment Setup (~2 hours)
**Goal:** Install all tools, get API keys, confirm everything runs

#### System Requirements
- [x] Verify Node.js 20+ is installed (`node --version`) - v24.13.0 ✓
- [x] Verify Python 3.10+ is installed (`python --version`) - v3.14.3 ✓
- [x] Verify Git is installed and configured - v2.53.0 ✓

#### API Keys & Accounts
- [x] Create free Groq account at console.groq.com ✓
- [x] Copy and save Groq API key securely ✓
- [ ] Create free Pinecone account at pinecone.io
- [ ] Create Pinecone index named `rag-docs` with dimension 1536
- [x] Create/verify GitHub account exists ✓
- [ ] Create GitHub repository named `rag-chatbot`

#### Development Tools
- [ ] Install/verify Cursor IDE (free tier) from cursor.com
- [ ] Install create-next-app globally: `npm install -g create-next-app`
- [x] Test Groq API key with curl call ✓
- [x] Set up .gitignore file (include .env files) ✓

---

### Phase 2 — Backend: PDF Ingestion Pipeline (~6 hours) ✅ COMPLETE
**Goal:** Build Express server that accepts PDFs and stores them as vectors

#### Backend Initialization
- [x] Create `/backend` directory ✓
- [x] Initialize Node.js project: `npm init -y` ✓
- [x] Install core dependencies: ✓
  - express
  - multer
  - pdf-parse
  - langchain
  - @langchain/community
  - @langchain/core
  - @langchain/textsplitters
  - chromadb
  - dotenv
  - cors
  - groq-sdk

#### Core Backend Files
- [x] Create `backend/index.js` - Express app entry point ✓
- [x] Set up Express with CORS and JSON middleware ✓
- [x] Create `backend/.env` file with environment variables ✓
- [x] Create `backend/.env.example` template ✓

#### Middleware Setup
- [x] Create `backend/middleware/upload.js` - Multer configuration ✓
- [x] Configure Multer to accept `.pdf` files (max 10MB) ✓

#### Services Implementation
- [x] Create `backend/services/chunker.js` ✓
  - Implement RecursiveCharacterTextSplitter
  - Set chunkSize: 500, chunkOverlap: 50
  - Set separators: ['\n\n', '\n', ' ', '']
- [x] Create `backend/services/vectorStore.js` ✓
  - Connect to ChromaDB (local)
  - Implement storeChunks function
  - Implement queryChunks function
- [x] Create `backend/services/embedder.js` ✓
  - Implement embedding generation
  - Simple hash-based approach (placeholder for production embeddings)

#### Routes Implementation
- [x] Create `backend/routes/upload.js` ✓
- [x] Implement POST /upload endpoint ✓
  - Receive file
  - Extract text with pdf-parse
  - Chunk text
  - Generate embeddings
  - Store in ChromaDB

#### Testing Phase 2
- [x] Test backend server starts successfully ✓
- [x] Test with Postman: upload sample PDF ✓
- [x] Verify vectors stored in ChromaDB ✓
- [x] Test error handling for invalid files ✓
- [x] Fixed pdf-parse v2.4.5 compatibility (PDFParse class, Uint8Array) ✓
- [x] Fixed ChromaDB metadata format (object to string conversion) ✓

---

### Phase 3 — Backend: Query & Chat API (~3 hours) ✅ COMPLETE
**Goal:** Build query pipeline that answers questions using stored vectors

#### Chat Route Implementation
- [x] Create `backend/routes/chat.js` ✓
- [x] Implement POST /chat endpoint ✓
- [x] Accept request body: `{ question: string, sessionId: string }` ✓

#### Query Pipeline
- [x] Embed incoming question using same embedding function ✓
- [x] Query ChromaDB for top 5 most similar chunks ✓
- [x] Build prompt template with system instructions ✓
- [x] Implement context assembly from retrieved chunks ✓

#### LLM Integration
- [x] Create `backend/services/llm.js` ✓
- [x] Implement Groq API chat completion call ✓
- [x] Use model: `llama-3.1-70b-versatile` ✓
- [x] Set temperature: 0.1 (factual responses) ✓
- [x] Return answer + source chunks for transparency ✓
- [x] Add streaming response support (`stream: true`) ✓

#### Testing Phase 3
- [x] Test with Postman: send test questions ✓
- [x] Verify relevant answers are returned ✓
- [x] Verify source chunks are included in response ✓
- [x] Test streaming functionality ✓
- [x] Test error handling for empty vector store ✓
- [x] Fixed decommissioned Groq model (updated to llama-3.3-70b-versatile) ✓
- [x] Tested complete RAG pipeline end-to-end ✓

---

### Phase 4 — Frontend: Chat UI (~5 hours)
**Goal:** Build Next.js UI with file uploader and real-time chat interface

#### Frontend Initialization
- [ ] Create Next.js app: `npx create-next-app@latest frontend --typescript --tailwind`
- [ ] Install ShadCN UI: `npx shadcn@latest init`
- [ ] Install additional dependencies:
  - axios
  - react-dropzone
  - react-markdown

#### Component Development
- [ ] Create `frontend/components/FileUpload.tsx`
  - Implement drag-and-drop zone (react-dropzone)
  - Add upload progress bar
  - Display list of uploaded documents
  - Add file validation (PDF only, size limits)

- [ ] Create `frontend/components/ChatWindow.tsx`
  - Implement scrollable message list
  - Create user/assistant message bubbles
  - Render markdown in assistant responses
  - Show source citations below answers
  - Add auto-scroll to latest message

- [ ] Create `frontend/components/MessageInput.tsx`
  - Text input field
  - Send button
  - Loading spinner
  - Disable during processing

#### API Integration
- [ ] Create `frontend/lib/api.ts`
- [ ] Implement POST to backend `/upload` endpoint
- [ ] Implement POST to backend `/chat` endpoint
- [ ] Add error handling with user-friendly messages

#### Main Page
- [ ] Create/update `frontend/app/page.tsx`
- [ ] Integrate all components
- [ ] Add layout and styling
- [ ] Implement state management

#### Testing Phase 4
- [ ] Test file upload functionality
- [ ] Test chat interface with backend
- [ ] Test error states and loading states
- [ ] Test responsive design
- [ ] Test markdown rendering

---

### Phase 5 — Migrate to Pinecone + Deploy (~4 hours)
**Goal:** Switch to Pinecone and deploy both frontend and backend

#### Pinecone Integration
- [ ] Install Pinecone SDK: `npm install @pinecone-database/pinecone`
- [ ] Update `vectorStore.js` to support both ChromaDB and Pinecone
- [ ] Add config flag to switch between vector stores
- [ ] Update `.env` with Pinecone variables:
  - VECTOR_STORE=pinecone
  - PINECONE_API_KEY
  - PINECONE_INDEX
- [ ] Test Pinecone integration locally

#### Backend Deployment (Render.com)
- [ ] Push code to GitHub repository
- [ ] Create Render.com account (free tier)
- [ ] Connect GitHub repo to Render
- [ ] Configure environment variables in Render dashboard
- [ ] Set start command: `node index.js`
- [ ] Deploy backend
- [ ] Test deployed backend endpoints

#### Frontend Deployment (Vercel)
- [ ] Create Vercel account (free tier)
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variable: `NEXT_PUBLIC_API_URL` (Render backend URL)
- [ ] Deploy frontend
- [ ] Test deployed frontend

#### End-to-End Testing
- [ ] Test complete flow with real PDF on live deployment
- [ ] Test upload functionality
- [ ] Test chat functionality
- [ ] Test error handling on production
- [ ] Verify cold start behavior (Render)

---

### Phase 6 — Polish + Bonus Features (Optional, ~4-6 hours)
**Goal:** Add production-ready features and polish

#### Enhanced Features
- [ ] Add multi-document support
  - Upload multiple PDFs
  - Tag by document name
  - Filter by document in queries

- [ ] Add conversation memory
  - Store last 5 messages in context
  - Enable follow-up questions
  - Session management

- [ ] Add document management
  - "Clear Documents" button
  - Delete individual documents
  - View document list

- [ ] Add usage metrics
  - Display token usage per request
  - Show total tokens used
  - Add usage statistics dashboard

- [ ] Add admin features
  - List all stored documents
  - Show chunk counts per document
  - View vector store statistics

#### Security & Performance
- [ ] Add rate limiting: `express-rate-limit`
- [ ] Add input validation and sanitization
- [ ] Add request logging
- [ ] Optimize chunk retrieval performance
- [ ] Add caching for repeated queries

#### Documentation & Polish
- [ ] Write comprehensive `README.md`
  - Project overview
  - Setup instructions
  - API documentation
  - Screenshots
  - Live demo link
- [ ] Add code comments
- [ ] Create API documentation
- [ ] Add error logging
- [ ] Create user guide

---

## 🎯 Post-Implementation Checklist

### Portfolio & Resume
- [ ] Take screenshots of working application
- [ ] Record demo video
- [ ] Update resume with project bullets (use template from docs)
- [ ] Add project to GitHub profile README
- [ ] Write blog post about building the project (optional)

### Code Quality
- [ ] Code review and refactoring
- [ ] Add TypeScript types where missing
- [ ] Remove console.logs and debug code
- [ ] Ensure consistent code style
- [ ] Add ESLint and Prettier

### Testing & Validation
- [ ] Test with various PDF types
- [ ] Test edge cases (empty PDFs, large PDFs, corrupted files)
- [ ] Test concurrent users
- [ ] Verify all error messages are user-friendly
- [ ] Cross-browser testing

---

## 📊 Progress Summary

**Current Phase:** Phase 3 - Backend Complete, Moving to Phase 4 (Frontend)  
**Backend Status:** ✅ Fully functional and running on http://localhost:3001  
**Completion:** Phases 0-3 Complete (60% overall)  
**Next Steps:** Build Next.js frontend with file upload and chat UI

---

## 🔗 Quick Links

- **Documentation:** `Project1_RAG_Chatbot_Documentation.md`
- **Groq Console:** https://console.groq.com
- **Pinecone Dashboard:** https://pinecone.io
- **GitHub Repo:** (to be created)
- **Live Demo:** (to be deployed)

---

## 📝 Notes & Decisions

### Tech Stack Decisions
- **Vector DB:** Start with ChromaDB (local), migrate to Pinecone (production)
- **LLM:** Groq API with Llama 3.1 70B
- **Embeddings:** Groq embeddings (primary), Hugging Face (fallback)
- **Frontend:** Next.js 15 + TypeScript + TailwindCSS + ShadCN UI
- **Backend:** Node.js + Express.js
- **Deployment:** Vercel (frontend) + Render.com (backend)

### Key Considerations
- Free tier limits: Groq (14,400 req/day), Pinecone (100K vectors)
- Render cold start: ~30 seconds after 15min inactivity
- Security: Never commit .env files, use .env.example
- Chunking strategy: 500 tokens with 50 token overlap

---

**Last Updated:** May 22, 2026  
**Status:** 🟡 In Progress
