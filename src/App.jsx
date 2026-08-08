// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BotaoSOS from "./components/BotaoSOS";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Foruns from "./pages/Foruns";
import ForumDetail from "./pages/ForumDetail";
import Admin from "./pages/Admin";
import Perfil from "./pages/Perfil";
import Notificacoes from "./pages/NotificacoesPage";
import UpdateLog from "./pages/UpdateLog";
import Termos from "./pages/Termos";
import Alunos from "./pages/Alunos";
import Diario from "./pages/Diario";
import Amigos from "./pages/Amigos";
import Chat from "./pages/Chat";
import GerenciarAlunos from "./pages/GerenciarAlunos";
import SiteOffline from "./pages/SiteOffline";
import { auth } from "./firebase";
import { useStatusModeracao } from "./hooks/useModeracao";
import { useStatusSite } from "./hooks/useStatusSite";
import { useNotificaLogin } from "./hooks/useNotificaLogin";
import { useHeartbeat } from "./hooks/useHeartbeat";
import { useDarkMode } from "./hooks/useDarkMode";

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { banidoAte, admin } = useStatusModeracao(user);
  const { ativo } = useStatusSite();
  const location = useLocation();

  useNotificaLogin(user);
  useHeartbeat(user);
  useDarkMode();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsub();
  }, []);

  if (loadingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-brand-50 dark:bg-gray-900">
        <p className="text-brand-600 dark:text-brand-400 font-medium">Carregando...</p>
      </div>
    );
  }

  if (!user) return <Login />;

  const emManutencao = !ativo && location.pathname !== "/admin";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors">
      <Navbar user={user} />
      <main className="flex-1 flex flex-col">
        {emManutencao ? (
          <SiteOffline />
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forum" element={<Foruns user={user} />} />
            <Route path="/forum/:forumId" element={<ForumDetail user={user} banidoAte={banidoAte} admin={admin} />} />
            <Route path="/perfil" element={<Perfil user={user} />} />
            <Route path="/notificacoes" element={<Notificacoes user={user} />} />
            <Route path="/log" element={<UpdateLog />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/alunos" element={<Alunos />} />
            <Route path="/diario" element={<Diario user={user} />} />
            <Route path="/amigos" element={<Amigos user={user} />} />
            <Route path="/chat/:amigoId" element={<Chat user={user} />} />
            <Route path="/admin" element={<Admin user={user} admin={admin} ativo={ativo} />} />
            <Route path="/admin/gerenciar-alunos" element={<GerenciarAlunos admin={admin} />} />
          </Routes>
        )}
      </main>
      <Footer />
      <BotaoSOS user={user} />
    </div>
  );
}