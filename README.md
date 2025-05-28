# RAG file assistant

## Introduction

**RAG-file-assistant** is a Retrieval-Augmented Generation (RAG) assistant that lets you upload documents (PDFs or text files), chunk and embed their content, and ask questions about them using language models such as TinyLlama, Llama 2, and Mistral. The system uses semantic search (FAISS), chunked document storage, and a local LLM server (Ollama) to provide accurate, context-aware answers and file management features.

The app has some ready downloaded data, and you can download your own files

---
---
##Screenshots
![image](https://github.com/user-attachments/assets/ac5cd87a-80ee-4846-b5ea-fbddd4d99305)
![image](https://github.com/user-attachments/assets/04297993-f32a-4ba2-a93c-ee0cbe081035)
![image](https://github.com/user-attachments/assets/0a20ef0e-c0c7-4915-87c5-765a8dab01fd)
![image](https://github.com/user-attachments/assets/a02996e2-1530-4bc4-8765-3afdf4705edd)





---

## Features

- **Document Upload:** Upload PDFs or text files for semantic search.
- **Chunking:** Adjustable chunk size for document splitting.
- **Semantic Search:** Uses FAISS for fast vector similarity search.
- **LLM Integration:** Query your documents using local LLMs via Ollama.
- **File Management:** View, delete, and inspect stored files.
- **Re-chunking:** Reprocess all files with a new chunk size at any time.
- **Modern UI:** Built with React and Material UI.

---

## Quickstart

### 1. **Clone the Repository**

```sh
git clone https://github.com/Lindrax/RAG-file-assistant.git
cd RAG-file-assistant
```

### 2. **Running with Docker Compose (Recommended)**

This will start the backend, frontend, and Ollama LLM server in containers.

```sh
docker compose up --build
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Ollama (LLM):** [http://localhost:11435](http://localhost:11435)

> **Note:** The first run will download the TinyLlama model and all dependencies, which may take a few minutes.

### 3. **Running Locally (No Docker)**

**Backend:**

```sh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**

```sh
cd frontend
npm install
npm run dev
```

**Ollama (LLM):**

- [Install Ollama](https://ollama.com/download) for your OS.
- Start Ollama: `ollama serve`
- Pull a model: `ollama pull tinyllama`
- Run a model: `ollamma run tinyllama`

---

## Ollama Model Usage & URL Configuration

**Important:**

- If you are running **Ollama locally** (outside Docker), your backend must use `http://localhost:11434` as the URL for LLM requests.
- If you are running **Ollama inside Docker Compose**, your backend must use `http://ollama:11434` as the URL (since Docker Compose services communicate via service names).

**You must also download any models you want to use** with Ollama.  
For example, to use TinyLlama, run:

```sh
ollama pull tinyllama
```

For other models (like Llama 2 or Mistral), run:

```sh
ollama pull llama2
ollama pull mistral
```

> **Note:**  
> In the current Docker Compose setup, only `tinyllama` is automatically pulled and available.  
> To use other models in Docker, you can modify `pull-llama.sh` to pull additional models:
>
> ```bash
> #!/bin/bash
> ollama serve &
> sleep 5
> ollama pull tinyllama
> ollama pull llama2
> ollama pull mistral
> wait $!
> ```
>
> Then rebuild your Ollama Docker image:
>
> ```sh
> docker compose build ollama
> docker compose up
> ```

---

**Summary:**

- Change the backend Ollama URL depending on where Ollama is running (`localhost` vs `ollama`).
- Download all models you want to use with `ollama pull <model>`.
- In Docker, update `pull-llama.sh` to pull more models if needed.

## Usage

1. **Upload Documents:** Use the UI to upload PDFs or text files.
2. **Adjust Chunk Size:** Set how many characters each chunk contains.
3. **Re-chunk:** If you change the chunk size, click "Re-chunk All Files" to reprocess.
4. **Ask Questions:** Enter a question and select the LLM model to get answers based on your documents.
5. **File Management:** Go to the "Files" page to view, inspect, or delete stored files

---

## Technical Overview

### Architecture

- **Frontend:** React + Material UI (Vite)
  - File upload, chat interface, file manager, and settings.
- **Backend:** FastAPI (Python)
  - Handles file uploads, chunking, embedding, semantic search, and LLM requests.
- **Vector Search:** FAISS
  - Stores and searches document embeddings for relevant context.
- **LLM Server:** [Ollama](https://ollama.com/)
  - Runs local LLMs (TinyLlama, Llama 2, Mistral) and serves `/api/generate` endpoint.
- **Persistence:**
  - Uploaded files are stored in `backend/uploaded_files/`.
  - Chunks and FAISS index are stored in `backend/data/`.

### Key Endpoints

- `POST /upload` — Upload and process files.
- `POST /chat` — Ask a question; returns answer and source chunks.
- `GET /files` — List all stored files and chunk counts.
- `DELETE /files/{filename}` — Delete a file and its chunks.
- `GET /files/{filename}` — View the content of a stored file.
- `POST /rechunk` — Re-chunk and re-embed all files with a new chunk size.

### Customization

- **Chunk Size:** Adjustable per upload or via re-chunking.
- **LLM Model:** Selectable in the UI; models must be downloaded. See [Ollama Model Usage & URL Configuration](#ollama-model-usage--url-configuration).
- **Add Models:** Use `ollama pull <model>` to add more LLMs. See [Ollama Model Usage & URL Configuration](#ollama-model-usage--url-configuration).

---

## Requirements

- Docker & Docker Compose (for containerized setup)
- Or: Python 3.10+, Node.js 18+, npm (for manual setup)
- Ollama (for local LLM inference, if not using Docker Compose)

---

## Project Structure

```
Document-helper/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── data/
│   └── uploaded_files/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── docker-compose.yml
└── README.md
```

---

## Troubleshooting

- **Ollama model not found:**  
  Make sure the model (e.g., `tinyllama`) is pulled in the Ollama container or on your host.
- **Port conflicts:**  
  Ensure ports 8000 (backend), 5173 (frontend), and 11435 (Ollama) are free.
- **Permission errors (frontend):**  
  If you see EACCES errors, run `sudo rm -rf node_modules, and npm install` in the frontend directory.

---
