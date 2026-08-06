// src/pages/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, increment, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { analisarTexto } from "../utils/moderacao";

const TEMPO_ENTRE_COMENTARIOS = 4000;

export default function PostDetail({ user, banidoAte, admin }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [emEspera, setEmEspera] = useState(false);
  const [mostrarApoio, setMostrarApoio] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "posts", postId), (snap) => { if (snap.exists()) setPost({ id: snap.id, ...snap.data() }); });
    return () => unsub();
  }, [postId]);

  useEffect(() => {
    const q = query(collection(db, "posts", postId, "comentarios"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => setComentarios(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [postId]);

  async function enviarComentario(e) {
    e.preventDefault();
    if (enviando || emEspera || !novoComentario.trim() || banidoAte) return;

    const nivel = analisarTexto(novoComentario);

    if (nivel === "grave") {
      await setDoc(doc(db, "banidos", user.uid), {
        ate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        nivel, motivo: "ameaça direta detectada em comentário",
      });
      setNovoComentario("");
      return;
    }

    setEnviando(true);
    try {
      await addDoc(collection(db, "posts", postId, "comentarios"), {
        texto: novoComentario.trim(), autorId: user?.uid || "anonimo", createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "posts", postId), { totalComentarios: increment(1) });
      setNovoComentario("");
      if (nivel === "autolesao") setMostrarApoio(true);
      setEmEspera(true);
      setTimeout(() => setEmEspera(false), TEMPO_ENTRE_COMENTARIOS);
    } finally {
      setEnviando(false);
    }
  }

  async function excluirPost() {
    if (!confirm("Tem certeza que quer excluir esse post?")) return;
    await deleteDoc(doc(db, "posts", postId));
    navigate("/forum");
  }

  async function excluirComentario(id) {
    if (!confirm("Excluir esse comentário?")) return;
    await deleteDoc(doc(db, "posts", postId, "comentarios", id));
    await updateDoc(doc(db, "posts", postId), { totalComentarios: increment(-1) });
  }

  if (!post) return <p className="text-center py-10">Carregando...</p>;

  const podeExcluirPost = admin || user?.uid === post.autorId;
  const bloqueado = enviando || emEspera || !!banidoAte;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="relative bg-white rounded-2xl shadow p-6 mb-6 border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 mb-2 pr-8">{post.titulo}</h1>
        <p className="text-gray-600 whitespace-pre-line">{post.texto}</p>
        {podeExcluirPost && <button onClick={excluirPost} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 text-sm" title="Excluir post">✕</button>}
      </div>

      <h2 className="font-semibold text-gray-700 mb-3">Comentários de apoio ({comentarios.length})</h2>
      <div className="space-y-3 mb-6">
        {comentarios.map((c) => (
          <div key={c.id} className="relative bg-brand-50 rounded-lg p-4 pr-10 text-sm text-gray-700">
            {c.texto}
            {(admin || user?.uid === c.autorId) && (
              <button onClick={() => excluirComentario(c.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 text-xs" title="Excluir comentário">✕</button>
            )}
          </div>
        ))}
      </div>

      {mostrarApoio && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-4 mb-4 text-center">
          Você não está sozinho(a) — o CVV atende 24h, pelo telefone <strong>188</strong> ou em{" "}
          <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer" className="underline font-medium">cvv.org.br</a>.
        </div>
      )}

      {banidoAte ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-4 text-center">
          Você está temporariamente impedido de comentar até {banidoAte.toLocaleString("pt-BR")}.
        </div>
      ) : (
        <form onSubmit={enviarComentario} className="flex gap-2">
          <input value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)}
            placeholder={bloqueado ? "Aguarde alguns segundos..." : "Deixe uma palavra de apoio..."} disabled={bloqueado}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 disabled:bg-gray-100" />
          <button disabled={bloqueado} className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-full">Enviar</button>
        </form>
      )}
    </div>
  );
}