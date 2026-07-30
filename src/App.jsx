import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Forum from "./pages/Forum";
import PostDetail from "./pages/PostDetail";
import VoiceChat from "./pages/VoiceChat";
import { ensureAnonymousLogin } from "./firebase";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forum" element={<Forum user={user} />} />
        <Route path="/forum/:postId" element={<PostDetail user={user} />} />
        <Route path="/voz" element={<VoiceChat user={user} />} />
      </Routes>
    </div>
  );
}