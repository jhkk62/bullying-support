// src/components/PainelAdmin.jsx
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import SolicitacoesForuns from "./SolicitacoesForuns";

function LinhaBanido({ uid, ate, motivo, onDesbanir }) {
  const [aluno, setAluno] = useState(null);
  useEffect(() => { getDoc(doc(db, "alunos", uid)).then((snap) => { if (snap.exists()) setAluno(snap.data()); }); }, [uid]);
  return (
    <div className="flex flex-col gap-2 bg-white rounded-lg border border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">{aluno ? `${aluno.nome} (${aluno.turma})` : "Carregando..."}</p>
          <p className="text-xs text-gray-400">banido até {ate.toLocaleString("pt-BR")}</p>
        </div>
        <button onClick={() => onDesbanir(uid)} className="text-xs text-brand-600 hover:underline whitespace-nowrap">Desbanir</button>
      </div>
      {motivo && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 italic">💭 "{motivo}"</p>}
    </div>
  );
}

function ListaBanidos() {
  const [banidos, setBanidos] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "banidos"), (snap) => {
      const agora = new Date();
      setBanidos(snap.docs.map((d) => ({ uid: d.id, ate: d.data().ate?.toDate?.() ?? new Date(d.data().ate), motivo: d.data().motivo })).filter((b) => b.ate && b.ate > agora));
    });
    return () => unsub();
  }, []);
  async function desbanir(uid) { await deleteDoc(doc(db, "banidos", uid)); }
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Usuários banidos ({banidos.length})</h3>
      {banidos.length === 0 ? <p className="text-sm text-gray-400">Ninguém banido no momento.</p> : (
        <div className="space-y-3">{banidos.map((b) => <LinhaBanido key={b.uid} uid={b.uid} ate={b.ate} motivo={b.motivo} onDesbanir={desbanir} />)}</div>
      )}
    </div>
  );
}

function ListaDenuncias() {
  const [denuncias, setDenuncias] = useState([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "denuncias"), (snap) => setDenuncias(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);
  async function excluirPostDenunciado(postId, denunciaId) {
    if (!confirm("Excluir o post denunciado?")) return;
    await deleteDoc(doc(db, "posts", postId));
    await deleteDoc(doc(db, "denuncias", denunciaId));
  }
  async function descartar(denunciaId) { await deleteDoc(doc(db, "denuncias", denunciaId)); }
  return (
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Denúncias pendentes ({denuncias.length})</h3>
      {denuncias.length === 0 ? <p className="text-sm text-gray-400">Nenhuma denúncia pendente.</p> : (
        <div className="space-y-3">
          {denuncias.map((d) => (
            <div key={d.id} className="flex flex-col gap-2 bg-white rounded-lg border border-gray-100 px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 mb-1">Motivo: <strong>{d.motivo}</strong></p>
                  {d.detalhes && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic">"{d.detalhes}"</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => excluirPostDenunciado(d.postId, d.id)} className="text-xs text-red-500 hover:underline">Excluir post</button>
                <button onClick={() => descartar(d.id)} className="text-xs text-gray-400 hover:underline">Descartar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PainelAdmin({ onDesligar }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel Admin ✅</h1>
          <p className="text-gray-500 text-sm">Gerencie a plataforma</p>
        </div>
        <button onClick={onDesligar} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow whitespace-nowrap">
          ⚠️ Tirar site do ar
        </button>
      </div>
      <div className="space-y-10">
        <SolicitacoesForuns />
        <ListaDenuncias />
        <ListaBanidos />
      </div>
    </div>
  );
}