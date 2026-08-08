// src/pages/Admin.jsx
import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import RoboManutencao from "../components/RoboManutencao";
import PainelAdmin from "../components/PainelAdmin";

export default function Admin({ user, admin, ativo }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrarComoAdmin(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await setDoc(doc(db, "admins", user.uid), { codigo, criadoEm: serverTimestamp() });
    } catch {
      setErro("Código incorreto.");
    } finally {
      setEnviando(false);
    }
  }

  async function reativarSite(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await setDoc(doc(db, "config", "site"), { ativo: true, codigo });
      setCodigo("");
    } catch {
      setErro("Código incorreto.");
    } finally {
      setEnviando(false);
    }
  }

  async function tirarSiteDoAr() {
    if (!confirm("Isso vai tirar o site do ar para TODOS os visitantes imediatamente. Ninguém vai conseguir usar o Fórum ou o Chat de Voz até você reativar. Tem certeza?")) return;
    await setDoc(doc(db, "config", "site"), { ativo: false });
  }

  if (!ativo) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <RoboManutencao />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-6 mb-2">Site desativado</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Digite o código de admin para reativar o site.</p>
        <form onSubmit={reativarSite} className="flex gap-2">
          <input
            type="password"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="senha..."
            className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button disabled={enviando} className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-full transition-colors">
            {enviando ? "..." : "Reativar site"}
          </button>
        </form>
        {erro && <p className="text-red-500 text-sm mt-3">{erro}</p>}
      </div>
    );
  }

  if (admin) {
    return <PainelAdmin onDesligar={tirarSiteDoAr} admin={admin} />;
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Acesso Admin</h1>
      <form onSubmit={entrarComoAdmin} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border border-gray-100 dark:border-gray-700">
        <input
          type="password"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Digite o código"
          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}
        <button disabled={enviando} className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-2 rounded-full transition-colors">
          {enviando ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}