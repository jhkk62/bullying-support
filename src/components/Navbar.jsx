// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNotificacoes, getNotificacoesNaoLidas } from "../hooks/useNotificacoes";

const links = [
  { to: "/", label: "Início", end: true },
  { to: "/forum", label: "Fóruns", end: false },
  { to: "/alunos", label: "Alunos", end: false },
  { to: "/amigos", label: "Amigos", end: false }, // <-- Adicionado aqui
  { to: "/admin", label: "Admin", end: false },
];

export default function Navbar({ user }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilData, setPerfilData] = useState(null);
  const navigate = useNavigate();
  const notificacoes = useNotificacoes(user);
  const naoLidas = getNotificacoesNaoLidas(notificacoes);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "alunos", user.uid)).then((snap) => {
      if (snap.exists()) {
        setPerfilData(snap.data());
      }
    });
  }, [user]);

  async function sair() {
    await signOut(auth);
    setMenuAberto(false);
  }

  const inicial = perfilData?.nome?.[0]?.toUpperCase() || "?";

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm dark:bg-gray-900/90 dark:border-gray-800 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <span className="text-lg sm:text-xl font-bold text-brand-700 dark:text-brand-400">🤝 Apoia+</span>

        {/* Links (hidden em mobile) */}
        <div className="hidden sm:flex gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="relative px-4 py-2 rounded-full font-medium hover:bg-brand-50 dark:hover:bg-gray-800 transition-colors"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-brand-600 dark:bg-brand-700 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Notificações + Avatar */}
        <div className="flex items-center gap-3">
          {/* Sino de Notificações */}
          <button
            onClick={() => navigate("/notificacoes")}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Notificações"
          >
            <span className="text-xl">🔔</span>
            {naoLidas > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {naoLidas > 9 ? "9+" : naoLidas}
              </span>
            )}
          </button>

          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="w-10 h-10 rounded-full bg-brand-600 dark:bg-brand-700 hover:bg-brand-700 dark:hover:bg-brand-600 transition-colors shadow-md overflow-hidden flex items-center justify-center flex-shrink-0"
              title="Menu"
            >
              {perfilData?.fotoUrl ? (
                <img
                  src={perfilData.fotoUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">{inicial}</span>
              )}
            </button>

            {menuAberto && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
                <NavLink
                  to="/"
                  onClick={() => setMenuAberto(false)}
                  className="block sm:hidden px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                >
                  🏠 Início
                </NavLink>
                <NavLink
                  to="/forum"
                  onClick={() => setMenuAberto(false)}
                  className="block sm:hidden px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                >
                  💬 Fóruns
                </NavLink>
                <NavLink
                  to="/alunos"
                  onClick={() => setMenuAberto(false)}
                  className="block sm:hidden px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                >
                  👥 Alunos
                </NavLink>
                {/* Adicionado menu Amigos para mobile */}
                <NavLink
                  to="/amigos"
                  onClick={() => setMenuAberto(false)}
                  className="block sm:hidden px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                >
                  🤝 Amigos
                </NavLink>
                <NavLink
                  to="/admin"
                  onClick={() => setMenuAberto(false)}
                  className="block sm:hidden px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                >
                  ⚙️ Admin
                </NavLink>

                <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                  <NavLink
                    to="/perfil"
                    onClick={() => setMenuAberto(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  >
                    👤 Perfil
                  </NavLink>
                  <NavLink
                    to="/notificacoes"
                    onClick={() => setMenuAberto(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  >
                    🔔 Notificações {naoLidas > 0 && `(${naoLidas})`}
                  </NavLink>
                  <NavLink
                    to="/log"
                    onClick={() => setMenuAberto(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  >
                    📋 Atualizações
                  </NavLink>
                  <NavLink
                    to="/termos"
                    onClick={() => setMenuAberto(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  >
                    📖 Termos
                  </NavLink>
                </div>

                <button
                  onClick={sair}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  🚪 Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}