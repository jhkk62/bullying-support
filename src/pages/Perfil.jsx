// src/pages/Perfil.jsx
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { db, auth } from "../firebase";
import AvatarUpload from "../components/AvatarUpload";
import { useDarkMode } from "../hooks/useDarkMode";

export default function Perfil({ user }) {
  const [aluno, setAluno] = useState(null);
  const [apelido, setApelido] = useState("");
  const [bio, setBio] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "alunos", user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAluno(data);
        setApelido(data.apelido || "");
        setBio(data.bio || "");
        setFotoUrl(data.fotoUrl || "");
      }
    });
  }, [user]);

  async function salvarPerfil(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await setDoc(doc(db, "alunos", user.uid), { apelido, bio, fotoUrl }, { merge: true });
      setMensagem("✅ Perfil atualizado!");
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
      setMensagem("✅ Senha alterada!");
    } catch (err) {
      setMensagem("❌ Saia e entre de novo antes de tentar.");
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(""), 2000);
    }
  }

  if (!aluno) return <p className="text-center py-10 text-gray-400 dark:text-gray-500">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-600 to-brand-700 dark:from-gray-900 dark:to-gray-950">
      {/* Header com Avatar */}
      <div className="relative pb-40">
        <div className="h-24 bg-gradient-to-r from-brand-600 via-purple-600 to-brand-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="absolute -bottom-20 left-6 sm:left-10">
          <AvatarUpload user={user} onUploadComplete={setFotoUrl} currentUrl={fotoUrl} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 pt-24">
        {/* Info do Aluno */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{aluno.nome}</h1>
              <p className="text-brand-600 dark:text-brand-400 font-medium mb-4">{aluno.turma}</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              <span className="text-2xl">{isDark ? "☀️" : "🌙"}</span>
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">ℹ️ Seu Perfil</p>
            <p>O apelido e a foto que você escolher aparecerão apenas quando você comentar em fóruns. No resto do site você é 100% anônimo.</p>
            <p className="mt-2 font-medium">👉 Veja todos os perfis na aba "Alunos"</p>
          </div>

          <p className="text-gray-400 dark:text-gray-500 text-xs">ID: <code className="text-gray-500 dark:text-gray-400 font-mono">{user.uid.substring(0, 12)}...</code></p>
        </div>

        {/* Mensagem */}
        {mensagem && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm rounded-lg p-4 mb-6">
            {mensagem}
          </div>
        )}

        {/* Editar Perfil */}
        <form onSubmit={salvarPerfil} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">✏️ Personalizar Perfil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apelido</label>
              <input
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Como quer ser chamado(a)?"
                maxLength={30}
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Só você vê isso. Aparece nos seus comentários.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Algo sobre você..."
                rows={3}
                maxLength={150}
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{bio.length}/150</p>
            </div>
            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {/* Trocar Senha */}
        <form onSubmit={trocarSenha} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔑 Segurança</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nova Senha</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recomendamos uma senha segura com letras, números e símbolos.</p>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={salvando || !novaSenha}
              className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {salvando ? "Alterando..." : "Trocar Senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}