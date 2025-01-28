import Index from "./scenes/main";
import Create from "./scenes/create";
import Explore from "./scenes/explore";
import About from "./scenes/about";
import { BrowserRouter, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<Create />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
