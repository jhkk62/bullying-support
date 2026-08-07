// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Foruns from "./pages/Foruns";
import Forum from "./pages/Forum"; // Adicionado!
import ForumDetail from "./pages/ForumDetail";
import PostDetail from "./pages/PostDetail"; // Adicionado!
import Admin from "./pages/Admin";
import Perfil from "./pages/Perfil";
import Notificacoes from "./pages/Notificacoes";
import UpdateLog from "./pages/UpdateLog";
import Termos from "./pages/Termos";
import SiteOffline from "./pages/SiteOffline";
import { auth } from "./firebase";
import { useStatusModeracao } from "./hooks/useModeracao";
import { useStatusSite } from "./hooks/useStatusSite";
import { useNotificaLogin } from "./hooks/useNotificaLogin";
import Alunos from "./pages/Alunos";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { banidoAte, admin } = useStatusModeracao(user);
  const { ativo } = useStatusSite();
  const location = useLocation();

  useNotificaLogin(user);

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
      <Navbar user={user} />
      <main className="flex-1 flex flex-col">
        {emManutencao ? <SiteOffline /> : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forum" element={<Foruns user={user} />} />
            {/* Rota para o feed geral dos fóruns de exemplo */}
            <Route path="/forum/geral" element={<Forum user={user} banidoAte={banidoAte} admin={admin} />} />
            {/* Rota para um fórum específico criado por usuários */}
            <Route path="/forum/:forumId" element={<ForumDetail user={user} banidoAte={banidoAte} admin={admin} />} />
            {/* Rota para ver os detalhes e comentários de um post */}
            <Route path="/post/:postId" element={<PostDetail user={user} banidoAte={banidoAte} admin={admin} />} />
            <Route path="/perfil" element={<Perfil user={user} />} />
            <Route path="/notificacoes" element={<Notificacoes user={user} />} />
            <Route path="/log" element={<UpdateLog />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/admin" element={<Admin user={user} admin={admin} ativo={ativo} />} />
            <Route path="/alunos" element={<Alunos />} />
          </Routes>
        )}
      </main>
      <Footer />
    </div>
  );
}