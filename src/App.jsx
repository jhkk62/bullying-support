// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Forum from "./pages/Forum";
import PostDetail from "./pages/PostDetail";
import VoiceChat from "./pages/VoiceChat";
import Admin from "./pages/Admin";
import Perfil from "./pages/Perfil";
import Termos from "./pages/Termos";
import SiteOffline from "./pages/SiteOffline";
import { auth } from "./firebase";
import { useStatusModeracao } from "./hooks/useModeracao";
import { useStatusSite } from "./hooks/useStatusSite";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { banidoAte, admin } = useStatusModeracao(user);
  const { ativo } = useStatusSite();
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setLoadingAuth(false); });
    return () => unsub();
  }, []);

  if (loadingAuth) {
    return <div className="h-screen flex items-center justify-center bg-brand-50"><p className="text-brand-600 font-medium">Carregando...</p></div>;
  }

  if (!user) return <Login />;

  const emManutencao = !ativo && location.pathname !== "/admin";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {emManutencao ? <SiteOffline /> : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forum" element={<Forum user={user} banidoAte={banidoAte} admin={admin} />} />
            <Route path="/forum/:postId" element={<PostDetail user={user} banidoAte={banidoAte} admin={admin} />} />
            <Route path="/voz" element={<VoiceChat user={user} />} />
            <Route path="/perfil" element={<Perfil user={user} />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/admin" element={<Admin user={user} admin={admin} ativo={ativo} />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  );
}