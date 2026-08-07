// src/hooks/useNotificaLogin.js
import { useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export function useNotificaLogin(user) {
  useEffect(() => {
    if (!user) return;

    const teleporte = localStorage.getItem(`login-notificado-${user.uid}`);
    const agora = new Date().getTime();

    if (!teleporte || agora - parseInt(teleporte) > 3600000) { // só notifica a cada 1 hora
      addDoc(collection(db, "notificacoes"), {
        usuarioId: user.uid,
        titulo: "Você entrou na sua conta",
        descricao: `Login realizado em ${new Date().toLocaleTimeString("pt-BR")}`,
        tipo: "login",
        criadoEm: serverTimestamp(),
      }).then(() => {
        localStorage.setItem(`login-notificado-${user.uid}`, agora.toString());
      });
    }
  }, [user]);
}