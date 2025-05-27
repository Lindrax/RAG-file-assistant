import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./components/Chat";
import Home from "./components/Home";

const App = () => {
return (
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
  </BrowserRouter>
)
}

export default App;
