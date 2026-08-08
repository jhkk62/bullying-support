// src/pages/Diario.jsx
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Diario({ user }) {
  const [entradas, setEntradas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [emocao, setEmocao] = useState("😊");
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const EMOCOES = ["😊", "😢", "😡", "😴", "😨", "😍", "🤔", "😤"];

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "alunos", user.uid, "diario"),
      where("privado", "==", true) // Sempre privado
    );

    const unsub = onSnapshot(q, (snap) => {
      setEntradas(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => b.criadoEm?.toDate?.() - a.criadoEm?.toDate?.())
      );
    });

    return () => unsub();
  }, [user]);

  async function salvarEntrada(e) {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim()) return;

    setEnviando(true);
    try {
      if (editandoId) {
        // Atualizar entrada existente
        await updateDoc(doc(db, "alunos", user.uid, "diario", editandoId), {
          titulo: titulo.trim(),
          texto: texto.trim(),
          emocao,
          atualizadoEm: serverTimestamp(),
        });
        setEditandoId(null);
      } else {
        // Criar nova entrada
        await addDoc(collection(db, "alunos", user.uid, "diario"), {
          titulo: titulo.trim(),
          texto: texto.trim(),
          emocao,
          privado: true,
          criadoEm: serverTimestamp(),
        });
      }
      setTitulo("");
      setTexto("");
      setEmocao("😊");
    } finally {
      setEnviando(false);
    }
  }

  async function excluirEntrada(entradaId) {
    if (!confirm("Excluir esta entrada? Não é possível recuperar.")) return;
    await deleteDoc(doc(db, "alunos", user.uid, "diario", entradaId));
  }

  function iniciarEdicao(entrada) {
    setTitulo(entrada.titulo);
    setTexto(entrada.texto);
    setEmocao(entrada.emocao);
    setEditandoId(entrada.id);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white dark:from-gray-900 dark:to-gray-950 py-10">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📔 Diário Emocional</h1>
          <p className="text-gray-600 dark:text-gray-400">Um espaço 100% privado e confidencial para você</p>
        </div>

        {/* Info Privacidade */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8 text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">🔒 Segredíssimo</p>
          <p>Estas notas são salvas EXCLUSIVAMENTE na sua conta. Ninguém consegue ver, nem o admin, nem outros alunos. Só você tem acesso.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={salvarEntrada} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {editandoId ? "✏️ Editar Entrada" : "✍️ Nova Entrada"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Como você está?</label>
              <div className="flex gap-2 flex-wrap">
                {EMOCOES.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEmocao(e)}
                    className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                      emocao === e
                        ? "border-brand-600 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Um dia difícil, Reflexão sobre amigos..."
                maxLength={100}
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">O que está acontecendo?</label>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva aqui tudo o que está sentindo. Ninguém vai ler..."
                rows={5}
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-3">
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null);
                    setTitulo("");
                    setTexto("");
                    setEmocao("😊");
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={enviando}
                className="flex-1 bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
              >
                {enviando ? "Salvando..." : editandoId ? "Atualizar" : "Salvar Entrada"}
              </button>
            </div>
          </div>
        </form>

        {/* Lista de Entradas */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Suas Entradas ({entradas.length})</h2>

          {entradas.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-400 dark:text-gray-500">
              <p className="text-lg mb-2">📝 Nenhuma entrada ainda</p>
              <p className="text-sm">Comece a escrever seus pensamentos acima</p>
            </div>
          ) : (
            entradas.map((entrada) => (
              <div key={entrada.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{entrada.emocao}</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{entrada.titulo}</h3>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {entrada.criadoEm?.toDate?.()?.toLocaleString("pt-BR") || "data desconhecida"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => iniciarEdicao(entrada)}
                      className="px-3 py-2 text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => excluirEntrada(entrada.id)}
                      className="px-3 py-2 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-3">{entrada.texto}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}