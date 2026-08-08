// src/pages/Chat.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Chat({ user }) {
  const { amigoId } = useParams();
  const navigate = useNavigate();
  const [amigoData, setAmigoData] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [userPerfilData, setUserPerfilData] = useState(null);

  const chatId = [user?.uid, amigoId].sort().join("_");

  // Carregar dados do amigo
  useEffect(() => {
    getDoc(doc(db, "alunos", amigoId || "")).then((snap) => {
      if (snap.exists()) setAmigoData(snap.data());
      else navigate("/amigos");
    });
  }, [amigoId, navigate]);

  // Carregar dados do usuário
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "alunos", user.uid)).then((snap) => {
      if (snap.exists()) setUserPerfilData(snap.data());
    });
  }, [user]);

  // Carregar mensagens
  useEffect(() => {
    const q = query(
      collection(db, "chats", chatId, "mensagens"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMensagens(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [chatId]);

  async function enviarMensagem(e) {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    setEnviando(true);
    try {
      await addDoc(collection(db, "chats", chatId, "mensagens"), {
        de: user.uid,
        texto: novaMensagem.trim(),
        timestamp: serverTimestamp(),
      });
      setNovaMensagem("");
    } finally {
      setEnviando(false);
    }
  }

  if (!amigoData || !userPerfilData) return <p className="text-center py-10 text-gray-400 dark:text-gray-500">Carregando...</p>;

  const inicialAmigo = amigoData.nome?.[0]?.toUpperCase() || "?";
  const inicialUser = userPerfilData.nome?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 p-4">
        <button
          onClick={() => navigate("/amigos")}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 flex items-center gap-2"
        >
          ← Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-600 dark:bg-brand-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            {amigoData.fotoUrl ? (
              <img src={amigoData.fotoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              inicialAmigo
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{amigoData.apelido || amigoData.nome}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{amigoData.turma}</p>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <p>Comece a conversa 👋</p>
          </div>
        ) : (
          mensagens.map((msg) => {
            const eVoce = msg.de === user.uid;
            return (
              <div
                key={msg.id}
                className={`flex ${eVoce ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-end gap-2 max-w-xs ${
                    eVoce ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                      eVoce
                        ? "bg-brand-600 dark:bg-brand-700"
                        : "bg-gray-600 dark:bg-gray-700"
                    }`}
                  >
                    {eVoce
                      ? inicialUser
                      : inicialAmigo}
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      eVoce
                        ? "bg-brand-600 dark:bg-brand-700 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-sm">{msg.texto}</p>
                    <p
                      className={`text-xs mt-1 ${
                        eVoce
                          ? "text-brand-100 dark:text-brand-200"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {msg.timestamp?.toDate?.()?.toLocaleTimeString("pt-BR") || "enviando..."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 sticky bottom-0">
        <form onSubmit={enviarMensagem} className="flex gap-3">
          <input
            type="text"
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="flex-1 border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={enviando || !novaMensagem.trim()}
            className="bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 disabled:opacity-50 text-white px-6 py-3 rounded-full font-medium transition-colors"
          >
            📤
          </button>
        </form>
      </div>
    </div>
  );
}