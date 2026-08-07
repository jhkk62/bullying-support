// src/hooks/useRegistrarUpdate.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export function useRegistrarUpdate() {
  return async (titulo, descricao, tipo = "feature", versao = "1.0") => {
    try {
      await addDoc(collection(db, "updateLog"), {
        titulo,
        descricao,
        tipo, // "feature", "fix", "improvement"
        versao,
        data: serverTimestamp(),
      });
    } catch (err) {
      console.error("Erro ao registrar update:", err);
    }
  };
}