from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import faiss, os, requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer('all-MiniLM-L6-v2')

# Create FAISS index
index = faiss.IndexFlatL2(384)
chunks = []
chunk_files = []

@app.post("/upload")
async def upload(files: list[UploadFile] = File(...)):
    for file in files:
        text = (await file.read()).decode("utf-8")
        doc_chunks = [text[i:i+250] for i in range(0, len(text), 250)]
        vectors = model.encode(doc_chunks)
        index.add(vectors)
        chunks.extend(doc_chunks)
        chunk_files.extend([file.filename] * len(doc_chunks))
    
    return {"status": "uploaded", "files": len(files), "total_chunks": len(chunks)}

@app.post("/chat")
async def chat(prompt: str = Form(...)):
    query_vec = model.encode([prompt])
    D, I = index.search(query_vec, k=2)
    relevant_chunks = [chunks[i] for i in I[0]]
    relevant_files = [chunk_files[i] for i in I[0]]
    context = "\n\n".join(relevant_chunks)
    
    prompt_with_context = f"Context:\n{context}\n\nQuestion: {prompt}\nAnswer:"
    print(prompt_with_context)

    res = requests.post("http://localhost:11434/api/generate", json={
        "model": "tinyllama",
        "prompt": prompt_with_context,
        "stream": False
    })
    response = res.json().get("response", "No answer")
    return {"answer": response.strip(),
            "contextFiles": list(set(relevant_files))
            }

@app.get("/")
async def root():
    return {"message": "Welcome to the RAG file assistant backend!"}
