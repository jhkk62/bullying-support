// src/pages/PostDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, increment, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { analisarTexto } from "../utils/moderacao";
import { criarNotificacao } from "../utils/notificacoes";

const TEMPO_ENTRE_COMENTARIOS = 4000;

function ComentarioItem({ c, user, admin, excluirComentario }) {
  const [alunoComentario, setAlunoComentario] = useState(null);

  useEffect(() => {
    // PROTEÇÃO CONTRA TELA BRANCA: Só busca se os IDs existirem e baterem perfeitamente
    if (c?.autorId && user?.uid && c.autorId === user.uid) {
      getDoc(doc(db, "alunos", user.uid))
        .then((snap) => {
          if (snap.exists()) setAlunoComentario(snap.data());
        })
        .catch((err) => console.error("Erro ao buscar autor do comentário:", err));
    }
  }, [c?.autorId, user?.uid]);

  const mostrarPerfil = c?.autorId === user?.uid;

  return (
    <div className="relative bg-brand-50 dark:bg-gray-800 rounded-lg p-4 pr-10 text-sm text-gray-700 dark:text-gray-200 border border-transparent dark:border-gray-700">
      {mostrarPerfil && alunoComentario && (
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-brand-200 dark:border-gray-700">
          <div className="w-6 h-6 rounded-full bg-brand-600 dark:bg-brand-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
            {alunoComentario.fotoUrl ? (
              <img src={alunoComentario.fotoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              alunoComentario.apelido?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">{alunoComentario.apelido || "Você"}</p>
            <p className="text-xs text-brand-600 dark:text-gray-400">Seu comentário</p>
          </div>
        </div>
      )}
      <p>{c.texto}</p>
      {(admin || user?.uid === c.autorId) && (
        <button
          onClick={() => excluirComentario(c.id)}
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-xs transition-colors"
          title="Excluir comentário"
        >
          ✕
        </button>
      )}
    </div>
  );
}

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

    try {
      const nivel = analisarTexto(novoComentario, "comentario");

      if (nivel === "grave" || nivel === "moderado") {
        const duracaoMs = nivel === "grave" ? 24 * 60 * 60 * 1000 : 2 * 60 * 1000;
        await setDoc(doc(db, "banidos", user.uid), {
          ate: new Date(Date.now() + duracaoMs),
          nivel,
          motivo: `Linguagem ofensiva em comentário: "${novoComentario.substring(0, 50)}..."`,
        });
        setNovoComentario("");
        alert("Seu comentário viola as regras. Você foi temporariamente suspenso.");
        return;
      }

      setEnviando(true);
      await addDoc(collection(db, "posts", postId, "comentarios"), {
        texto: novoComentario.trim(),
        autorId: user?.uid || "anonimo",
        createdAt: serverTimestamp(),
      });
      
      // Notificar o dono do post
      if (post.autorId && post.autorId !== user?.uid) {
        await criarNotificacao(post.autorId, postId, "comentario", `Novo comentário em "${post.titulo}"`);
      }
      
      await updateDoc(doc(db, "posts", postId), { totalComentarios: increment(1) });
      setNovoComentario("");
      if (nivel === "autolesao") setMostrarApoio(true);
      
      setEmEspera(true);
      setTimeout(() => setEmEspera(false), TEMPO_ENTRE_COMENTARIOS);
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      alert("Houve um erro ao tentar enviar o comentário. Tente novamente.");
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

  if (!post) return <p className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando...</p>;

  const podeExcluirPost = admin || user?.uid === post.autorId;
  const bloqueado = enviando || emEspera || !!banidoAte;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 border border-gray-100 dark:border-gray-700 transition-colors">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2 pr-8">{post.titulo}</h1>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{post.texto}</p>
        {podeExcluirPost && (
          <button onClick={excluirPost} className="absolute top-6 right-6 text-gray-300 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm transition-colors" title="Excluir post">
            ✕
          </button>
        )}
      </div>

      <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Comentários de apoio ({comentarios.length})</h2>
      
      <div className="space-y-3 mb-6">
        {comentarios.map((c) => (
          <ComentarioItem 
            key={c.id} 
            c={c} 
            user={user} 
            admin={admin} 
            excluirComentario={excluirComentario} 
          />
        ))}
      </div>

      {mostrarApoio && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm rounded-lg p-4 mb-4 text-center">
          Você não está sozinho(a) — o CVV atende 24h, pelo <strong>188</strong> ou em{" "}
          <a href="https://www.cvv.org.br" target="_blank" rel="noopener noreferrer" className="underline font-medium">cvv.org.br</a>.
        </div>
      )}

      {banidoAte ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg p-4 text-center">
          Você está temporariamente impedido de comentar até {banidoAte.toLocaleString("pt-BR")}.
        </div>
      ) : (
        <form onSubmit={enviarComentario} className="flex gap-2">
          <input 
            value={novoComentario} 
            onChange={(e) => setNovoComentario(e.target.value)}
            placeholder={bloqueado ? "Aguarde alguns segundos..." : "Deixe uma palavra de apoio..."} 
            disabled={bloqueado}
            className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white dark:placeholder-gray-400 rounded-full px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-gray-100 dark:disabled:bg-gray-900 transition-colors" 
          />
          <button 
            disabled={bloqueado} 
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-full transition-colors"
          >
            Enviar
          </button>
        </form>
      )}
    </div>
  );
}