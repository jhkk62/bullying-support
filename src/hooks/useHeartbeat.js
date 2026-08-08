// src/hooks/useHeartbeat.js
import { useEffect } from "react";
import { doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export function useHeartbeat(user) {
  useEffect(() => {
    if (!user) return;

    const updateHeartbeat = async () => {
      try {
        await setDoc(doc(db, "users_online", user.uid), {
          uid: user.uid,
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.error("Erro ao atualizar heartbeat:", err);
      }
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 30000); // A cada 30s

    return () => {
      clearInterval(interval);
      deleteDoc(doc(db, "users_online", user.uid)).catch(console.error);
    };
  }, [user]);
}