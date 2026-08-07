// src/pages/VoiceChat.jsx
import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

// 👉 Troque pelo seu App ID (Agora Console → Project Management)
const AGORA_APP_ID = "5968eac4322e4fcdb81f60cc77453931";
const NOME_DA_SALA = "Chat-de-voz-global-e-anonimo";

export default function VoiceChat({ user }) {
  const [conectado, setConectado] = useState(false);
  const [conectando, setConectando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [participantes, setParticipantes] = useState([]);

  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  useEffect(() => {
    // se a pessoa sair da página sem clicar "Sair", desconecta mesmo assim
    return () => { sairDaSala(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function entrarNaSala() {
    setConectando(true);
    try {
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      client.on("user-published", async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === "audio") remoteUser.audioTrack.play();
        atualizarParticipantes(client);
      });
      client.on("user-left", () => atualizarParticipantes(client));
      client.on("user-joined", () => atualizarParticipantes(client));

      // null = sem servidor de token (funciona no modo "Testing" do Agora)
      await client.join(AGORA_APP_ID, NOME_DA_SALA, null, user?.uid || null);

      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = localAudioTrack;
      await client.publish([localAudioTrack]);

      atualizarParticipantes(client);
      setConectado(true);
    } catch (err) {
      console.error("Erro ao entrar na sala de voz:", err);
      alert("Não foi possível entrar. Verifique seu App ID e a permissão do microfone.");
    } finally {
      setConectando(false);
    }
  }

  function atualizarParticipantes(client) {
    setParticipantes(client.remoteUsers.map((u) => u.uid));
  }

  async function sairDaSala() {
    localAudioTrackRef.current?.close();
    await clientRef.current?.leave();
    clientRef.current = null;
    localAudioTrackRef.current = null;
    setConectado(false);
    setParticipantes([]);
  }

  function alternarMudo() {
    if (!localAudioTrackRef.current) return;
    const novoEstado = !mudo;
    localAudioTrackRef.current.setEnabled(!novoEstado);
    setMudo(novoEstado);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-3">🎙️ Chat de Voz</h1>
      <p className="text-gray-500 mb-8">Uma sala de voz global e anônima.</p>

      {!conectado ? (
        <button
          onClick={entrarNaSala}
          disabled={conectando}
          className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors"
        >
          {conectando ? "Conectando..." : "Entrar na Sala"}
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <p className="text-sm text-gray-500 mb-4">
            🟢 Conectado • {participantes.length + 1} pessoa(s) na sala
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={alternarMudo}
              className={`px-5 py-2 rounded-full font-medium transition-colors ${mudo ? "bg-gray-200 text-gray-600" : "bg-brand-50 text-brand-700"}`}
            >
              {mudo ? "🔇 Mudo" : "🎤 Falando"}
            </button>
            <button onClick={sairDaSala} className="px-5 py-2 rounded-full font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
              Sair da Sala
            </button>
          </div>
        </div>
      )}
    </div>
  );
}