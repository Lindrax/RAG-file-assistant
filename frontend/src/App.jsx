import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import Home from "./components/Home";
import { AppBar, Toolbar, Typography, Button, Box, createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#A8E6CF",
      contrastText: "#222",
    },
    background: {
      default: "#F7FFF9", 
      paper: "#E0F7EF",   
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static" color="primary" sx={{ borderRadius: 0 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              RAG File Assistant
            </Typography>
            <Box>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/chat">
                Chat
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
