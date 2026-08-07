// src/pages/Foruns.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ModalSolicitarForum from "../components/ModalSolicitarForum";

// Posts de exemplo (pra inspirar)
const FORUNS_EXEMPLO = [
  {
    id: "exemplo-1",
    nome: "Pressão Acadêmica",
    descricao: "Espaço para discutir provas, trabalhos e ansiedade nos estudos",
    icone: "📚",
    totalPosts: 0,
    membros: 0,
  },
  {
    id: "exemplo-2",
    nome: "Relacionamentos",
    descricao: "Converse sobre amizades, relacionamentos amorosos e conflitos",
    icone: "❤️",
    totalPosts: 0,
    membros: 0,
  },
  {
    id: "exemplo-3",
    nome: "Saúde Mental",
    descricao: "Apoio emocional, ansiedade, tristeza e bem-estar",
    icone: "🧠",
    totalPosts: 0,
    membros: 0,
  },
];

export default function Foruns({ user }) {
  const [foruns, setForuns] = useState([]);
  const [modalAberta, setModalAberta] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "foruns"),
      where("status", "==", "aprovado"),
      orderBy("criadoEm", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setForuns(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const todosForuns = foruns.length === 0 ? FORUNS_EXEMPLO : foruns;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">💬</span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Fóruns</h1>
              <p className="text-gray-500 mt-1">Comunidades de apoio por tópico — 100% anônimas</p>
            </div>
          </div>
          <button
            onClick={() => setModalAberta(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors inline-flex items-center gap-2"
          >
            + Solicitar Novo Fórum
          </button>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-700">
          <p className="font-medium mb-1">🔒 Privacidade Garantida</p>
          <p>Todos os posts e comentários nesta seção são 100% anônimos. Ninguém sabe quem você é aqui.</p>
        </div>

        {/* Grid de Fóruns */}
        {todosForuns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4 text-lg">Nenhum fórum criado ainda.</p>
            <button
              onClick={() => setModalAberta(true)}
              className="text-brand-600 hover:underline font-medium"
            >
              Seja o primeiro a solicitar um!
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todosForuns.map((forum) => (
              <Link
                key={forum.id}
                to={forum.id !== "exemplo-1" && forum.id !== "exemplo-2" && forum.id !== "exemplo-3" ? `/forum/${forum.id}` : "#"}
                onClick={(e) => {
                  if (["exemplo-1", "exemplo-2", "exemplo-3"].includes(forum.id)) {
                    e.preventDefault();
                  }
                }}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-brand-300 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{forum.icone}</span>
                  {["exemplo-1", "exemplo-2", "exemplo-3"].includes(forum.id) && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                      Exemplo
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {forum.nome}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{forum.descricao}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-4">
                  <span className="flex items-center gap-1">
                    <span>📝</span>
                    <span>{forum.totalPosts || 0}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>👥</span>
                    <span>{forum.membros || 0}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {modalAberta && (
        <ModalSolicitarForum
          user={user}
          onClose={() => setModalAberta(false)}
          onSucesso={() => {
            setModalAberta(false);
            alert("✅ Solicitação enviada! O admin aprovará em breve.");
          }}
        />
      )}
    </div>
  );
}