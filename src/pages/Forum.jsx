// src/pages/Forum.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { analisarTexto } from "../utils/moderacao";
import ModalDenuncia from "../components/ModalDenuncia";

export default function Forum({ user, banidoAte, admin }) {
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarApoio, setMostrarApoio] = useState(false);
  const [modalDenuncia, setModalDenuncia] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim() || banidoAte) return;

    setEnviando(true);
    try {
      const nivel = analisarTexto(`${titulo} ${texto}`, "post");

      if (nivel === "grave") {
        alert("Esse conteúdo viola as regras da plataforma.");
        setEnviando(false);
        return;
      }

      await addDoc(collection(db, "posts"), {
        titulo: titulo.trim(),
        texto: texto.trim(),
        autorId: user?.uid || "anonimo",
        createdAt: serverTimestamp(),
        totalComentarios: 0,
        sinalizado: nivel === "sinalizado",
      });
      setTitulo("");
      setTexto("");
      if (nivel === "autolesao") setMostrarApoio(true);
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Erro ao publicar: " + error.message);
    } finally {
      setEnviando(false);
    }
  }

  async function excluirPost(e, postId) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Tem certeza que quer excluir esse post?")) return;
    await deleteDoc(doc(db, "posts", postId));
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Fórum de Apoio</h1>

      {mostrarApoio && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-4 mb-6 text-center">
          Você não está sozinho(a) — o CVV oferece apoio 24h, pelo <strong>188</strong> ou em{" "}
          <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer" className="underline font-medium">cvv.org.br</a>.
        </div>
      )}

      {banidoAte ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-4 mb-10 text-center">
          Você está temporariamente impedido de publicar até {banidoAte.toLocaleString("pt-BR")}.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 mb-10 border border-gray-100">
          <input type="text" placeholder="Título do seu relato" value={titulo} onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500" maxLength={100} />
          <textarea placeholder="Conte o que está acontecendo..." value={texto} onChange={(e) => setTexto(e.target.value)} rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <button type="submit" disabled={enviando} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-full">
            {enviando ? "Publicando..." : "Publicar Relato"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {posts.length === 0 && <p className="text-gray-400 text-center">Ainda não há relatos.</p>}
        {posts.map((post) => (
          <div key={post.id}>
            <Link to={`/forum/${post.id}`} className="relative block bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-1 pr-16">{post.titulo}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{post.texto}</p>
              <div className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                <span>💬 {post.totalComentarios || 0} comentário(s)</span>
                {admin && post.sinalizado && <span className="text-amber-500 font-medium">⚠️ sinalizado</span>}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {user?.uid !== post.autorId && (
                  <button onClick={(e) => { e.preventDefault(); setModalDenuncia(post.id); }} className="text-gray-300 hover:text-orange-500 text-sm" title="Denunciar post">🚩</button>
                )}
                {(admin || user?.uid === post.autorId) && (
                  <button onClick={(e) => excluirPost(e, post.id)} className="text-gray-300 hover:text-red-500 text-sm" title="Excluir post">✕</button>
                )}
              </div>
            </Link>
            {modalDenuncia === post.id && (
              <ModalDenuncia
                postId={post.id}
                onClose={() => setModalDenuncia(null)}
                onSucesso={() => { setModalDenuncia(null); alert("Denúncia enviada com sucesso."); }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}