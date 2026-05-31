import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Header } from "./components/layout/Header";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="app-page" role="main">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
