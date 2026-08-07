// src/components/ModalDenuncia.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const MOTIVOS = [
  "Linguagem ofensiva/xingamentos",
  "Ameaça de violência",
  "Assédio ou intimidação",
  "Conteúdo tóxico ou prejudicial",
  "Spam ou conteúdo irrelevante",
  "Outro",
];

export default function ModalDenuncia({ postId, onClose, onSucesso }) {
  const [motivo, setMotivo] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviarDenuncia(e) {
    e.preventDefault();
    if (!motivo) return;
    setEnviando(true);
    try {
      await addDoc(collection(db, "denuncias"), {
        postId,
        motivo,
        detalhes: detalhes.trim(),
        criadoPor: "anonimo",
        criadoEm: serverTimestamp(),
      });
      onSucesso();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Denunciar este post</h2>
        <form onSubmit={enviarDenuncia} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo da denúncia</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Selecione um motivo</option>
              {MOTIVOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detalhes (opcional)</label>
            <textarea
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              placeholder="Conte mais se achar necessário..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!motivo || enviando}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg"
            >
              {enviando ? "Enviando..." : "Denunciar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}