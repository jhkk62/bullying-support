// src/components/SolicitacoesForuns.jsx
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function SolicitacoesForuns() {
  const [solicitacoes, setSolicitacoes] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "solicitacoesForuns"),
      where("status", "==", "pendente")
    );
    const unsub = onSnapshot(q, (snap) => {
      setSolicitacoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  async function aprovar(solicitacao) {
    // Cria o fórum
    await setDoc(doc(db, "foruns", solicitacao.nome.toLowerCase().replace(/\s+/g, "-")), {
      nome: solicitacao.nome,
      descricao: solicitacao.descricao,
      icone: solicitacao.icone,
      status: "aprovado",
      criadoPor: solicitacao.criadoPor,
      criadoEm: serverTimestamp(),
      totalPosts: 0,
      membros: 0,
    });

    // Atualiza a solicitação
    await updateDoc(doc(db, "solicitacoesForuns", solicitacao.id), {
      status: "aprovado",
    });
  }

  async function rejeitar(id) {
    await deleteDoc(doc(db, "solicitacoesForuns", id));
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Solicitações de Novos Fóruns ({solicitacoes.length})</h3>
      {solicitacoes.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhuma solicitação pendente.</p>
      ) : (
        <div className="space-y-3">
          {solicitacoes.map((sol) => (
            <div key={sol.id} className="flex items-start gap-3 bg-white rounded-lg border border-gray-100 p-4">
              <div className="text-3xl">{sol.icone}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800">{sol.nome}</p>
                <p className="text-sm text-gray-600 mb-2">{sol.descricao}</p>
                <p className="text-xs text-gray-500 mb-2 italic">Motivo: "{sol.motivo}"</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => aprovar(sol)}
                  className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-lg font-medium"
                >
                  ✅ Aprovar
                </button>
                <button
                  onClick={() => rejeitar(sol.id)}
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg font-medium"
                >
                  ❌ Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}