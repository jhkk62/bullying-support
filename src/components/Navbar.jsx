import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full font-medium transition-colors ${
      isActive
        ? "bg-brand-600 text-white"
        : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
        <span className="text-xl font-bold text-brand-700">🤝 Apoia+</span>
        <div className="flex gap-2">
          <NavLink to="/" end className={linkClass}>Início</NavLink>
          <NavLink to="/forum" className={linkClass}>Fóruns</NavLink>
          <NavLink to="/voz" className={linkClass}>Chat de Voz</NavLink>
        </div>
      </div>
    </nav>
  );
}