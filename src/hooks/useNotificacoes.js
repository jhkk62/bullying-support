// src/hooks/useNotificacoes.js
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function useNotificacoes(user) {
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    if (!user) return;

    // A busca é feita apenas com 'where' para evitar o erro de Índice do Firebase
    const q = query(
      collection(db, "notificacoes"),
      where("usuarioId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      // A ordenação é feita aqui no JavaScript
      docs.sort((a, b) => (b.criadoEm?.toMillis() || 0) - (a.criadoEm?.toMillis() || 0));
      
      setNotificacoes(docs);
    });

    return () => unsub();
  }, [user]);

  return notificacoes;
}

export function getNotificacoesNaoLidas(notificacoes) {
  return notificacoes.filter((n) => !n.lida).length;
}