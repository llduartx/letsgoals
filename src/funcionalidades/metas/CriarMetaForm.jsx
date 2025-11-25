import "../../styles/input.css"

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import Titulo from "../../components/Layout/Titulo";
import BotaoVoltar from "../../components/Botoes/BotaoVoltar";

import { useAuth } from "../../context/usuarioContext"

export default function CriarMetaForm() {
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const { usuarioLogado, isAuthLoading } = useAuth()


  // INICIALIZAÇÃO DA PÁGINA ---------------------------------------------------
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (usuarioLogado) {
      setFocus("metaTitulo")
    } else {
      navigate("/login")
    }
  }, [isAuthLoading, usuarioLogado, setFocus, navigate])



  // REGISTRO DA META ----------------------------------------------------------
  async function criarMeta(data) {
    if (!usuarioLogado) return


    // Criando as variáveis para envio

    const liderId = usuarioLogado.id
    const tipoMeta = data.tipoMeta
    const titulo = data.metaTitulo
    const valorAlvo = Number(data.valorAlvo)
    const periodoConclusao = data.periodoConclusao
    const linkConvite = String(Math.floor(Math.random() * 9999))
    let imagem = ""

    if (tipoMeta === "Viagem") {
      imagem = "https://images.pexels.com/photos/386009/pexels-photo-386009.jpeg?_gl=1*1lfkqwv*_ga*NzMwMTQ0NDUzLjE3NjI5NjA3MDI.*_ga_8JE65Q40S6*czE3NjI5NjA3MDEkbzEkZzEkdDE3NjI5NjA3MTYkajQ1JGwwJGgw"
    } else if (tipoMeta === "Formatura") {
      imagem = "https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?_gl=1*1x2nsfc*_ga*NzMwMTQ0NDUzLjE3NjI5NjA3MDI.*_ga_8JE65Q40S6*czE3NjI5NjA3MDEkbzEkZzEkdDE3NjI5NjA4NzMkajMyJGwwJGgw"
    } else if (tipoMeta === "Aluguel") {
      imagem = "https://images.pexels.com/photos/7579192/pexels-photo-7579192.jpeg?_gl=1*1q84cne*_ga*NzMwMTQ0NDUzLjE3NjI5NjA3MDI.*_ga_8JE65Q40S6*czE3NjI5NjA3MDEkbzEkZzEkdDE3NjI5NjA5MTkkajYwJGwwJGgw"
    } else {
      imagem = "https://images.pexels.com/photos/3943723/pexels-photo-3943723.jpeg?_gl=1*i4fecu*_ga*NzMwMTQ0NDUzLjE3NjI5NjA3MDI.*_ga_8JE65Q40S6*czE3NjI5NjA3MDEkbzEkZzEkdDE3NjI5NjA5NTIkajI3JGwwJGgw"
    }

    // Criando a META no backend
    try {
      const resposta = await fetch("http://localhost:3000/metas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          liderId,
          tipoMeta,
          titulo,
          valorAlvo,
          periodoConclusao,
          status: "ativo",
          linkConvite: linkConvite,
          imagem
        })
      })
      if (!resposta.ok) {
        const errorText = await resposta.text().catch(() => "")
        throw new Error(`Erro ao cadastrar a meta (Status ${resposta.status}): ${errorText}`)
      }

      const novaMeta = await resposta.json()

      // Criando a PARTICIPAÇÃO no backend
      const participacao = {
        metaId: novaMeta.id,
        usuarioId: usuarioLogado.id,
      };

      const respostaParticipacao = await fetch("http://localhost:3000/participacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participacao),
      });

      if (!respostaParticipacao.ok) {
        const errorText = await respostaParticipacao.text().catch(() => "");
        throw new Error(`Erro ao registrar participação (Status ${respostaParticipacao.status}): ${errorText}`);
      }

      alert(`✅ Ok! a Meta ${novaMeta.titulo} foi criada e sua participação foi registrada!`)
      navigate("/home")

    } catch (error) {
      console.error(`❌ Erro ao criar meta:`, error)
      alert(`❌ ${error.message}`)
    }

    reset()
  }

  if (isAuthLoading) {
    return <p className="pt-40 text-center">Carregando...</p>
  }

  if (!usuarioLogado) {
    return <p className="pt-40 text-center">Você precisa estar logado para ver esta página. Redirecionando...</p>
  }

  return (
    <div className="container  flex flex-col items-center pt-40 h-screen bg-fundo" >

      <div className="flex justify-center text-center">
        <Titulo texto="Bora Criar uma Meta Coletiva!" />
      </div>

      <form onSubmit={handleSubmit(criarMeta)}>

        <div className="form__select__tipo m-4 flex flex-col items-center">
          <div>

            <label
              htmlFor="tipo"
              className="text-sm/8 font-medium text-gray-900">
              Qual o tipo da sua meta?
            </label>

            <div className="grid grid-cols-1 m-0">

              <select
                id="tipo"
                name="tipo"
                autoComplete="tipo"
                className="col-start-1 row-start-1 bg-white appearance-none rounded-md py-2 pr-4 pl-4 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-verdescuro"
                {...register("tipoMeta")}>
                <option value="" disabled className="text-sm">Selecione o tipo:</option>
                <option value="Viagem" className="text-sm">Viagem</option>
                <option value="Formatura" className="text-sm">Formatura</option>
                <option value="Aluguel" className="text-sm">Aluguel</option>
                <option value="Outros" className="text-sm">Outro...</option>
              </select>

              <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4">
                <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
              </svg>

            </div>
          </div>
        </div>

        <div className="form__input__titulo  m-4 flex flex-col items-center">

          <label
            htmlFor="titulo"
            className="text-sm/8 font-medium text-gray-900">
            Dê um nome à sua meta:
          </label>

          <input
            id="titulo"
            type="text"
            name="metaTitulo"
            className="block bg-white rounded-md px-4 py-2 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-verdeescuro"
            {...register("metaTitulo",
              { required: "Sua meta precisa de um nome" })}
          />
          {errors.metaTitulo && <span className="text-red-600">{errors.metaTitulo.message}</span>}
        </div>

        <div className="form__input__valor  m-4 flex flex-col items-center">

          <label
            htmlFor="valorAlvo"
            className="text-sm/8 font-medium text-gray-900">
            Qual valor que você pretende obter no total?
          </label>

          <input
            id="valorAlvo"
            type="number"
            step="0.01"
            name="valorAlvo"
            className="block bg-white rounded-md px-4 py-2 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-verdeescuro"
            {...register("valorAlvo",
              { required: "Você precisa indicar um valor final" })}
          />
          {errors.valorAlvo && <span className="text-red-600">{errors.valorAlvo.message}</span>}
        </div>

        <div className="form__select__periodo m-4 flex flex-col items-center">
          <div>

            <label
              htmlFor="periodoConclusao"
              className="text-sm/8 font-medium text-gray-900">
              Quantos meses você concluirá a meta?
            </label>

            <div className="grid grid-cols-1 m-0">

              <select
                id="periodoConclusao"
                name="periodoConclusao"
                autoComplete="periodoConclusao"
                className="col-start-1 row-start-1 bg-white appearance-none rounded-md py-2 pr-4 pl-4 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-verdescuro"
                {...register("periodoConclusao")}>
                <option value="" disabled className="text-sm">Selecione um período</option>
                <option value="3" className="text-sm">3 meses</option>
                <option value="6" className="text-sm">6 meses</option>
                <option value="9" className="text-sm">9 meses</option>
                <option value="12" className="text-sm">1 ano</option>
                <option value="24" className="text-sm">2 anos</option>
              </select>

              <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4">
                <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
              </svg>

            </div>
          </div>
        </div>

        <div className="form__botoes  flex p-4 justify-center gap-4 mt-12">

          <input
            className="text-textop py-3 px-9 text-md rounded-full flex items-center text-center font-bold cursor-pointer hover:text-textos hover:outline-1"
            type="reset"
            value="Limpar" />

          <input
            className="bg-verde text-white py-3 px-9 text-md rounded-full flex items-center text-center font-bold cursor-pointer hover:bg-verdeescuro"
            type="submit"
            value="Criar Meta" />
        </div>

      </form>
      <BotaoVoltar link="/home" texto="Voltar para Página Inicial" />

    </div >
  )
}