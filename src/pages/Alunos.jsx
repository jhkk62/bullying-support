// src/pages/Alunos.jsx
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const TURMAS_ORDEM = ["6º A", "6º B", "7º A", "7º B", "8º A", "8º B", "9º A", "9º B", "1º A", "1º B", "2º ano", "3º ano"];

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "alunos"), orderBy("nome", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setAlunos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Agrupar por turma
  const alunosPorTurma = {};
  TURMAS_ORDEM.forEach((turma) => {
    alunosPorTurma[turma] = alunos.filter((a) => a.turma === turma);
  });

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👥 Alunos</h1>
          <p className="text-gray-500">Conheça seus colegas — perfis visíveis apenas aqui</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-700">
          <p className="font-medium mb-1">🔒 Privacidade no Fórum</p>
          <p>Os perfis abaixo são visíveis apenas nesta página. No fórum e comentários, você é 100% anônimo — ninguém sabe quem comentou, nem consegue ver este perfil.</p>
        </div>

        {Object.entries(alunosPorTurma).map(([turma, alunosTurma]) => (
          <div key={turma} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-600"></span>
              {turma} ({alunosTurma.length})
            </h2>

            {alunosTurma.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhum aluno nesta turma ainda.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {alunosTurma.map((aluno) => (
                  <div key={aluno.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                        {aluno.fotoUrl ? (
                          <img src={aluno.fotoUrl} alt={aluno.apelido} className="w-full h-full object-cover" />
                        ) : (
                          aluno.nome?.[0]?.toUpperCase() || "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{aluno.apelido || "Sem apelido"}</p>
                        <p className="text-xs text-gray-500">{aluno.turma}</p>
                      </div>
                    </div>
                    {aluno.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 border-t border-gray-100 pt-3">
                        "{aluno.bio}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}