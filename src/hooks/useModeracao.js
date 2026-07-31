// src/hooks/useModeracao.js
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function useStatusModeracao(user) {
  const [banidoAte, setBanidoAte] = useState(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubBan = onSnapshot(doc(db, "banidos", user.uid), (snap) => {
      if (snap.exists()) {
        const ate = snap.data().ate?.toDate?.() ?? new Date(snap.data().ate);
        setBanidoAte(ate > new Date() ? ate : null);
      } else {
        setBanidoAte(null);
      }
    });

    const unsubAdmin = onSnapshot(doc(db, "admins", user.uid), (snap) => {
      setAdmin(snap.exists());
    });

    return () => { unsubBan(); unsubAdmin(); };
  }, [user]);

  return { banidoAte, admin };
}