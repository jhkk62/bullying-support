// src/pages/ForumDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, increment, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { analisarTexto } from "../utils/moderacao";

const TEMPO_ENTRE_POSTS = 4000;

export default function ForumDetail({ user, banidoAte, admin }) {
  const { forumId } = useParams();
  const navigate = useNavigate();
  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [emEspera, setEmEspera] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "foruns", forumId), (snap) => {
      if (snap.exists()) setForum({ id: snap.id, ...snap.data() });
      else navigate("/forum");
    });
    return () => unsub();
  }, [forumId, navigate]);

  useEffect(() => {
    const q = query(
      collection(db, "foruns", forumId, "posts"),
      orderBy("criadoEm", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [forumId]);

  async function criarPost(e) {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim() || banidoAte || emEspera) return;

    const nivel = analisarTexto(`${titulo} ${texto}`, "post");
    if (nivel === "grave") {
      alert("Esse conteúdo viola as regras.");
      return;
    }

    setEnviando(true);
    try {
      await addDoc(collection(db, "foruns", forumId, "posts"), {
        titulo: titulo.trim(),
        texto: texto.trim(),
        autorId: user.uid,
        criadoEm: serverTimestamp(),
        totalComentarios: 0,
      });
      setTitulo("");
      setTexto("");
      setEmEspera(true);
      setTimeout(() => setEmEspera(false), TEMPO_ENTRE_POSTS);

      await updateDoc(doc(db, "foruns", forumId), {
        totalPosts: increment(1),
      });
    } finally {
      setEnviando(false);
    }
  }

  async function excluirPost(postId) {
    if (!confirm("Excluir este post?")) return;
    await deleteDoc(doc(db, "foruns", forumId, "posts", postId));
    await updateDoc(doc(db, "foruns", forumId), {
      totalPosts: increment(-1),
    });
  }

  if (!forum) return <p className="text-center py-20 text-gray-400">Carregando fórum...</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{forum.icone}</span>
          <div>
            <h1 className="text-3xl font-bold">{forum.nome}</h1>
            <p className="text-brand-50/80">{forum.descricao}</p>
          </div>
        </div>
        <div className="flex gap-6 text-sm pt-4 border-t border-white/20">
          <span>📝 {forum.totalPosts || 0} posts</span>
          <span>👥 {forum.membros || 0} membros</span>
        </div>
      </div>

      {banidoAte ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-4 mb-8 text-center">
          Você está temporariamente impedido de postar até {banidoAte.toLocaleString("pt-BR")}.
        </div>
      ) : (
        <form onSubmit={criarPost} className="bg-white rounded-2xl shadow p-6 mb-8 border border-gray-100">
          <input
            type="text"
            placeholder="Título do seu post"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={100}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <textarea
            placeholder="Conte mais..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={enviando || emEspera}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-full transition-colors"
          >
            {enviando ? "Postando..." : emEspera ? "Aguarde..." : "Postar"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            Nenhum post neste fórum ainda. Seja o primeiro!
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{post.titulo}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{post.texto}</p>
                  <div className="text-xs text-gray-400 mt-3">💬 {post.totalComentarios || 0} resposta(s)</div>
                </div>
                {(admin || user.uid === post.autorId) && (
                  <button
                    onClick={() => excluirPost(post.id)}
                    className="text-gray-300 hover:text-red-500 text-sm"
                    title="Excluir"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}