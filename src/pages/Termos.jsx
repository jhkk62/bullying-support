// src/pages/Termos.jsx
export default function Termos() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Termos de Uso</h1>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-800 mb-2">O que é o Apoia+</h2>
          <p>Projeto estudantil para dar apoio a quem passa por bullying. Não é um serviço profissional de saúde mental, e não substitui ajuda psicológica, um adulto de confiança ou serviços de emergência.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Regras da comunidade</h2>
          <p>Trate as outras pessoas com respeito. Ameaças, discurso de ódio e ataques pessoais podem levar à remoção do conteúdo e a banimento temporário. Use o botão de denúncia se ver algo que viole essas regras.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Sobre sua privacidade</h2>
          <p>O site não exibe quem escreveu cada post ou comentário. Ainda assim, nenhum sistema é 100% infalível — falhas técnicas ou de terceiros podem, em teoria, comprometer essa proteção, e não nos responsabilizamos por vazamentos fora do nosso controle.</p>
          <p className="mt-2"><strong>Não escreva seu nome completo, endereço, escola, telefone ou redes sociais</strong> nos seus relatos.</p>
        </section>
        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Se você está passando por um momento difícil</h2>
          <p>Procure ajuda imediatamente: CVV — 188, gratuito, 24h por dia (cvv.org.br), ou vá a um pronto-socorro.</p>
        </section>
      </div>
    </div>
  );
}