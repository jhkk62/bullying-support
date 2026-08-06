// src/pages/Perfil.jsx
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { db, auth } from "../firebase";

export default function Perfil({ user }) {
  const [apelido, setApelido] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "alunos", user.uid)).then((snap) => {
      if (snap.exists()) setApelido(snap.data().apelido || "");
    });
  }, [user]);

  async function salvarApelido(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await setDoc(doc(db, "alunos", user.uid), { apelido }, { merge: true });
      setMensagem("Apelido salvo!");
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(""), 2000);
    }
  }

  async function trocarSenha(e) {
    e.preventDefault();
    if (!novaSenha) return;
    setSalvando(true);
    try {
      await updatePassword(auth.currentUser, novaSenha);
      setNovaSenha("");
      setMensagem("Senha alterada!");
    } catch (err) {
      setMensagem("Não deu pra trocar. Saia e entre de novo antes de tentar.");
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(""), 3000);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Seu Perfil</h1>
      <p className="text-gray-500 text-sm mb-8">
        Isso é só pra você — ninguém mais vê seu nome, apelido ou qualquer coisa daqui nos seus posts ou comentários. Continuam 100% anônimos pra todo mundo.
      </p>

      <form onSubmit={salvarApelido} className="bg-white rounded-2xl shadow p-6 border border-gray-100 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Apelido (só você vê)</label>
        <input value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder="Como você quer ser chamado(a) por aqui"
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3" />
        <button disabled={salvando} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-full">Salvar</button>
      </form>

      <form onSubmit={trocarSenha} className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Trocar senha</label>
        <p className="text-xs text-gray-400 mb-2">Recomendamos trocar assim que entrar pela primeira vez, já que ela começa sendo sua data de nascimento.</p>
        <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="Nova senha"
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3" />
        <button disabled={salvando} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-full">Trocar senha</button>
      </form>

      {mensagem && <p className="text-green-600 text-sm mt-4 text-center">{mensagem}</p>}
    </div>
  );
}