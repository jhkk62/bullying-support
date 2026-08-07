// src/pages/Notificacoes.jsx
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function Notificacoes({ user }) {
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notificacoes"),
      where("usuarioId", "==", user.uid),
      orderBy("criadoEm", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotificacoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">🔔 Notificações</h1>
      <p className="text-gray-500 mb-6">Atividades na sua conta</p>

      {notificacoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          <p>Você está tudo certo — nenhuma notificação por enquanto.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificacoes.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="text-2xl mt-1">{n.tipo === "login" ? "🔓" : n.tipo === "ban" ? "⚠️" : "📨"}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{n.titulo}</p>
                  <p className="text-sm text-gray-500">{n.descricao}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {n.criadoEm?.toDate?.()?.toLocaleString("pt-BR") || "há pouco"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}