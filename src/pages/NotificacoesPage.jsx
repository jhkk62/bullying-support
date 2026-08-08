// src/pages/NotificacoesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNotificacoes } from "../hooks/useNotificacoes";

export default function NotificacoesPage({ user }) {
  const navigate = useNavigate();
  const notificacoes = useNotificacoes(user);
  const [postsInfo, setPostsInfo] = useState({});

  useEffect(() => {
    notificacoes.forEach(async (notif) => {
      if (notif.postId && !postsInfo[notif.postId]) {
        try {
          const snap = await getDoc(doc(db, "posts", notif.postId));
          if (snap.exists()) {
            setPostsInfo((prev) => ({
              ...prev,
              [notif.postId]: snap.data().titulo,
            }));
          }
        } catch (err) {
          console.error("Erro ao buscar post:", err);
        }
      }
    });
  }, [notificacoes, postsInfo]);

  async function marcarComoLida(notifId, postId) {
    await updateDoc(doc(db, "notificacoes", notifId), { lida: true });
    navigate(`/forum/${postId}`);
  }

  async function excluirNotificacao(notifId) {
    await deleteDoc(doc(db, "notificacoes", notifId));
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔔 Notificações</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Alertas sobre seus posts</p>

      {notificacoes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500">
          <p>Você não tem notificações ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border ${
                notif.lida
                  ? "border-gray-200 dark:border-gray-700"
                  : "border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/30"
              } p-4 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">💬</span>
                    <p className="font-medium text-gray-900 dark:text-white">Novo comentário</p>
                    {!notif.lida && (
                      <span className="inline-block w-2 h-2 bg-brand-600 dark:bg-brand-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {postsInfo[notif.postId] || "Carregando..."}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {notif.criadoEm?.toDate?.()?.toLocaleString("pt-BR") || "há pouco"}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => marcarComoLida(notif.id, notif.postId)}
                    className="px-3 py-2 text-sm bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => excluirNotificacao(notif.id)}
                    className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}