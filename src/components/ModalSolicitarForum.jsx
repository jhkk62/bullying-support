// src/components/ModalSolicitarForum.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const ICONES = ["💭", "💪", "😢", "😡", "❤️", "🎓", "🎮", "📚", "🌟", "🤝", "🧠"];

export default function ModalSolicitarForum({ user, onClose, onSucesso }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState("💭");
  const [motivo, setMotivo] = useState("");
  const [privado, setPrivado] = useState(false);
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (!nome.trim() || !descricao.trim() || !motivo.trim()) return;
    if (privado && !senha.trim()) {
      alert("Digite uma senha para o fórum privado");
      return;
    }

    setEnviando(true);
    try {
      await addDoc(collection(db, "solicitacoesForuns"), {
        nome: nome.trim(),
        descricao: descricao.trim(),
        icone,
        motivo: motivo.trim(),
        privado,
        senha: privado ? senha.trim() : null,
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Solicitar Novo Fórum</h2>
        <form onSubmit={enviar} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ícone do Fórum</label>
            <div className="flex gap-2 flex-wrap">
              {ICONES.map((ico) => (
                <button
                  key={ico}
                  type="button"
                  onClick={() => setIcone(ico)}
                  className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                    icone === ico
                      ? "border-brand-600 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                      : "border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600"
                  }`}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nome do Fórum</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Apoio Acadêmico..."
              maxLength={50}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Qual é o propósito deste fórum?"
              rows={3}
              maxLength={200}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{descricao.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Por que criar este fórum?</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Conte ao admin..."
              rows={3}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="checkbox"
              id="privado"
              checked={privado}
              onChange={(e) => setPrivado(e.target.checked)}
              className="w-4 h-4 accent-brand-600 dark:accent-brand-500 rounded"
            />
            <label htmlFor="privado" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
              🔒 Fazer este fórum privado (requer senha)
            </label>
          </div>

          {privado && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Senha do Fórum</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha para entrar"
                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {enviando ? "Enviando..." : "Solicitar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}