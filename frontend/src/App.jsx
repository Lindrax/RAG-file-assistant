import { useState } from "react";
import axios from "axios";

const App = () => {
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const uploadFiles = async () => {
    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }
    await axios.post("http://localhost:8000/upload", formData);
    alert(`Uploaded ${files.length} files successfully`);
  };

  const ask = async () => {
    const formData = new FormData();
    formData.append("prompt", prompt);
    const res = await axios.post("http://localhost:8000/chat", formData);
    setResponse(res.data.answer);
  };

  return (
    <div>
      <h1 >RAG File Assistant</h1>
      <input type="file" 
        multiple 
        onChange={e => setFiles(Array.from(e.target.files))} />
      <button onClick={uploadFiles}>Upload</button>
      <div>
        <input
         
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ask a question about your files..."
        />
        <button onClick={ask}>Ask</button>
      </div>
      <div>
        <strong>Response:</strong>
        <p>{response}</p>
      </div>
    </div>
  );
}



export default App
