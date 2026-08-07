// src/pages/UpdateLog.jsx
import { useEffect, useState } from "react";
import { collection, orderBy, query, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export default function UpdateLog() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "updateLog"), orderBy("data", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setUpdates(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">📋 Histórico de Atualizações</h1>
      <p className="text-gray-500 mb-6">Novidades e melhorias do Apoia+</p>

      {updates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
          <p>Nenhuma atualização registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-800 text-lg">{u.titulo}</p>
                  <p className="text-sm text-gray-500">v{u.versao}</p>
                </div>
                <span className="text-xs font-medium bg-brand-50 text-brand-700 px-3 py-1 rounded-full">
                  {u.tipo === "feature" ? "✨ Nova" : u.tipo === "fix" ? "🐛 Correção" : "🔧 Melhoria"}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{u.descricao}</p>
              <p className="text-xs text-gray-400">{u.data?.toDate?.()?.toLocaleDateString("pt-BR") || "data indisponível"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}