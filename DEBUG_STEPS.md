# Debug Steps for Pinecone Query Issue

## Issue
Documents upload successfully to Pinecone, but queries return "No content found" even though Pinecone finds 5 matching chunks.

## Root Cause Analysis
The log shows:
```
Found 5 similar chunks (Pinecone Inference API)
[CHAT] Applied route-level filename filter "Ashley_Kier_Ferreol_CV.pdf", kept 0 chunks
```

This means Pinecone returned 5 chunks, but the route-level filter removed all of them because `metadata.filename` was empty or didn't match.

## Changes Made
Added debug logging to `backend/services/vectorStore.js` in the `queryChunksPinecone` function to log:
1. The raw hit structure from Pinecone (`hits[0]`)
2. The formatted metadata structure after mapping (`metadatas[0]`)

## Next Steps

### 1. Deploy Updated Code
```bash
cd backend
git add services/vectorStore.js
git commit -m "Add debug logging for Pinecone query structure"
git push origin main
```

### 2. Wait for Render Deployment
- Go to your Render dashboard
- Wait for the deployment to complete (usually 2-3 minutes)
- The instance will restart automatically

### 3. Test and Collect Logs
1. Upload a PDF document
2. Ask a question about it
3. Go to Render → Logs tab
4. Look for these debug lines:
   ```
   [DEBUG] First hit structure: {...}
   [DEBUG] First metadata: {...}
   ```

### 4. Analyze the Debug Output
The debug logs will show:
- How Pinecone structures the returned hits
- Whether `hit.fields.filename` exists
- If the metadata mapping is correct

### 5. Apply the Fix
Based on the debug output, we'll adjust the code to correctly extract the filename from wherever Pinecone actually stores it.

## Possible Issues & Solutions

### Issue 1: Fields not included in response
**Symptom:** `hit.fields` is undefined or empty
**Solution:** The `fields` parameter in searchRecords may not be working as expected. We might need to access data differently.

### Issue 2: Filename stored in different location
**Symptom:** `hit.fields.filename` is undefined but filename exists elsewhere in hit object
**Solution:** Update the mapping to access filename from the correct location (e.g., `hit.metadata.filename` or `hit.filename`)

### Issue 3: Render instance cold start
**Symptom:** First query after long inactivity fails, subsequent queries work
**Solution:** This is expected behavior with Render free tier. Wait 30-60 seconds after instance starts before testing.

## Quick Deployment Commands
```bash
# From chatbot root directory
cd backend
git add .
git commit -m "Debug Pinecone query response structure"
git push origin main

# Monitor deployment
# Go to: https://dashboard.render.com