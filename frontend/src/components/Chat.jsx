import { useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SendIcon from "@mui/icons-material/Send";
import { useLocation } from "react-router-dom";

const Chat = () => {
  const location = useLocation();
  const { chunkSize = 500, llmModel = "tinyllama", numChunks = 5 } = location.state || {};
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(false);

  const uploadFiles = async () => {
    const formData = new FormData();
    for (let file of files) {
      formData.append("files", file);
    }
    formData.append("chunk_size", chunkSize)
    await axios.post("http://localhost:8000/upload", formData);
    alert(`Uploaded ${files.length} files successfully`);
  };

  const ask = async () => {
    setLoading(true);
    setResponse("");
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("llm_model", llmModel);
    formData.append("num_chunks", numChunks);
    try {
      const res = await axios.post("http://localhost:8000/chat", formData);
      setResponse(res.data.answer);
      console.log(res.data.sources)
      setSources(res.data.sources || [])
    } catch (e) {
      setResponse("Error: Could not get answer.", e);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          RAG File Assistant
        </Typography>
        <Stack spacing={2}>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
          >
            Select Files
            <input
              type="file"
              hidden
              multiple
              onChange={e => setFiles(Array.from(e.target.files))}
            />
          </Button>
          <Typography variant="body2" color="text.secondary">
            {files.length > 0
              ? `${files.length} file(s) selected`
              : "No files selected"}
          </Typography>
          <Button
            variant={files.length > 0 ? "contained" : "outlined"}
            onClick={uploadFiles}
            disabled={files.length === 0}
          >
            Upload
          </Button>
          <TextField
            label="Ask a question about your files..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            onClick={ask}
            disabled={!prompt || loading}
          >
            Ask
          </Button>
          <Box minHeight={80} display="flex" alignItems="center" justifyContent="center">
            {loading ? (
              <CircularProgress />
            ) : (
              response && (
                <Paper elevation={1} sx={{ p: 2, width: "100%" }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Response:
                  </Typography>
                  <Typography variant="body1">{response}</Typography>
                  {sources.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Retrieved Chunks:
                      </Typography>
                      <Stack spacing={2}>
                        {sources.map((src, i) => (
                          <Paper key={i} elevation={1} sx={{ p: 1, backgroundColor: "#f9f9f9" }}>
                            <Typography variant="caption" color="text.secondary">
                              File: <strong>{src.file}</strong> — Chunk #{src.index}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}
                            >
                              {src.chunk}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Paper>
              )
            )}
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Chat;
