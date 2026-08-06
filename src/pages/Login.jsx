import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const TURMAS = ["6º A", "6º B", "7º A", "7º B", "8º A", "8º B", "9º A", "9º B", "1º A", "1º B", "2º ano", "3º ano"];
const TURMA_LIBERADA = "9º B";

const ALUNOS_9B = [
  "Ana Beatriz Caires Nery",
  "Anna Beatriz Amorim",
  "Anna Júlia Ramos",
  "Artur Silva Gomes",
  "Bianca Andrade Lago",
  "Bianca Nascimento",
  "Giulia Karen",
  "Izadora Araújo",
  "João Helder de Santana Souza",
  "Júlia Soares Franco",
  "Lara Aguiar Rocha",
  "Laura Stock Maia",
  "Marcelo Tourinho Araújo Pires",
  "Pedro Miranda Silva",
  "Pérola Santana Andrade",
  "Rafael de Sousa Reis",
  "Samylle Cardoso Queiroz",
  "Sofia Ribas Lima",
  "Stefani Dora Martins",
  "Thayla Meira Teixeira"
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

  // O erro estava aqui: faltava o 'async' antes da function
  async function entrar(e) {
    e.preventDefault();
    setErro("");
    if (!nomeFinal || !senha) return;

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);
    const email = gerarEmailFicticio(nomeFinal, turma);

    try {
      // 1. Tenta logar primeiro
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      await setDoc(doc(db, "alunos", cred.user.uid), { nome: nomeFinal, turma }, { merge: true });
      
    } catch (err) {
      // 2. Se falhar, tenta criar a conta
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);
        await setDoc(doc(db, "alunos", cred.user.uid), { nome: nomeFinal, turma }, { merge: true });
        
      } catch (createErr) {
        if (createErr.code === "auth/email-already-in-use") {
          setErro("Conta já existe: A senha está incorreta.");
        } else {
          setErro("Erro interno. Aperte F12 e veja a aba Console.");
          console.error("Erro no login:", err);
          console.error("Erro na criação:", createErr);
        }
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