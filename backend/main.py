from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import faiss, os, requests
import pickle
import fitz

INDEX_PATH = "data/faiss.index"
CHUNKS_PATH = "data/chunks.pkl"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer('all-MiniLM-L6-v2')

index = faiss.IndexFlatL2(384)
chunks = []
chunk_files = []

def extract_text_from_pdf(file):
    text = ""
    with fitz.open(stream=file, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

def save_state():
    faiss.write_index(index, INDEX_PATH)
    with open(CHUNKS_PATH, "wb") as f:
        pickle.dump((chunks, chunk_files), f)

def load_state():
    global index, chunks, chunk_files
    if os.path.exists(INDEX_PATH):
        index = faiss.read_index(INDEX_PATH)
    if os.path.exists(CHUNKS_PATH):
        with open(CHUNKS_PATH, "rb") as f:
            loaded_chunks, loaded_chunk_files = pickle.load(f)
            chunks.clear()
            chunks.extend(loaded_chunks)
            chunk_files.clear()
            chunk_files.extend(loaded_chunk_files)

load_state()

@app.post("/upload")
async def upload(files: list[UploadFile] = File(...), chunk_size: int = Form(250)):
    for file in files:
        filename = file.filename
        content = await file.read()

        if filename.lower().endswith(".pdf"):
            text = extract_text_from_pdf(content)
        else:
            text = content.decode("utf-8")

        doc_chunks = [text[i:i+250] for i in range(0, len(text), chunk_size)]
        vectors = model.encode(doc_chunks)
        index.add(vectors)
        chunks.extend(doc_chunks)
        chunk_files.extend([file.filename] * len(doc_chunks))

    save_state()
    return {"status": "uploaded", "files": len(files), "total_chunks": len(chunks)}

@app.post("/chat")
async def chat(prompt: str = Form(...), llm_model: str = Form("tinyllama"), num_chunks: int = Form(5)):
    query_vec = model.encode([prompt])
    D, I = index.search(query_vec, k=num_chunks)
    relevant_chunks = [chunks[i] for i in I[0]]
    relevant_files = [chunk_files[i] for i in I[0]]
    context = "\n\n".join(relevant_chunks)
    
    prompt_with_context = f"Context:\n{context}\n\nQuestion: {prompt}\nAnswer:"
    print(prompt_with_context)

    res = requests.post("http://localhost:11434/api/generate", json={
        "model": llm_model,
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
