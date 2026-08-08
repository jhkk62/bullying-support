// src/pages/Amigos.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ModalAdicionarAmigo from "../components/ModalAdicionarAmigo";

export default function Amigos({ user }) {
  const [amigos, setAmigos] = useState([]);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [modalAberta, setModalAberta] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "amizades"),
      where("usuarioId", "==", user.uid),
      orderBy("criadoEm", "desc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const amigosData = await Promise.all(
        snap.docs.map(async (d) => {
          const amigoSnap = await getDoc(doc(db, "alunos", d.data().amigoId));
          return {
            id: d.id,
            amigoId: d.data().amigoId,
            amigoData: amigoSnap.exists() ? amigoSnap.data() : {},
          };
        })
      );
      setAmigos(amigosData);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "alunos"), (snap) => {
      const lista = snap.docs
        .filter((d) => d.id !== user.uid)
        .map((d) => ({ id: d.id, ...d.data() }));
      setAlunosDisponiveis(lista);
    });
    return () => unsub();
  }, [user]);

  async function removerAmigo(amigoId) {
    if (!confirm("Remover este amigo?")) return;
    const q = query(
      collection(db, "amizades"),
      where("usuarioId", "==", user.uid),
      where("amigoId", "==", amigoId)
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => deleteDoc(d.ref));
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 transition-colors">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* HUD Espaçado e Responsivo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">👥 Amigos</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Adicione amigos e comece a conversar</p>
          </div>
          <button
            onClick={() => setModalAberta(true)}
            className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
          >
            + Adicionar Amigo
          </button>
        </div>

        {amigos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-16 text-center shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">Você ainda não tem amigos adicionados.</p>
            <button
              onClick={() => setModalAberta(true)}
              className="text-brand-600 dark:text-brand-400 hover:underline font-bold text-lg"
            >
              Adicione seu primeiro amigo!
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {amigos.map((amigo) => (
              <div
                key={amigo.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-brand-600 dark:bg-brand-700 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                    {amigo.amigoData.fotoUrl ? (
                      <img src={amigo.amigoData.fotoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      amigo.amigoData.nome?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-gray-900 dark:text-white truncate">
                      {amigo.amigoData.apelido || amigo.amigoData.nome}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{amigo.amigoData.turma}</p>
                  </div>
                </div>
                {amigo.amigoData.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-5 pb-5 border-b border-gray-100 dark:border-gray-700">
                    "{amigo.amigoData.bio}"
                  </p>
                )}
                <div className="flex gap-3">
                  <Link
                    to={`/chat/${amigo.amigoId}`}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl text-center transition-colors shadow-sm"
                  >
                    💬 Conversar
                  </Link>
                  <button
                    onClick={() => removerAmigo(amigo.amigoId)}
                    className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAberta && (
        <ModalAdicionarAmigo
          user={user}
          alunosDisponiveis={alunosDisponiveis.filter((a) => !amigos.some((am) => am.amigoId === a.id))}
          onClose={() => setModalAberta(false)}
          onSucesso={() => {
            setModalAberta(false);
            alert("✅ Pedido de amizade enviado para notificação!");
          }}
        />
      )}
    </div>
  );
}