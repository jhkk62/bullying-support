// src/pages/NotificacoesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, deleteDoc, updateDoc, getDoc, collection, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { useNotificacoes } from "../hooks/useNotificacoes";

export default function NotificacoesPage({ user }) {
  const navigate = useNavigate();
  const notificacoes = useNotificacoes(user);
  const [postsInfo, setPostsInfo] = useState({});
  const [usuariosInfo, setUsuariosInfo] = useState({});

  useEffect(() => {
    notificacoes.forEach((notif) => {
      // 1. Busca informações do post (se for notificação de comentário)
      if (notif.postId) {
        setPostsInfo((prev) => {
          if (prev[notif.postId]) return prev;
          getDoc(doc(db, "posts", notif.postId)).then((snap) => {
            if (snap.exists()) setPostsInfo((p) => ({ ...p, [notif.postId]: snap.data().titulo }));
          });
          return { ...prev, [notif.postId]: "Carregando..." };
        });
      }

      // 2. Busca informações do aluno (se for pedido de amizade)
      if (notif.tipo === "pedido_amizade" && notif.remetenteId) {
        setUsuariosInfo((prev) => {
          if (prev[notif.remetenteId]) return prev;
          getDoc(doc(db, "alunos", notif.remetenteId)).then((snap) => {
            if (snap.exists()) setUsuariosInfo((p) => ({ ...p, [notif.remetenteId]: snap.data() }));
          });
          return { ...prev, [notif.remetenteId]: { nome: "Carregando..." } };
        });
      }
    });
  }, [notificacoes]);

  // Função para abrir o post da notificação de comentário
  async function marcarComoLida(notifId, postId) {
    await updateDoc(doc(db, "notificacoes", notifId), { lida: true });
    navigate(`/forum/${postId}`);
  }

  // Função para deletar / recusar notificação
  async function excluirNotificacao(notifId) {
    await deleteDoc(doc(db, "notificacoes", notifId));
  }

  // Nova Função: Aceitar Pedido de Amizade (Usando Batch para garantir os dois lados)
  async function aceitarAmizade(notif) {
    if (!user?.uid || !notif.remetenteId) return;

    try {
      const batch = writeBatch(db);

      const refLado1 = doc(collection(db, "amizades"));
      const refLado2 = doc(collection(db, "amizades"));

      batch.set(refLado1, {
        usuarioId: user.uid,
        amigoId: notif.remetenteId,
        criadoEm: serverTimestamp(),
      });

      batch.set(refLado2, {
        usuarioId: notif.remetenteId,
        amigoId: user.uid,
        criadoEm: serverTimestamp(),
      });

      batch.delete(doc(db, "notificacoes", notif.id));

      await batch.commit();
      alert("✅ Pedido de amizade aceito!");
    } catch (err) {
      console.error("Erro ao aceitar amizade:", err);
      alert("Erro ao tentar aceitar amizade.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔔 Notificações</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Gerencie seus alertas e convites</p>

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
              
              {/* RENDERIZAÇÃO CONDICIONAL: Pedido de Amizade vs Comentário */}
              {notif.tipo === "pedido_amizade" ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🤝</span>
                      <p className="font-medium text-gray-900 dark:text-white">Pedido de Amizade</p>
                      {!notif.lida && (
                        <span className="inline-block w-2 h-2 bg-brand-600 dark:bg-brand-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>
                        {usuariosInfo[notif.remetenteId]?.apelido || usuariosInfo[notif.remetenteId]?.nome || "Um aluno"}
                      </strong> quer ser seu amigo.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {notif.criadoEm?.toDate?.()?.toLocaleString("pt-BR") || "há pouco"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => aceitarAmizade(notif)}
                      className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Aceitar
                    </button>
                    <button
                      onClick={() => excluirNotificacao(notif.id)}
                      className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ) : (
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
                      className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Ver Post
                    </button>
                    <button
                      onClick={() => excluirNotificacao(notif.id)}
                      className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}