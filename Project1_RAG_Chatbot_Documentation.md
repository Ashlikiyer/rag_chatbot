# Project 1 — Personal RAG Chatbot
### Complete Build Documentation — Free Tools Only

| | |
|---|---|
| **Difficulty** | Intermediate |
| **Timeline** | 1–2 Weeks |
| **AI Model** | Groq (Free Tier) |
| **Cost** | $0 |

> **What You Will Build:** A full-stack chatbot that lets users upload PDF documents and ask questions about them in natural language. Under the hood it implements a complete RAG (Retrieval-Augmented Generation) pipeline: document chunking, vector embeddings, semantic search, and LLM-generated responses — all using 100% free tools.

---

## 1. Project Overview

### 1.1 What is RAG?

RAG stands for Retrieval-Augmented Generation. Instead of asking an LLM to answer from memory, you first search a knowledge base of your own documents for relevant chunks, then pass those chunks as context to the LLM so it answers based on your data — not just its training.

**The pipeline has four stages:**

1. **Ingestion** — load a PDF, split it into smaller text chunks
2. **Embedding** — convert each chunk into a vector (a list of numbers) using an embedding model
3. **Storage** — store those vectors in a vector database for fast similarity search
4. **Retrieval + Generation** — when a user asks a question, embed the question, find the closest chunks, pass them to an LLM, return the answer

---

### 1.2 Why This Project Matters for the Job  

| Job Requirement | How This Project Covers It |
|---|---|
| RAG & Knowledge Architecture | You implement the full pipeline from scratch |
| Vector Databases (Pinecone/Weaviate) | You use ChromaDB locally — same concepts apply |
| LLM Integration | You connect Groq API with real prompt engineering |
| Backend Development (Node.js) | Express.js API handles uploads, chunking, retrieval |
| API Integration | RESTful endpoints, webhook-ready architecture |

---

## 2. Full Tech Stack — Free Tools Only

### 2.1 Frontend

| Tool | Purpose & Why Free |
|---|---|
| **Next.js 15** | React framework — 100% open source, free forever |
| **TailwindCSS** | Utility CSS — free open source |
| **ShadCN UI** | Component library — free, aligns with your existing skills |
| **Vercel (deploy)** | Free tier: unlimited personal projects, auto-deploy from GitHub |

---

### 2.2 Backend

| Tool | Purpose & Why Free |
|---|---|
| **Node.js + Express.js** | REST API server — free open source |
| **Multer** | File upload middleware for Express — free npm package |
| **pdf-parse** | Extract text from PDF files — free npm package |
| **LangChain.js** | RAG orchestration framework — free open source, used in the job description |
| **Railway or Render** | Free tier backend hosting (750 hrs/month free on Render) |

---

### 2.3 AI Model — Free Tier

> **Primary AI: Groq API (Free Tier)**
> Groq provides free API access to open-source LLMs including Llama 3.1 70B, Mixtral 8x7B, and Gemma 2 9B. Free tier: up to 14,400 requests/day. More than enough for a portfolio project. You already have Groq experience from CareerAI — this is a direct extension of that skill.

| AI Tool | Free Tier Details |
|---|---|
| **Groq API** | Free — Llama 3.1 70B, Mixtral 8x7B, 14,400 req/day |
| **Hugging Face Inference API** | Free — backup option for embeddings (sentence-transformers) |
| **Ollama (local fallback)** | Free — run Llama 3.2 or Mistral fully offline on your machine |

---

### 2.4 Vector Database — Free

| Tool | Free Tier Details |
|---|---|
| **ChromaDB** | Fully free, runs locally — no account needed. Best for local dev. |
| **Pinecone** | Free tier: 1 index, 100K vectors — enough for demos. Matches job posting exactly. |
| **Qdrant Cloud** | Free tier: 1GB storage — good alternative to Pinecone |

> **💡 Recommended Approach:** Start with ChromaDB locally (zero setup), then migrate to Pinecone free tier before deploying. This way your resume can honestly say you used both.

---

### 2.5 Development Tools — All Free

| Tool | Purpose |
|---|---|
| **Cursor (free tier)** | AI-first IDE — explicitly mentioned in the job posting |
| **VS Code** | Fallback editor — always free |
| **GitHub** | Version control + portfolio visibility — free public repos |
| **Postman** | API testing — free tier |
| **Thunder Client (VS Code ext.)** | Lightweight API testing inside VS Code — free |

---

## 3. System Architecture

### 3.1 High-Level Flow

The system has two separate flows: **Document Ingestion** (happens once when a file is uploaded) and **Query Processing** (happens every time the user asks a question).

#### Document Ingestion Flow

| Step | What Happens |
|---|---|
| **1. Upload** | User uploads a PDF via the Next.js frontend |
| **2. Extract** | Express backend uses pdf-parse to extract raw text from the PDF |
| **3. Chunk** | LangChain.js RecursiveCharacterTextSplitter splits text into ~500-token chunks with 50-token overlap |
| **4. Embed** | Each chunk is sent to Groq's embedding endpoint (or Hugging Face) to get a vector |
| **5. Store** | Chunk text + vector is stored in ChromaDB/Pinecone with metadata (filename, page number, chunk index) |

#### Query Processing Flow

| Step | What Happens |
|---|---|
| **1. User asks** | User types a question in the chat UI |
| **2. Embed question** | The question is embedded using the same embedding model |
| **3. Vector search** | Top-K most similar chunks are retrieved from the vector DB |
| **4. Build prompt** | Retrieved chunks are assembled into a context prompt with the user question |
| **5. LLM call** | Prompt is sent to Groq API (Llama 3.1 70B) with system instructions |
| **6. Return answer** | LLM response is streamed back to the frontend and displayed |

---

### 3.2 Folder Structure

```
rag-chatbot/
├── frontend/                  # Next.js 15 app
│   ├── app/
│   │   ├── page.tsx           # Main chat UI
│   │   └── api/               # Next.js API routes (optional)
│   ├── components/
│   │   ├── ChatWindow.tsx     # Message display
│   │   ├── FileUpload.tsx     # Drag-and-drop uploader
│   │   └── MessageInput.tsx   # Input bar
│   └── lib/
│       └── api.ts             # Axios/fetch calls to backend
│
├── backend/                   # Express.js server
│   ├── routes/
│   │   ├── upload.js          # POST /upload — ingestion pipeline
│   │   └── chat.js            # POST /chat   — query pipeline
│   ├── services/
│   │   ├── embedder.js        # Embedding calls (Groq / HF)
│   │   ├── vectorStore.js     # ChromaDB / Pinecone operations
│   │   ├── chunker.js         # LangChain text splitting
│   │   └── llm.js             # Groq API chat completion
│   ├── middleware/
│   │   └── upload.js          # Multer config
│   └── index.js               # Express app entry point
│
└── .env                       # API keys (never commit this)
```

---

## 4. Build Phases

Build in this exact order. Each phase produces something working you can test before moving on.

---

### Phase 1 — Environment Setup
**Day 1 · ~2 hours**

Goals: Install all tools, get API keys, confirm everything runs.

- [ ] Install Node.js 20+ from nodejs.org
- [ ] Install Python 3.10+ (needed for ChromaDB)
- [ ] Create a free Groq account at console.groq.com — copy your API key
- [ ] Create a free Pinecone account at pinecone.io — create an index named `rag-docs` with dimension 1536
- [ ] Create a free GitHub account / repo named `rag-chatbot`
- [ ] Install Cursor IDE (free tier) from cursor.com
- [ ] Run: `npm install -g create-next-app`
- [ ] Test Groq API key with a curl call before writing any code

---

### Phase 2 — Backend: PDF Ingestion Pipeline
**Days 2–3 · ~6 hours**

Goals: Build the Express server that accepts a PDF and stores it as vectors.

- [ ] Initialize backend: `npm init -y` in `/backend`
- [ ] Install dependencies:
  ```bash
  npm install express multer pdf-parse langchain @langchain/community chromadb dotenv cors
  ```
- [ ] Set up Express with CORS and JSON middleware in `index.js`
- [ ] Create Multer config to accept `.pdf` files, max 10MB
- [ ] Build `chunker.js` using `RecursiveCharacterTextSplitter`
  - `chunkSize: 500, chunkOverlap: 50, separators: ['\n\n', '\n', ' ', '']`
- [ ] Build `vectorStore.js` — connect to ChromaDB (local first)
- [ ] Build `embedder.js` — call Groq embeddings endpoint OR Hugging Face sentence-transformers
- [ ] Wire up `POST /upload` route: receive file → extract → chunk → embed → store
- [ ] Test with Postman: upload a sample PDF, verify vectors stored in ChromaDB

---

### Phase 3 — Backend: Query & Chat API
**Day 4 · ~3 hours**

Goals: Build the query pipeline that answers questions using stored vectors.

- [ ] Build `POST /chat` route in `routes/chat.js`
- [ ] Accept `{ question: string, sessionId: string }` in request body
- [ ] Embed the incoming question using the same embedding function
- [ ] Query ChromaDB for top 5 most similar chunks
- [ ] Build a prompt template:
  ```
  System: You are a helpful assistant. Answer using ONLY the provided context.
  If the answer is not in the context, say 'I don't have that information.'

  Context:
  {retrieved_chunks_joined_with_newlines}

  Question: {user_question}
  ```
- [ ] Call Groq API with the assembled prompt using `llama-3.1-70b-versatile` model
- [ ] Return the answer + the source chunks used (for transparency in the UI)
- [ ] Add streaming response support using Groq's `stream: true` option
- [ ] Test with Postman: send a question, verify it returns a relevant answer

---

### Phase 4 — Frontend: Chat UI
**Days 5–6 · ~5 hours**

Goals: Build the Next.js UI — file uploader + real-time chat interface.

- [ ] Create Next.js app: `npx create-next-app@latest frontend --typescript --tailwind`
- [ ] Install ShadCN UI: `npx shadcn@latest init`
- [ ] Install additional deps: `npm install axios react-dropzone react-markdown`
- [ ] Build `FileUpload.tsx` component:
  - Drag-and-drop zone using react-dropzone
  - Show upload progress bar
  - Display list of uploaded documents
- [ ] Build `ChatWindow.tsx` component:
  - Scrollable message list with user/assistant message bubbles
  - Render markdown in assistant responses using react-markdown
  - Show source citations below each answer (which chunks were used)
- [ ] Build `MessageInput.tsx`: text input + send button + loading spinner
- [ ] Connect to backend: POST to `http://localhost:3001/upload` and `/chat`
- [ ] Add basic error handling: show friendly message if API fails

---

### Phase 5 — Migrate to Pinecone + Deploy
**Days 7–9 · ~4 hours**

Goals: Switch from local ChromaDB to Pinecone, deploy both frontend and backend.

- [ ] Install Pinecone SDK: `npm install @pinecone-database/pinecone`
- [ ] Update `vectorStore.js` to support both ChromaDB and Pinecone via a config flag
- [ ] Create `.env` variables: `VECTOR_STORE=pinecone`, `PINECONE_API_KEY`, `PINECONE_INDEX`
- [ ] Deploy backend to Render.com free tier:
  - Connect GitHub repo to Render
  - Set environment variables in Render dashboard
  - Set start command: `node index.js`
- [ ] Deploy frontend to Vercel:
  - Connect GitHub repo to Vercel
  - Set `NEXT_PUBLIC_API_URL` to your Render backend URL
- [ ] Verify live deployment end-to-end with a real PDF test

---

### Phase 6 — Polish + Bonus Features
**Days 10–14 · Optional**

Optional but strongly recommended — these separate a portfolio project from a real product.

- [ ] Add multi-document support: upload multiple PDFs, tag by document name
- [ ] Add conversation memory: store last 5 messages in context for follow-up questions
- [ ] Add a "Clear Documents" button that wipes the vector store
- [ ] Add token usage display: show how many tokens each request used
- [ ] Add a simple admin view: list all stored documents with chunk counts
- [ ] Add rate limiting: `express-rate-limit` to prevent API abuse
- [ ] Write a clean `README.md` with screenshots and a live demo link

---

## 5. Key Code Snippets

### 5.1 Groq API Chat Call (`llm.js`)

```javascript
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askLLM(prompt, context) {
  const messages = [
    {
      role: 'system',
      content: 'Answer using ONLY the provided context. If unsure, say so.'
    },
    {
      role: 'user',
      content: `Context:\n${context}\n\nQuestion: ${prompt}`
    }
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',  // free model
    messages,
    max_tokens: 1024,
    temperature: 0.1   // low = more factual, less creative
  });

  return response.choices[0].message.content;
}

module.exports = { askLLM };
```

---

### 5.2 Text Chunking (`chunker.js`)

```javascript
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

async function chunkText(text, metadata = {}) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
    separators: ['\n\n', '\n', ' ', '']
  });

  const chunks = await splitter.createDocuments([text], [metadata]);
  return chunks;  // array of { pageContent, metadata }
}

module.exports = { chunkText };
```

---

### 5.3 ChromaDB Storage (`vectorStore.js`)

```javascript
const { ChromaClient } = require('chromadb');
const client = new ChromaClient();

async function storeChunks(chunks, embeddings, collectionName = 'docs') {
  const collection = await client.getOrCreateCollection({ name: collectionName });
  await collection.add({
    ids: chunks.map((_, i) => `chunk_${Date.now()}_${i}`),
    embeddings: embeddings,
    documents: chunks.map(c => c.pageContent),
    metadatas: chunks.map(c => c.metadata)
  });
}

async function queryChunks(queryEmbedding, topK = 5) {
  const collection = await client.getCollection({ name: 'docs' });
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK
  });
  return results.documents[0];  // array of relevant text chunks
}

module.exports = { storeChunks, queryChunks };
```

---

## 6. Environment Variables

> ⚠️ **Security Rule:** NEVER commit your `.env` file to GitHub. Add `.env` to your `.gitignore` immediately. Use `.env.example` with placeholder values to document what keys are needed.

```bash
# .env — backend
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX=rag-docs
VECTOR_STORE=chroma            # 'chroma' for local, 'pinecone' for production
HUGGINGFACE_API_KEY=optional   # backup embedding provider

# .env.local — frontend (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 7. Free Tier Limits Reference

| Service | Free Tier Limits |
|---|---|
| **Groq API** | 14,400 requests/day, 6,000 tokens/min — plenty for demos |
| **Pinecone** | 1 index, 100,000 vectors, 5GB storage |
| **Render.com (backend)** | 750 hours/month free, spins down after 15min inactivity |
| **Vercel (frontend)** | Unlimited personal projects, 100GB bandwidth/month |
| **GitHub** | Unlimited public repos, Actions (2,000 min/month) |
| **Hugging Face API** | Free inference on public models — rate limited but usable |

> **⚠️ Render Cold Start Warning:** On Render's free tier, your backend spins down after 15 minutes of inactivity and takes ~30 seconds to wake up on the next request. For demos, open the backend URL in a browser tab first to wake it before showing the app to someone.

---

## 8. Resume Bullets (Copy-Paste Ready)

Once built, add these to your resume under Projects:

**Project Name:** Personal RAG Chatbot — AI Document Q&A Platform

**Stack:** Next.js 15, TypeScript, Node.js, LangChain.js, Groq (Llama 3.1), ChromaDB, Pinecone

- Built a full RAG pipeline from scratch: PDF ingestion, text chunking, vector embedding, semantic search, and LLM-generated responses using Groq's Llama 3.1 70B model
- Implemented vector storage and similarity search using ChromaDB (local) and Pinecone (production), with support for multi-document knowledge bases
- Deployed full-stack application on Vercel (frontend) and Render (backend) with real-time streaming responses and source citation display

---

## 9. Concepts to Study While Building

These are the underlying concepts the job posting expects you to understand deeply. Learn them as you build each phase.

| Concept | Where to Learn (Free) |
|---|---|
| **Vector embeddings & cosine similarity** | DeepLearning.AI — "Building Systems with ChatGPT" (free) |
| **LangChain.js basics** | docs.langchain.com — JavaScript quickstart, free docs |
| **RAG architecture patterns** | LangChain blog + Pinecone learning center (both free) |
| **Prompt engineering for RAG** | Groq documentation + Anthropic prompt engineering guide |
| **ChromaDB usage** | docs.trychroma.com — full free docs with Node.js examples |
| **Token limits & chunking strategy** | OpenAI cookbook on GitHub — free, applies to any LLM |

---

*Ashley Kier Ferreol — Portfolio Build Plan*
*Gordon College, Olongapo · BSCS Expected Jul. 2026 · github.com/Ashlikiyer*
