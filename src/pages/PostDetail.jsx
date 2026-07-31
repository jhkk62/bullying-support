// src/pages/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";

const TEMPO_ENTRE_COMENTARIOS = 4000; // 4 segundos de espera entre comentários

export default function PostDetail({ user }) {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [emEspera, setEmEspera] = useState(false); // trava anti-spam

  useEffect(() => {
    const ref = doc(db, "posts", postId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setPost({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [postId]);

  useEffect(() => {
    const q = query(collection(db, "posts", postId, "comentarios"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setComentarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [postId]);

  async function enviarComentario(e) {
    e.preventDefault();
    // se já está enviando, ou ainda em espera, ou o campo está vazio -> ignora
    if (enviando || emEspera || !novoComentario.trim()) return;

    setEnviando(true);
    try {
      await addDoc(collection(db, "posts", postId, "comentarios"), {
        texto: novoComentario.trim(),
        autorId: user?.uid || "anonimo",
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "posts", postId), { totalComentarios: increment(1) });
      setNovoComentario("");

      // ativa a trava por alguns segundos, evitando spam
      setEmEspera(true);
      setTimeout(() => setEmEspera(false), TEMPO_ENTRE_COMENTARIOS);
    } catch (err) {
      console.error("Erro ao comentar:", err);
    } finally {
      setEnviando(false);
    }
  }

  if (!post) return <p className="text-center py-10">Carregando...</p>;

  const bloqueado = enviando || emEspera;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 mb-2">{post.titulo}</h1>
        <p className="text-gray-600 whitespace-pre-line">{post.texto}</p>
      </div>

      <h2 className="font-semibold text-gray-700 mb-3">Comentários de apoio ({comentarios.length})</h2>

      <div className="space-y-3 mb-6">
        {comentarios.map((c) => (
          <div key={c.id} className="bg-brand-50 rounded-lg p-4 text-sm text-gray-700">{c.texto}</div>
        ))}
      </div>

      <form onSubmit={enviarComentario} className="flex gap-2">
        <input
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          placeholder={bloqueado ? "Aguarde alguns segundos..." : "Deixe uma palavra de apoio..."}
          disabled={bloqueado}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-100"
        />
        <button
          disabled={bloqueado}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-5 py-2 rounded-full"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}