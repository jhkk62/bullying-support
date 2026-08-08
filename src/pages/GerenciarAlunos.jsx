// src/pages/GerenciarAlunos.jsx
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db } from "../firebase";
import ModalEditarAluno from "../components/ModalEditarAluno";

const TURMAS = ["6º A", "6º B", "7º A", "7º B", "8º A", "8º B", "9º A", "9º B", "1º A", "1º B", "2º ano", "3º ano"];

export default function GerenciarAlunos({ admin }) {
  const [alunos, setAlunos] = useState([]);
  const [filtroTurma, setFiltroTurma] = useState("");
  const [buscaNome, setBuscaNome] = useState("");
  const [modalAberta, setModalAberta] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "alunos"), (snap) => {
      setAlunos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const alunosFiltrados = alunos.filter((a) => {
    const turmaOk = !filtroTurma || a.turma === filtroTurma;
    const nomeOk = !buscaNome || a.nome.toLowerCase().includes(buscaNome.toLowerCase());
    return turmaOk && nomeOk;
  });

  async function excluirAluno(alunoId, nome) {
    if (!confirm(`Tem CERTEZA que quer excluir ${nome}? Essa ação não pode ser revertida!`)) return;
    
    try {
      await deleteDoc(doc(db, "alunos", alunoId));
      alert("✅ Aluno excluído");
    } catch (err) {
      alert("❌ Erro ao excluir: " + err.message);
    }
  }

  function abrirModalEdicao(aluno) {
    setAlunoSelecionado(aluno);
    setModalAberta(true);
  }

  if (!admin) return <p className="text-center py-10">Acesso negado</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">👥 Gerenciar Alunos</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Edite ou remova perfis problemáticos</p>

      {/* Filtros */}
      <div className="flex gap-4 mb-8 flex-col sm:flex-row">
        <select
          value={filtroTurma}
          onChange={(e) => setFiltroTurma(e.target.value)}
          className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todas as turmas</option>
          {TURMAS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <input
          type="text"
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
          placeholder="Buscar por nome..."
          className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">Nome</th>
              <th className="text-left font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">Turma</th>
              <th className="text-left font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">Apelido</th>
              <th className="text-left font-semibold text-gray-700 dark:text-gray-300 py-3 px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunosFiltrados.map((aluno) => (
              <tr key={aluno.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="py-3 px-4 text-gray-900 dark:text-white">{aluno.nome}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{aluno.turma}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{aluno.apelido || "-"}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    onClick={() => abrirModalEdicao(aluno)}
                    className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => excluirAluno(aluno.id, aluno.nome)}
                    className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    🗑️ Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alunosFiltrados.length === 0 && (
        <p className="text-center py-10 text-gray-400 dark:text-gray-500">Nenhum aluno encontrado</p>
      )}

      {modalAberta && alunoSelecionado && (
        <ModalEditarAluno
          aluno={alunoSelecionado}
          onClose={() => setModalAberta(false)}
          onSalvar={() => setModalAberta(false)}
        />
      )}
    </div>
  );
}