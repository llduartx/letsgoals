import Headers from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

import { useAuth } from '../../context/usuarioContext'
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function Ajuda() {
  const { usuarioLogado, isAuthLoading } = useAuth()
  const navigate = useNavigate()
  
    useEffect(() => {
      if (!isAuthLoading) {
        if (!usuarioLogado) {
          navigate("/")
        }
      }
    }, [usuarioLogado, isAuthLoading, navigate])
  
    if (isAuthLoading) {
      return <p className="pt-40 text-center">Carregando...</p>
    }


  return (
    <div className="text-gray-800">
      <Headers />
      <h1 className="p-6 text-3xl font-bold mb-4 text-center">🧭 Bem-vindo ao LetsGoals!</h1>

      <p className="mb-6 text-justify px-4">
        O <strong>LetsGoals</strong> foi criado para transformar o jeito como você e seus amigos realizam
        <strong> objetivos financeiros em grupo</strong>. Seja uma viagem, um evento ou uma compra importante,
        aqui vocês organizam tudo de forma simples, transparente e divertida!
      </p>

      <section className="mb-8 px-4">
        <h2 className="text-2xl font-semibold mb-2">💡 O que é o LetsGoals</h2>
        <p>
          O LetsGoals é um aplicativo que funciona como um <strong>cofrinho coletivo digital</strong>.
          Você cria uma meta, convida amigos para participar e todos acompanham juntos o progresso
          até atingirem o valor desejado.
        </p>
        <p className="mt-3">
          <strong>Importante:</strong> o aplicativo <strong>não movimenta dinheiro real</strong>.
          As contribuições são feitas fora da plataforma (por PIX ou outro método), e aqui você apenas registra
          os valores pagos para manter tudo organizado.
        </p>
      </section>

      <section className="mb-8 px-4">
        <h2 className="text-2xl font-semibold mb-2">🚀 Como funciona</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li><strong>Crie sua meta:</strong> escolha um objetivo coletivo, defina um nome, o valor total e o prazo.</li>
          <li><strong>Convide seus amigos:</strong> compartilhe o link gerado para que entrem na meta.</li>
          <li><strong>Acompanhe o progresso:</strong> veja quem já contribuiu e quanto falta para atingir o valor.</li>
          <li><strong>Conclua e comemore 🎉:</strong> quando todos atingirem o valor combinado, a meta é concluída!</li>
        </ol>
      </section>

      <section className="mb-8 px-4">
        <h2 className="text-2xl font-semibold mb-2">👥 Exemplos de uso</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>🌴 Viagem em grupo com amigos</li>
          <li>🎓 Formatura da turma</li>
          <li>💍 Casamento ou compra em casal</li>
          <li>🎫 Ingressos para um festival</li>
          <li>🎁 Presentes de alto valor em conjunto</li>
        </ul>
      </section>

      <section className="mb-8 px-4">
        <h2 className="text-2xl font-semibold mb-2">🔒 Segurança e privacidade</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>As senhas são armazenadas com criptografia segura.</li>
          <li>A comunicação entre o aplicativo e o servidor é protegida por <strong>HTTPS</strong>.</li>
          <li>Nenhuma transação financeira é feita dentro do aplicativo — tudo é apenas registrado.</li>
        </ul>
      </section>

      <section className="mb-8 px-4">
        <h2 className="text-2xl font-semibold mb-2">📱 Dicas rápidas</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Use nomes claros para suas metas (ex: <em>Viagem Florianópolis 2025</em>).</li>
          <li>Acompanhe suas metas em tempo real, pelo celular ou computador.</li>
          <li>Mantenha os registros atualizados para evitar confusões entre os participantes.</li>
        </ul>
      </section>

      <section className="mb-8 px-4">
        <h2 className="text-2xl font-semibold mb-2">💬 Precisa de ajuda?</h2>
        <p>
          Se surgir alguma dúvida, entre em contato pelo nosso suporte dentro do app
          ou envie uma mensagem pelas redes sociais oficiais do LetsGoals.
          <br />
          Estamos aqui para ajudar você a transformar <strong>planos em conquistas!</strong>
        </p>
      </section>
      <Footer />
    </div>
  );
}
