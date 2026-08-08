// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors">
      <p>9º Ano B — 2026 — Colégio Dom de Educar de Jequié</p>
      <p className="mt-1">
        Desenvolvido por{" "}
        <a href="https://www.instagram.com/jh_dss22/" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 hover:underline transition-colors">João Helder</a>
      </p>
      <p className="mt-1">
        <Link to="/termos" className="underline hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Termos de Uso</Link>
      </p>
    </footer>
  );
}