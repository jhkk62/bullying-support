// src/utils/notificacoes.js
import { addDoc, collection, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export async function criarNotificacao(usuarioId, postId, tipo = "comentario", descricao = "") {
  try {
    await addDoc(collection(db, "notificacoes"), {
      usuarioId,
      postId,
      tipo, // "comentario", "resposta", "sys"
      descricao,
      lida: false,
      criadoEm: serverTimestamp(),
    });
  } catch (err) {
    console.error("Erro ao criar notificação:", err);
  }
}

export function usarNotificacoes(user) {
  return new Promise((resolve) => {
    if (!user) {
      resolve([]);
      return;
    }

    const q = query(
      collection(db, "notificacoes"),
      where("usuarioId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      resolve(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  });
}