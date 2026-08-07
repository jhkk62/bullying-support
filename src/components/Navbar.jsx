// src/components/Navbar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const links = [
  { to: "/", label: "Início", end: true },
  { to: "/forum", label: "Fóruns", end: false },
  { to: "/alunos", label: "Alunos", end: false },
  { to: "/admin", label: "Admin", end: false },
];

export default function Navbar({ user }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const navigate = useNavigate();

  async function sair() {
    await signOut(auth);
    setMenuAberto(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <span className="text-lg sm:text-xl font-bold text-brand-700">🤝 Apoia+</span>

        {/* Links (hidden em mobile, visible em desktop) */}
        <div className="hidden sm:flex gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="relative px-4 py-2 rounded-full font-medium hover:bg-brand-50 transition-colors"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-brand-600 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-600"}`}>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center hover:bg-brand-700 transition-colors text-sm shadow-md"
            title="Menu"
          >
            {user?.email?.[0]?.toUpperCase() || "?"}
          </button>

          {menuAberto && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
              <NavLink
                to="/"
                onClick={() => setMenuAberto(false)}
                className="block sm:hidden px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
              >
                🏠 Início
              </NavLink>
              <NavLink
                to="/forum"
                onClick={() => setMenuAberto(false)}
                className="block sm:hidden px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
              >
                💬 Fóruns
              </NavLink>
              <NavLink
                to="/admin"
                onClick={() => setMenuAberto(false)}
                className="block sm:hidden px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
              >
                ⚙️ Admin
              </NavLink>
              
              <div className="border-t border-gray-100 py-1">
                <NavLink
                  to="/perfil"
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                ><NavLink
  to="/alunos"
  onClick={() => setMenuAberto(false)}
  className="block sm:hidden px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
>
  👥 Alunos
</NavLink>
                  👤 Perfil
                </NavLink>
                <NavLink
                  to="/notificacoes"
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  🔔 Notificações
                </NavLink>
                <NavLink
                  to="/log"
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  📋 Atualizações
                </NavLink>
                <NavLink
                  to="/termos"
                  onClick={() => setMenuAberto(false)}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                >
                  📖 Termos
                </NavLink>
              </div>
              
              <button
                onClick={sair}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
              >
                🚪 Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}