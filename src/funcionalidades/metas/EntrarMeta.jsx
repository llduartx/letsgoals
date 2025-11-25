import { useForm } from "react-hook-form"
import { useState } from "react"
import { useNavigate } from "react-router"
import Header from "../../components/Layout/Header"
import Titulo from "../../components/Layout/Titulo"


import { useAuth } from '../../context/usuarioContext'; 

function Pesquisa() {
  const { register, handleSubmit } = useForm()
  const [metas, setMetas] = useState([])
  const navigate = useNavigate()
  
  
  const { usuarioLogado, isAuthLoading } = useAuth() 

  async function entrarMeta(data) {
    try {
      const resposta = await fetch("http://localhost:3000/metas")
      if (!resposta.ok) throw new Error("Erro ao buscar metas")
      const dados = await resposta.json()
      const dadosFiltrados = dados.filter(meta =>
        meta.linkConvite.toUpperCase() === data.pesquisa.toUpperCase()
      )

      if (dadosFiltrados.length === 0) {
        alert("Não há metas com esse código")
      } else {
        setMetas(dadosFiltrados)
      }

    } catch (erro) {
      console.log("Erro: ", erro.message)
    }
  }

  async function registrarParticipacaoENavegar(metaId) {
    if (isAuthLoading) {
        alert("Aguarde, carregando informações do usuário.");
        return;
    }
    
    const userIdLogado = usuarioLogado.id;
    
    if (!userIdLogado) {
      alert("Você precisa estar logado para entrar em uma meta.");
      return;
    }

    try {
      const respostaParticipacao = await fetch("http://localhost:3000/participacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metaId: metaId,
          usuarioId: userIdLogado, 
        })
      })

      if (!respostaParticipacao.ok) {
        if (respostaParticipacao.status === 409) {
             console.log("Usuário já participa desta meta, apenas navegando.");
        } else {
            throw new Error(`Erro ao registrar participação: ${respostaParticipacao.statusText}`);
        }
      } else {
        alert("Participação registrada com sucesso!");
      }
      
    
      navigate(`/meta-detalhes/${metaId}`) 

    } catch (erro) {
      console.log("Erro ao processar participação ou navegar: ", erro.message)
      alert(`Ocorreu um erro: ${erro.message}`);
    }
  }

  const listaMetas = metas.map(meta => (
    <section className='flex border-2 border-solid p-4 border-black rounded-lg' key={meta.id}>
      <img className="w-50 h-50 object-cover rounded-md mb-4" src={meta.imagem} alt={`Capa: ${meta.titulo}`} />
      <div className='m-5 text-lg'>
        <h2>{meta.titulo}</h2>
        <h4>Prazo: {meta.periodoConclusao} meses</h4>
        <h4>Status: {meta.status}</h4>
        <h5>Valor alvo: R$ {meta.valorAlvo}</h5>
        
        <button 
          className="cursor-pointer p-2 m-2 bg-verde hover:bg-verdeescuro text-white font-bold no-underline rounded-lg border-0" 
          onClick={() => registrarParticipacaoENavegar(meta.id)} 
        >
          Entrar
        </button>

      </div>
    </section>
  ))

  return (
    <>
      <Header />
      <section className="flex m-10 flex-col gap-2 items-center">
        <Titulo texto="Coloque o código da Meta:" />
        <form className='flex flex-col items-center justify-center gap-4 mb-8' onSubmit={handleSubmit(entrarMeta)}>
          <input
            type="text"
            className='p-3 border-2 border-solid border-verde rounded-md'
            required
            placeholder=""
            {...register("pesquisa")}
          />
          
        </form>

        <section className=''>
          {listaMetas}
        </section>
      </section>
    </>
  )
}

export default Pesquisa