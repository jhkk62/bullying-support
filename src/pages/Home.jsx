// src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Você não está sozinho(a).
          </h1>
          <p className="text-lg md:text-xl text-brand-50/90 mb-10 max-w-2xl mx-auto animate-fade-in-up [animation-delay:150ms]">
            O Apoia+ é um espaço seguro e anônimo para desabafar, pedir ajuda
            e encontrar pessoas que entendem o que você está passando.
            Sem julgamentos. Sem exposição.
          </p>
          <Link
            to="/forum"
            className="inline-block bg-white text-brand-700 font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform animate-fade-in-up [animation-delay:300ms]"
          >
            Entrar no Fórum de Apoio
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8">
        <PilarCard emoji="🔒" titulo="100% Anônimo" texto="Você participa sem precisar se identificar. Sua privacidade é prioridade." delay="0ms" />
        <PilarCard emoji="💬" titulo="Comunidade Acolhedora" texto="Relate o que está sentindo e receba apoio de pessoas que já passaram por isso." delay="150ms" />
        <PilarCard emoji="🎙️" titulo="Conversa em Tempo Real" texto="Entre em nossa sala de voz para conversar ao vivo quando precisar de companhia." delay="300ms" />
      </section>

      <section className="bg-brand-50 py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-2xl font-bold text-brand-700 mb-4">Pedir ajuda é um ato de coragem.</h2>
          <p className="text-gray-600">
            Se você está passando por uma situação de bullying, saiba que
            existem pessoas prontas para te ouvir agora mesmo. Dê o primeiro passo.
          </p>
        </div>
      </section>
    </div>
  );
}

function PilarCard({ emoji, titulo, texto, delay }) {
  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-8 text-center border border-gray-100 animate-fade-in-up"
      style={{ animationDelay: delay }}
    >
      <div className="text-4xl mb-4">{emoji}</div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{titulo}</h3>
      <p className="text-gray-500 text-sm">{texto}</p>
    </div>
  );
}