import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatSteve from "./pages/ChatSteve";
import ChatSunpich from "./pages/ChatSunpich";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat/steve" element={<ChatSteve />} />
        <Route path="/chat/sunpich" element={<ChatSunpich />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;