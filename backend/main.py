from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from sentence_transformers import SentenceTransformer
import faiss, os, requests
import pickle
import fitz
from collections import Counter
import numpy as np

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
async def upload(files: list[UploadFile] = File(...), chunk_size: int = Form(500)):
    os.makedirs("uploaded_files", exist_ok=True)
    for file in files:
        filename = file.filename
        content = await file.read()
        with open(os.path.join("uploaded_files", filename), "wb") as f:
            f.write(content)

        if filename.lower().endswith(".pdf"):
            text = extract_text_from_pdf(content)
        else:
            text = content.decode("utf-8")

        doc_chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
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

    relevant_chunks = []
    sources = []
    for i in I[0]:
        chunk_text = chunks[int(i)]
        file = chunk_files[int(i)]
        sources.append({
            "chunk": chunk_text,
            "file": file,
            "index": int(i)
        })
        relevant_chunks.append(chunk_text)

    context = "\n\n".join(relevant_chunks)
    
    prompt_with_context = f"Context:\n{context}\n\nQuestion: {prompt}\nAnswer:"
    print(prompt_with_context)

    res = requests.post("http://ollama:11434/api/generate", json={
        "model": llm_model,
        "prompt": prompt_with_context,
        "stream": False
    })

    response = res.json().get("response", "No answer")

    return {"answer": response.strip(),
            "sources": sources
            }

@app.get("/files")
async def list_files():
    file_counts = Counter(chunk_files)
    return [{"filename": fn, "chunks": count} for fn, count in file_counts.items()]

@app.delete("/files/{filename}")
async def delete_file(filename: str):
    global chunks, chunk_files, index
    new_chunks = []
    new_chunk_files = []
    new_vectors = []

    for i, (chunk, file) in enumerate(zip(chunks, chunk_files)):
        if file != filename:
            new_chunks.append(chunk)
            new_chunk_files.append(file)
            new_vectors.append(index.reconstruct(i))

    index.reset()
    if new_vectors:
        index.add(np.array(new_vectors))

    chunks[:] = new_chunks
    chunk_files[:] = new_chunk_files

    file_path = os.path.join("uploaded_files", filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    save_state()
    return {"status": "deleted", "file": filename}

@app.post("/rechunk")
async def rechunk(chunk_size: int = Form(...)):
    global chunks, chunk_files, index

    index.reset()
    chunks.clear()
    chunk_files.clear()
    for file in os.listdir("uploaded_files"):
        path = os.path.join("uploaded_files", file)
        if file.lower().endswith(".pdf"):
            with open(path, "rb") as f:
                text = extract_text_from_pdf(f.read())
        else:
            with open(path, "r", encoding="utf-8") as f:
                text = f.read()
            
        doc_chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        vectors = model.encode(doc_chunks)
        index.add(vectors)
        chunks.extend(doc_chunks)
        chunk_files.extend([file] * len(doc_chunks))

@app.get("/files/{filename}")
async def get_file_content(filename: str):
    path = os.path.join("uploaded_files", filename)
    if not os.path.exists(path):
        return PlainTextResponse("File not found", status_code=404)
    if filename.lower().endswith(".pdf"):
        with open(path, "rb") as f:
            content = f.read()
        text = extract_text_from_pdf(content)
        print(text)
        return PlainTextResponse(text)
    else:
        with open(path, "r", encoding="utf-8") as f:
            return PlainTextResponse(f.read())

@app.get("/")
async def root():
    return {"message": "Welcome to the RAG file assistant backend!"}
