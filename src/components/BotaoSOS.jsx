// src/components/BotaoSOS.jsx
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function BotaoSOS({ user }) {
  async function handleSOS() {
    try {
      await addDoc(collection(db, "cliques_sos"), {
        usuarioId: user?.uid || "anonimo",
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Erro ao registrar SOS:", err);
    }

    window.open("https://www.cvv.org.br", "_blank");
  }

  return (
    <button
      onClick={handleSOS}
      className="fixed bottom-8 right-8 z-40 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-full shadow-lg p-4 transition-all hover:scale-110 active:scale-95 group"
      title="Botão SOS - Clique para falar com alguém"
    >
      <span className="text-2xl">🆘</span>
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
      <div className="absolute bottom-full right-0 mb-3 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        CVV 188 - Estou aqui
      </div>
    </button>
  );
}