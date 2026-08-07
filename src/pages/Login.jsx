// src/pages/Login.jsx
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
  const [etapa, setEtapa] = useState("turma");
  const [turma, setTurma] = useState("");
  const [nome, setNome] = useState("");
  const [nomeDigitado, setNomeDigitado] = useState("");
  const [naoEstaNaLista, setNaoEstaNaLista] = useState(false);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const nomeFinal = naoEstaNaLista ? nomeDigitado.trim() : nome;

  function avancarParaNome() {
    if (!turma) return;
    if (turma !== TURMA_LIBERADA) {
      setErro("Essa turma ainda não está liberada.");
      return;
    }
    setEtapa("nome");
  }

  function avancarParaSenha() {
    if (!nome && !nomeDigitado) return;
    setEtapa("senha");
  }

  async function entrar(e) {
    e.preventDefault();
    setErro("");
    if (!nomeFinal || !senha) return;
    setCarregando(true);
    const email = gerarEmailFicticio(nomeFinal, turma);

    try {
      let cred;

      if (naoEstaNaLista) {
        cred = await createUserWithEmailAndPassword(auth, email, senha);
      } else {
        try {
          // Tenta fazer o login primeiro
          cred = await signInWithEmailAndPassword(auth, email, senha);
        } catch (authErr) {
          // Se a conta não existir, vamos criá-la automaticamente
          if (authErr.code === "auth/user-not-found" || authErr.code === "auth/invalid-credential") {
            try {
              cred = await createUserWithEmailAndPassword(auth, email, senha);
            } catch (createErr) {
              if (createErr.code === "auth/email-already-in-use") {
                throw authErr; // Conta já existe, repassa o erro de senha incorreta
              }
              throw createErr;
            }
          } else {
            throw authErr;
          }
        }
      }

      await setDoc(doc(db, "alunos", cred.user.uid), { nome: nomeFinal, turma }, { merge: true });
    } catch (err) {
      if (["auth/user-not-found", "auth/wrong-password", "auth/invalid-credential"].includes(err.code)) {
        setErro("Nome ou senha incorretos.");
      } else if (err.code === "auth/email-already-in-use") {
        setErro("Já existe conta com esse nome.");
        setEtapa("nome");
      } else if (err.code === "auth/weak-password") {
        setErro("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setErro("Erro ao entrar. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🤝</div>
          <h1 className="text-3xl font-bold text-white mb-2">Apoia+</h1>
          <p className="text-brand-50/80 text-sm">Um espaço seguro pra você se sentir acolhido(a)</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {etapa === "turma" && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">Qual é sua turma?</label>
              <select
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option value="">Selecione...</option>
                {TURMAS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
              <button
                onClick={avancarParaNome}
                disabled={!turma || carregando}
                className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {etapa === "nome" && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                {naoEstaNaLista ? "Digite seu nome" : "Quem é você?"}
              </label>
              {!naoEstaNaLista ? (
                <select
                  value={nome}
                  onChange={(e) => {
                    if (e.target.value === "__outro__") {
                      setNaoEstaNaLista(true);
                      setNome("");
                    } else {
                      setNaoEstaNaLista(false); // Garante que o estado retorne caso ele troque novamente
                      setNome(e.target.value);
                    }
                  }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-brand-500"
                >
                  <option value="">Selecione...</option>
                  {ALUNOS_9B.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                  <option value="__outro__">Não estou na lista</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={nomeDigitado}
                  onChange={(e) => setNomeDigitado(e.target.value)}
                  placeholder="Digite aqui"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-brand-500"
                />
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setEtapa("turma")}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  onClick={avancarParaSenha}
                  disabled={!nomeFinal || carregando}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {etapa === "senha" && (
            <form onSubmit={entrar}>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Sua senha</label>
              <p className="text-xs text-gray-500 mb-3">
                {naoEstaNaLista ? "Crie uma senha segura (recomendamos sua data de nascimento + números extras)" : "Sua data de nascimento (no padrão DDMM_YYYY)"}
              </p>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-brand-500"
              />
              {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEtapa("nome")}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl"
                >
                  {carregando ? "Entrando..." : "Entrar / Criar Conta"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-8 text-white/70 text-xs">
          <p>Ao usar este site, você concorda com os <a href="/termos" className="underline hover:text-white">termos de uso</a>.</p>
        </div>
      </div>
    </div>
  );
}