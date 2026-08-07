// src/pages/Termos.jsx
export default function Termos() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Termo de Uso e Diretrizes</h1>
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
        <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">🔒 Seu anonimato é protegido</h2>
          <p>Ninguém vai saber quem postou, nem seus colegas, nem os professores — só a administração do site tem acesso a essa informação, e só pra controlar quem está abusando da plataforma. Seus posts e comentários são 100% anônimos pra todo mundo.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">O que é o Apoia+</h2>
          <p>O Apoia+ é um espaço criado por alunos do colégio para compartilhar relatos de bullying, pedir apoio e conversar sobre situações difíceis. O objetivo é oferecer acolhimento e fazer você se sentir menos sozinho(a).</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Regras de convivência</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Ameaças e ataques diretos não são tolerados.</strong> Você não pode ameaçar, intimidar ou atacar ninguém especificamente. Ex: "vou te bater", "devia morrer" — isso é levado a sério.</li>
            <li><strong>Xingamentos leves podem ser usados pra descrever sua história.</strong> Se você quer relatar que alguém te chamou de "idiota" ou usou xingamentos pra te humilhar, tudo bem descrever isso no seu relato (em maiúscula, com aspas, deixando claro que é citação). A gente diferencia entre "citando algo que disseram" e "você atacando alguém".</li>
            <li><strong>Comentários com linguagem ofensiva são sério.</strong> Se você escrever xingamentos ou palavrões nos comentários (não como citação, mas atacando), vai levar uma suspensão temporária de 2 minutos a algumas horas.</li>
            <li><strong>Conteúdo que viole essas regras pode ser removido.</strong> A administração pode excluir posts ou comentários tóxicos a qualquer hora.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Cuidado com seus dados pessoais</h2>
          <p>Mesmo sendo anônimo, não compartilhe seu nome completo, endereço, telefone, instagram ou qualquer coisa que possa te identificar dentro de seus relatos ou comentários. Quanto menos informação pessoal, melhor.</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Isso não substitui ajuda profissional</h2>
          <p>O Apoia+ é um espaço de apoio entre colegas, mas não substitui conversar com um adulto de confiança, um professor, a coordenação ou um profissional de saúde. Se você está em risco ou com pensamentos de automutilação, procure ajuda imediata:</p>
          <p className="font-semibold mt-2">🆘 <strong>CVV (Centro de Valorização da Vida)</strong></p>
          <p>📞 <strong>Telefone: 188</strong> (gratuito, 24 horas)</p>
          <p>🌐 <strong>Site: cvv.org.br</strong></p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Aviso importante sobre segurança</h2>
          <p>Este é um projeto estudantil feito com o melhor cuidado, mas nenhum sistema é 100% seguro. Embora a gente faça o possível pra manter seus dados protegidos e anônimos, não podemos garantir proteção absoluta contra vazamentos ou abusos que fogem do controle da plataforma. Portanto, como dito acima: não compartilhe informações pessoais.</p>
        </section>
      </div>
    </div>
  );
}