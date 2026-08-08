// src/components/ModalAdicionarAmigo.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function ModalAdicionarAmigo({ user, alunosDisponiveis, onClose, onSucesso }) {
  const [selecionado, setSelecionado] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Lógica para agrupar a lista de alunos por turma
  const alunosPorTurma = alunosDisponiveis.reduce((acc, aluno) => {
    const turma = aluno.turma || "Sem turma";
    if (!acc[turma]) acc[turma] = [];
    acc[turma].push(aluno);
    return acc;
  }, {});

  const turmasOrdenadas = Object.keys(alunosPorTurma).sort();

  async function enviar(e) {
    e.preventDefault();
    if (!selecionado) return;

    setEnviando(true);
    try {
      await addDoc(collection(db, "notificacoes"), {
        usuarioId: selecionado, 
        remetenteId: user.uid,
        tipo: "pedido_amizade",
        lida: false,
        criadoEm: serverTimestamp(),
      });
      onSucesso();
    } catch (error) {
      console.error("Erro ao enviar pedido:", error);
      alert("Erro ao enviar o pedido de amizade.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 sm:p-10 border border-gray-100 dark:border-gray-700">
        
        <div className="text-center mb-8">
          <div className="bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🤝
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Adicionar Amigo</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Selecione o colega abaixo. Ele receberá uma notificação para aceitar.
          </p>
        </div>

        <form onSubmit={enviar} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Pesquisar aluno por turma
            </label>
            <select
              value={selecionado}
              onChange={(e) => setSelecionado(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-base cursor-pointer"
            >
              <option value="">Escolha um aluno...</option>
              {turmasOrdenadas.map((turma) => (
                <optgroup key={turma} label={turma} className="font-bold text-gray-900 dark:text-gray-300">
                  {alunosPorTurma[turma].map((aluno) => (
                    <option key={aluno.id} value={aluno.id} className="font-normal text-gray-700 dark:text-gray-200">
                      {aluno.apelido || aluno.nome}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-4 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !selecionado}
              className="flex-1 bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl shadow-md shadow-brand-500/30 transition-all"
            >
              {enviando ? "Enviando..." : "Enviar Pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}