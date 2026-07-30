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

export default function PostDetail({ user }) {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");

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
    if (!novoComentario.trim()) return;
    await addDoc(collection(db, "posts", postId, "comentarios"), {
      texto: novoComentario.trim(),
      autorId: user?.uid || "anonimo",
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "posts", postId), { totalComentarios: increment(1) });
    setNovoComentario("");
  }

  if (!post) return <p className="text-center py-10">Carregando...</p>;

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
          placeholder="Deixe uma palavra de apoio..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-full">Enviar</button>
      </form>
    </div>
  );
}