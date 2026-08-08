// src/hooks/useStatisticasAdmin.js
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getDocs, collectionGroup } from "firebase/firestore";
import { db } from "../firebase";

export function useStatisticasAdmin() {
  const [stats, setStats] = useState({
    pessoasOnline: 0,
    cliqueSOS: 0,
    vidasSalvas: 0,
    totalComentarios: 0,
    totalDenuncias: 0,
  });

  // Pessoas Online
  useEffect(() => {
    const q = query(collection(db, "users_online"));
    const unsub = onSnapshot(q, (snap) => {
      const agora = Date.now();
      let online = 0;
      snap.docs.forEach((doc) => {
        const timestamp = doc.data().timestamp?.toDate?.()?.getTime() || 0;
        if (agora - timestamp < 60000) { // Considera online se atualizou nos últimos 60s
          online++;
        }
      });
      setStats((prev) => ({ ...prev, pessoasOnline: online }));
    });
    return () => unsub();
  }, []);

  // Cliques SOS
  useEffect(() => {
    const q = query(collection(db, "cliques_sos"));
    const unsub = onSnapshot(q, (snap) => {
      setStats((prev) => ({ ...prev, cliqueSOS: snap.size }));
    });
    return () => unsub();
  }, []);

  // Total de Comentários (procura em todas as subcoleções de comentários)
  useEffect(() => {
    const buscarComentarios = async () => {
      try {
        const postsSnap = await getDocs(collection(db, "posts"));
        let totalComentarios = 0;
        
        for (const postDoc of postsSnap.docs) {
          const comentariosSnap = await getDocs(collection(db, "posts", postDoc.id, "comentarios"));
          totalComentarios += comentariosSnap.size;
        }
        
        // Também busca em fóruns
        const forunsSnap = await getDocs(collection(db, "foruns"));
        for (const forumDoc of forunsSnap.docs) {
          const postsForumSnap = await getDocs(collection(db, "foruns", forumDoc.id, "posts"));
          for (const postForumDoc of postsForumSnap.docs) {
            const comentariosSnap = await getDocs(collection(db, "foruns", forumDoc.id, "posts", postForumDoc.id, "comentarios"));
            totalComentarios += comentariosSnap.size;
          }
        }
        
        setStats((prev) => ({ ...prev, totalComentarios }));
      } catch (err) {
        console.error("Erro ao contar comentários:", err);
      }
    };

    buscarComentarios();
  }, []);

  // Total de Denúncias
  useEffect(() => {
    const q = query(collection(db, "denuncias"));
    const unsub = onSnapshot(q, (snap) => {
      setStats((prev) => ({ ...prev, totalDenuncias: snap.size }));
    });
    return () => unsub();
  }, []);

  // Vidas Salvas = Comentários + Denúncias Resolvidas + Cliques SOS
  useEffect(() => {
    const vidasSalvas = stats.totalComentarios + Math.floor(stats.totalDenuncias * 0.5) + stats.cliqueSOS;
    setStats((prev) => ({ ...prev, vidasSalvas }));
  }, [stats.totalComentarios, stats.totalDenuncias, stats.cliqueSOS]);

  return stats;
}