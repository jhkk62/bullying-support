// src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const TURMAS = ["6º A", "6º B", "7º A", "7º B", "8º A", "8º B", "9º A", "9º B", "1º A", "1º B", "2º ano", "3º ano"];
const TURMA_LIBERADA = "9º B";

// 👉 Troque pelos nomes reais da sua turma (só os nomes — sem data de nascimento aqui)
const ALUNOS_9B = [
  "João Helder de Santana Souza",
  "Marcelo Tourinho Araújo Pires",
  "Pedro Miranda Silva",
  "Lara Aguiar Rocha",
  "Júlia Soares Franco",
  "Rafael de Sousa Reis",
  "Anna Beatriz Amorim",
  "Samylle Cardoso Queiroz",
  "Ana Beatriz Caires Nery",
  "Artur Silva Gomes",
  "Thayla Meira Teixeira",
  "Sofia Ribas Lima",
  "Pérola Santana Andrade",
  "Laura Stock Maia",
  "Bianca Andrade Lago",
  "Stefani Dora Martins",
  "Izadora Araújo",
  "Anna Júlia Ramos",
  "Bianca Nascimento",
  "Giulia Karen"
];

function gerarEmailFicticio(nomeCompleto, turma) {
  const slug = nomeCompleto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const turmaSlug = turma.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${slug}.${turmaSlug}@apoiamais.local`;
}

export default function Login() {
  const [turma, setTurma] = useState("");
  const [nome, setNome] = useState("");
  const [naoEstaNaLista, setNaoEstaNaLista] = useState(false);
  const [nomeDigitado, setNomeDigitado] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const nomeFinal = naoEstaNaLista ? nomeDigitado.trim() : nome;

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    if (!nomeFinal || !senha) return;
    setCarregando(true);
    const email = gerarEmailFicticio(nomeFinal, turma);

    try {
      const cred = naoEstaNaLista
        ? await createUserWithEmailAndPassword(auth, email, senha)
        : await signInWithEmailAndPassword(auth, email, senha);

      await setDoc(doc(db, "alunos", cred.user.uid), { nome: nomeFinal, turma }, { merge: true });
    } catch (err) {
      if (["auth/user-not-found", "auth/wrong-password", "auth/invalid-credential"].includes(err.code)) {
        setErro("Nome ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setErro("Já existe conta com esse nome. Tenta entrar em vez de criar conta.");
      } else {
        setErro("Não foi possível entrar. Tente novamente.");
        console.error(err);
      }
    } finally {
      setCarregando(false);
    }
  }

  if (turma && turma !== TURMA_LIBERADA) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <p className="text-gray-500 mb-4">Essa turma ainda não está liberada para usar o Apoia+.</p>
        <button onClick={() => setTurma("")} className="text-brand-600 underline">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">🤝 Apoia+</h1>
      <p className="text-gray-500 text-sm text-center mb-8">Acesso restrito aos alunos do colégio.</p>
      <form onSubmit={entrar} className="bg-white rounded-2xl shadow p-6 border border-gray-100 space-y-3">
        <select value={turma} onChange={(e) => setTurma(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2">
          <option value="">Selecione sua turma</option>
          {TURMAS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {turma === TURMA_LIBERADA && (
          <>
            {!naoEstaNaLista ? (
              <select
                value={nome}
                onChange={(e) => e.target.value === "__outro__" ? setNaoEstaNaLista(true) : setNome(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2"
              >
                <option value="">Selecione seu nome</option>
                {ALUNOS_9B.map((n) => <option key={n} value={n}>{n}</option>)}
                <option value="__outro__">Não estou na lista</option>
              </select>
            ) : (
              <input type="text" value={nomeDigitado} onChange={(e) => setNomeDigitado(e.target.value)} placeholder="Digite seu nome completo"
                className="w-full border border-gray-200 rounded-lg px-4 py-2" />
            )}

            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder={naoEstaNaLista ? "Crie uma senha (ex: sua data de nascimento)" : "Sua senha"}
              className="w-full border border-gray-200 rounded-lg px-4 py-2" />

            {erro && <p className="text-red-500 text-sm">{erro}</p>}

            <button disabled={carregando} className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2 rounded-full">
              {carregando ? "Entrando..." : naoEstaNaLista ? "Criar Conta" : "Entrar"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}