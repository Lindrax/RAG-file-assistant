import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  TextField,
  MenuItem,
  Button,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import axios from "axios"

const llmModels = [
  { value: "tinyllama", label: "TinyLlama" },
  { value: "llama2", label: "Llama 2" },
  { value: "mistral", label: "Mistral" }
]

const Home = () => {
  const [chunkSize, setChunkSize] = useState(500)
  const [llmModel, setLlmModel] = useState("tinyllama")
  const [numChunks, setNumChunks] = useState(5)
  const navigate = useNavigate()

  const handleGoToChat = async() => {
    navigate("/chat", {
      state: {chunkSize, llmModel, numChunks}
    })
  }

  return ( 
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
          RAG File Assistant
        </Typography>
        <Typography variant="body1" gutterBottom>
          Welcome! This application lets you upload your documents and ask questions about them using Retrieval-Augmented Generation (RAG).
          You can adjust how your files are processed and which language model is used for answering your questions.
        </Typography>
        <Box mt={3}>
          <Stack spacing={2}>
            <Tooltip title="How many characters does a chunk contain">
            <TextField
              label="Chunk Size"
              type="number"
              value={chunkSize}
              onChange={e => setChunkSize(Number(e.target.value))}
              slotProps={{ input: { min: 50, max: 2000, step: 10 } }}
              fullWidth
            />
            </Tooltip>
            <Button
            variant={chunkSize == 500 ?"outlined" :"contained"}
            sx={{ mt: 1 }}
            onClick={async () => {
              const formData = new FormData();
              formData.append("chunk_size", chunkSize);
              await axios.post("http://localhost:8000/rechunk", formData);
              alert(`Re-chunked all files with chunk size ${chunkSize}`);
            }}
          >
            Re-chunk All Files
          </Button>
            <Tooltip title="What language model to use">
            <TextField
              select
              label="LLM Model"
              value={llmModel}
              onChange={e => setLlmModel(e.target.value)}
              fullWidth
            >
              {llmModels.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            </Tooltip>
            <Tooltip title="How many nearest chuncks are included as">
            <TextField
              label="Number of Nearest Chunks"
              type="number"
              value={numChunks}
              onChange={e => setNumChunks(Number(e.target.value))}
              slotProps={{ input: { min: 1, max: 20, step: 1 } }}
              fullWidth
            />
            </Tooltip>
            <Button
              variant="contained"
              size="large"
              sx={{ mt: 2 }}
              onClick={handleGoToChat}
            >
              Go to Chat
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  )
 
}

export default Home