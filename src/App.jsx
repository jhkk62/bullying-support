// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Forum from "./pages/Forum";
import PostDetail from "./pages/PostDetail";
import VoiceChat from "./pages/VoiceChat";
import Admin from "./pages/Admin";
import { ensureAnonymousLogin } from "./firebase";
import { useStatusModeracao } from "./hooks/useModeracao";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { banidoAte, admin } = useStatusModeracao(user);

  useEffect(() => {
    ensureAnonymousLogin((loggedUser) => {
      setUser(loggedUser);
      setLoadingAuth(false);
    });
  }, []);

  if (loadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-50">
        <p className="text-brand-600 font-medium">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forum" element={<Forum user={user} banidoAte={banidoAte} admin={admin} />} />
          <Route path="/forum/:postId" element={<PostDetail user={user} banidoAte={banidoAte} admin={admin} />} />
          <Route path="/voz" element={<VoiceChat user={user} />} />
          <Route path="/admin" element={<Admin user={user} admin={admin} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}