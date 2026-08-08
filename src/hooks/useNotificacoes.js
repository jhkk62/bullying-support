// src/hooks/useNotificacoes.js
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export function useNotificacoes(user) {
  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notificacoes"),
      where("usuarioId", "==", user.uid),
      orderBy("criadoEm", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotificacoes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  return notificacoes;
}

export function getNotificacoesNaoLidas(notificacoes) {
  return notificacoes.filter((n) => !n.lida).length;
}