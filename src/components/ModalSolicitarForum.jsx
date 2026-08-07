// src/components/ModalSolicitarForum.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const ICONES = ["💭", "💪", "😢", "😡", "❤️", "🎓", "🎮", "📚", "🌟", "🤝"];

export default function ModalSolicitarForum({ user, onClose, onSucesso }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState("💭");
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!nome.trim() || !descricao.trim() || !motivo.trim()) return;

    setEnviando(true);
    try {
      await addDoc(collection(db, "solicitacoesForuns"), {
        nome: nome.trim(),
        descricao: descricao.trim(),
        icone,
        motivo: motivo.trim(),
        criadoPor: user.uid,
        status: "pendente",
        criadoEm: serverTimestamp(),
      });
      onSucesso();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Solicitar Novo Fórum</h2>
        <form onSubmit={enviar} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ícone do Fórum</label>
            <div className="flex gap-2 flex-wrap">
              {ICONES.map((ico) => (
                <button
                  key={ico}
                  type="button"
                  onClick={() => setIcone(ico)}
                  className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                    icone === ico
                      ? "border-brand-600 bg-brand-50"
                      : "border-gray-200 hover:border-brand-300"
                  }`}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Fórum</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Apoio Acadêmico, Relacionamentos..."
              maxLength={50}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Qual é o propósito deste fórum?"
              rows={3}
              maxLength={200}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-400 mt-1">{descricao.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Por que criar este fórum?</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Conte ao admin por que esse fórum é importante..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg"
            >
              {enviando ? "Enviando..." : "Solicitar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}