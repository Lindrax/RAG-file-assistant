import { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  SecondaryAction,
  Box,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

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
              <SecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  color="error"
                  onClick={() => handleDelete(file.filename)}
                >
                  <DeleteIcon />
                </IconButton>
              </SecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
      <Box mt={2}>
        <Button variant="contained" onClick={fetchFiles}>
          Refresh
        </Button>
      </Box>
    </Paper>
  );
};

export default FileManager;