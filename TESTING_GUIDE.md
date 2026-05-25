# RAG Chatbot - Postman Testing Guide

Complete testing guide using Postman for the RAG Chatbot backend API.

---

## 🚀 Quick Start

### Step 1: Install Postman
1. Download Postman from: https://www.postman.com/downloads/
2. Install and create a free account (optional but recommended)

### Step 2: Import the Test Collection
1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `RAG_Chatbot.postman_collection.json` from this project folder
5. Click **Import**

You'll see a collection called **"RAG Chatbot API Tests"** with 10 pre-configured tests!

### Step 3: Start Your Backend Server
```bash
cd backend
npm start
```

Server should be running on `http://localhost:3001`

---

## 📋 Testing Sequence

### Phase 2: PDF Upload & Processing (6 Tests)

#### ✅ Test 1: Health Check
**What it does:** Verifies the server is running

**Steps:**
1. In Postman, expand **"Phase 2: PDF Upload & Processing"**
2. Click **"Test 1: Health Check"**
3. Click the blue **Send** button
4. Check the response

**Expected Response (Status 200):**
```json
{
  "status": "running",
  "message": "RAG Chatbot API",
  "version": "1.0.0",
  "endpoints": {
    "upload": "POST /api/upload",
    "chat": "POST /api/chat",
    "status": "GET /api/chat/status"
  }
}
```

**✓ Pass if:** Status is 200 and you see the JSON response above

---

#### ✅ Test 2: Check Status (Empty)
**What it does:** Checks ChromaDB before uploading documents

**Steps:**
1. Click **"Test 2: Check Status (Empty)"**
2. Click **Send**

**Expected Response (Status 200):**
```json
{
  "status": "ready",
  "documentCount": 0,
  "message": "No documents uploaded yet"
}
```

**✓ Pass if:** documentCount is 0

---

#### 📄 Test 3: Upload PDF File
**What it does:** Tests the complete PDF ingestion pipeline

**⚠️ IMPORTANT:** You need a PDF file for this test!

**If you don't have a PDF:**
1. Go to https://www.ilovepdf.com/word_to_pdf or https://convertio.co/txt-pdf/
2. Convert `test-document.txt` to PDF
3. Save it as `test-document.pdf`

**Steps:**
1. Click **"Test 3: Upload PDF File"**
2. Go to the **Body** tab (below the URL)
3. You'll see a form-data field with key "file"
4. Click **Select Files** button
5. Choose your PDF file
6. Click **Send**

**Expected Response (Status 200):**
```json
{
  "success": true,
  "message": "File processed successfully",
  "filename": "test-document.pdf",
  "chunks": 3,
  "pages": 1
}
```

**✓ Pass if:** success is true and chunks > 0

**Watch the backend terminal** - you should see:
- "Processing file: test-document.pdf"
- "Extracted X characters from PDF"
- "Created X chunks from text"
- "Stored X chunks"

---

#### ✅ Test 4: Check Status (After Upload)
**What it does:** Verifies chunks were stored in ChromaDB

**Steps:**
1. Click **"Test 4: Check Status (After Upload)"**
2. Click **Send**

**Expected Response (Status 200):**
```json
{
  "status": "ready",
  "documentCount": 3,
  "message": "3 document chunks available"
}
```

**✓ Pass if:** documentCount matches the chunks from Test 3

---

#### ❌ Test 5: Upload Invalid File (TXT)
**What it does:** Tests error handling for non-PDF files

**Steps:**
1. Click **"Test 5: Upload Invalid File (TXT)"**
2. Go to **Body** tab
3. Click **Select Files**
4. Choose `test-document.txt` (the text file, NOT PDF)
5. Click **Send**

**Expected Response (Status 400):**
```json
{
  "error": "Only PDF files are allowed"
}
```

**✓ Pass if:** You get an error message about file type

---

#### ❌ Test 6: Upload Without File
**What it does:** Tests missing file error handling

**Steps:**
1. Click **"Test 6: Upload Without File"**
2. Click **Send** (don't select any file)

**Expected Response (Status 400):**
```json
{
  "error": "No file uploaded"
}
```

**✓ Pass if:** You get an error about missing file

---

### Phase 3: Chat & Query API (4 Tests)

**⚠️ PREREQUISITE:** You must complete Test 3 (upload a PDF) before running these tests!

---

#### 💬 Test 7: Ask Question - General
**What it does:** Tests the complete RAG pipeline

**Steps:**
1. Expand **"Phase 3: Chat & Query API"**
2. Click **"Test 7: Ask Question - General"**
3. Go to **Body** tab - you'll see:
   ```json
   {
     "question": "What is this document about?"
   }
   ```
4. Click **Send**

**Expected Response (Status 200):**
```json
{
  "answer": "Based on the provided context, this document is about a RAG (Retrieval-Augmented Generation) chatbot system...",
  "sources": [
    {
      "filename": "test-document.pdf",
      "chunkIndex": 0,
      "distance": 0.234
    }
  ]
}
```

**✓ Pass if:** 
- You get an answer that makes sense
- sources array is not empty
- The answer references content from your PDF

**Watch the backend terminal** - you should see:
- "Processing question: What is this document about?"
- "Found X similar chunks"

---

#### 💬 Test 8a, 8b, 8c: Ask Multiple Questions
**What it does:** Tests retrieval accuracy with different types of questions

**Run these three tests in order:**

**Test 8a: Specific Question**
- Question: "What are the main features mentioned?"
- Should return features from your document

**Test 8b: Technical Question**
- Question: "What is the chunk size used in the system?"
- Should return "500 tokens" if using test-document

**Test 8c: Question NOT in Document**
- Question: "What is the weather today?"
- Should say something like "I don't have that information"

**✓ Pass if:** 
- 8a and 8b return relevant answers from the document
- 8c says it doesn't know (not making up information)

---

#### ❌ Test 9: Empty Question
**What it does:** Tests validation

**Steps:**
1. Click **"Test 9: Empty Question"**
2. Body shows: `{"question": ""}`
3. Click **Send**

**Expected Response (Status 400):**
```json
{
  "error": "Question is required"
}
```

**✓ Pass if:** You get a validation error

---

#### ❌ Test 10: Question Without Documents
**What it does:** Tests behavior when vector store is empty

**⚠️ This test requires clearing the database first!**

**Steps:**
1. Stop the backend server (Ctrl+C in terminal)
2. Delete ChromaDB data (if folder exists):
   ```bash
   rm -rf backend/chroma_data
   # or on Windows:
   rmdir /s backend\chroma_data
   ```
3. Restart server: `cd backend && npm start`
4. In Postman, click **"Test 10: Question Without Documents"**
5. Click **Send**

**Expected Response (Status 200):**
```json
{
  "answer": "I don't have any documents to reference. Please upload a PDF document first.",
  "sources": []
}
```

**✓ Pass if:** Answer mentions no documents available

---

## 📊 Testing Checklist

Mark each test as you complete it:

### Phase 2: PDF Upload & Processing
- [ ] ✅ Test 1: Health Check
- [ ] ✅ Test 2: Check Status (Empty)
- [ ] 📄 Test 3: Upload PDF File
- [ ] ✅ Test 4: Check Status (After Upload)
- [ ] ❌ Test 5: Upload Invalid File
- [ ] ❌ Test 6: Upload Without File

### Phase 3: Chat & Query API
- [ ] 💬 Test 7: Ask Question - General
- [ ] 💬 Test 8a: Ask Question - Specific
- [ ] 💬 Test 8b: Ask Question - Technical
- [ ] 💬 Test 8c: Ask Question - Not in Document
- [ ] ❌ Test 9: Empty Question
- [ ] ❌ Test 10: Question Without Documents

---

## 🎯 Tips for Success

### Viewing Responses
- Click the **Body** tab in the response section
- Choose **Pretty** view for formatted JSON
- Check the **Status** code (should be 200 for success, 400 for errors)

### Debugging Failed Tests
1. Check the **Status** code
2. Read the error message in the response
3. Look at the backend terminal for detailed logs
4. Verify the backend server is running

### Common Issues

**"Could not get response"**
- Backend server is not running
- Wrong port (should be 3001)
- Solution: Start the server with `cd backend && npm start`

**"Only PDF files are allowed"**
- You selected a non-PDF file
- Solution: Convert test-document.txt to PDF first

**"No file uploaded"**
- You didn't select a file in the Body tab
- Solution: Click "Select Files" and choose a PDF

**Empty answer or "I don't know"**
- No documents uploaded yet
- Solution: Run Test 3 first to upload a PDF

---

## ✅ After All Tests Pass

1. ✓ Mark all tests as complete in `IMPLEMENTATION_TRACKER.md`
2. ✓ Take screenshots of successful tests (optional)
3. ✓ You're ready to proceed to **Phase 4: Frontend Development**!

---

## 🆘 Need Help?

If any test fails:
1. Check the error message in Postman
2. Look at the backend terminal logs
3. Verify your Groq API key is set in `backend/.env`
4. Make sure you have a valid PDF file for upload tests

**Happy Testing! 🚀**
