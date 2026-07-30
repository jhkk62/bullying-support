import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Forum({ user }) {
  const [posts, setPosts] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(lista);
    });
    return () => unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim()) return;
    setEnviando(true);
    try {
      await addDoc(collection(db, "posts"), {
        titulo: titulo.trim(),
        texto: texto.trim(),
        autorId: user?.uid || "anonimo",
        createdAt: serverTimestamp(),
        totalComentarios: 0,
      });
      setTitulo("");
      setTexto("");
    } catch (err) {
      console.error("Erro ao publicar:", err);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Fórum de Apoio</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 mb-10 border border-gray-100">
        <input
          type="text"
          placeholder="Título do seu relato"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          maxLength={100}
        />
        <textarea
          placeholder="Conte o que está acontecendo... este é um espaço seguro."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={enviando}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-full transition-colors"
        >
          {enviando ? "Publicando..." : "Publicar Relato"}
        </button>
      </form>

      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="text-gray-400 text-center">Ainda não há relatos. Seja o primeiro a compartilhar.</p>
        )}
        {posts.map((post) => (
          <Link
            to={`/forum/${post.id}`}
            key={post.id}
            className="block bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-5 transition-shadow"
          >
            <h3 className="font-semibold text-gray-800 mb-1">{post.titulo}</h3>
            <p className="text-gray-500 text-sm line-clamp-2">{post.texto}</p>
            <div className="text-xs text-gray-400 mt-3">💬 {post.totalComentarios || 0} comentário(s)</div>
          </Link>
        ))}
      </div>
    </div>
  );
}