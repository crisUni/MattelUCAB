import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Header } from "./components/layout/Header";
import { Dashboard } from "./pages/Dashboard";
import { SessionProvider } from "./context/SessionContext";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import "./index.css";

/** Cascarón con el Header global (intacto) + rutas. */
function Shell() {
  const navigate = useNavigate();
  return (
    <>
      <Header
        logoTo="/"
        onDesignClick={() => navigate("/app")}
        onAccountClick={() => navigate("/")}
        designDisabled={false}
      />
      <main className="app-page" role="main">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<Dashboard />} />
        </Routes>
      </main>
    </>
  );
}

export function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
