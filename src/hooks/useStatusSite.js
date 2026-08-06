// src/hooks/useStatusSite.js
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function useStatusSite() {
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "site"), (snap) => {
      setAtivo(snap.exists() ? snap.data().ativo !== false : true);
    });
    return () => unsub();
  }, []);

  return { ativo };
}