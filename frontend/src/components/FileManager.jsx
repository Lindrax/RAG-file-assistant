import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewContent, setViewContent] = useState("");
  const [viewFilename, setViewFilename] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    const res = await axios.get("http://localhost:8000/files");
    setFiles(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete file "${filename}" and all its chunks?`)) return;
    await axios.delete(`http://localhost:8000/files/${filename}`);
    fetchFiles();
  };

  const handleView = async (filename) => {
    setViewFilename(filename);
    setViewContent("Loading...");
    setViewOpen(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/files/${filename}`
      );
      setViewContent(res.data);
    } catch (e) {
      setViewContent("Could not load file content.", e);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Stored Files
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : files.length === 0 ? (
        <Typography color="text.secondary">No files stored.</Typography>
      ) : (
        <List>
          {files.map((file) => (
            <ListItem key={file.filename} divider>
              <ListItemText
                primary={file.filename}
                secondary={`Chunks: ${file.chunks}`}
              />
              <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                <IconButton
                  edge="end"
                  aria-label="view"
                  color="black"
                  onClick={() => handleView(file.filename)}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  color="error"
                  onClick={() => handleDelete(file.filename)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
      <Box mt={2}>
        <Button variant="contained" onClick={fetchFiles}>
          Refresh
        </Button>
      </Box>
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Viewing: {viewFilename}</DialogTitle>
        <DialogContent dividers>
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
          >
            {viewContent}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FileManager;