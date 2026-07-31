// src/pages/Admin.jsx
import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Admin({ user, admin }) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      // Essa escrita só é aceita se o código bater com o valor guardado
      // nas Regras do Firestore (o "6234" fica lá, não aqui no código React)
      await setDoc(doc(db, "admins", user.uid), { codigo, criadoEm: serverTimestamp() });
    } catch (err) {
      setErro("Código incorreto.");
    } finally {
      setEnviando(false);
    }
  }

  if (admin) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Modo Admin ativo ✅</h1>
        <p className="text-gray-500">Agora vai aparecer um ✕ em todos os posts e comentários do Fórum.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acesso Admin</h1>
      <form onSubmit={entrar} className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <input
          type="password"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Digite o código"
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}
        <button disabled={enviando} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2 rounded-full">
          {enviando ? "Verificando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}