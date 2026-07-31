// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Início", end: true },
  { to: "/forum", label: "Fóruns", end: false },
  { to: "/voz", label: "Chat de Voz", end: false },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
        <span className="text-xl font-bold text-brand-700">🤝 Apoia+</span>
        <div className="flex gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="relative px-4 py-2 rounded-full font-medium hover:bg-brand-50 transition-colors"
            >
              {({ isActive }) => (
                <>
                  {/* a "pílula" roxa que desliza entre as abas */}
                  {isActive && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 bg-brand-600 rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? "text-white" : "text-gray-600"}`}>
                    {link.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}