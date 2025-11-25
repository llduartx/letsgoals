// REACT E NEXT IMPORTS ---------------------------------------------------------
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../../context/usuarioContext'
import { useNavigate } from 'react-router'

// COMPONENTES ------------------------------------------------------------------
import Header from '../../../components/Layout/Header'
import Footer from '../../../components/Layout/Footer'
import Titulo from '../../../components/Layout/Titulo'
import FormatarReais from '../../../components/Layout/FormatarReais'
import Subtitulo from '../../../components/Layout/Subtitulo'

// COMPONENTE PRINCIPAL ----------------------------------------------------------
export default function Contribuir() {

  // VARIAVEIS E FUNÇÕES GERAIS -------------------------------------------------
  const { usuarioLogado, isAuthLoading, login, logout } = useAuth()
  const { register, reset, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()

  const [metasUsuario, setMetasUsuario] = React.useState([])
  const [saldoMeta, setSaldoMeta] = useState(0);
  const [metaContribuida, setMetaContribuida] = useState('');
  const [mostrarMensagemContribuicao, setMostrarMensagemContribuicao] = useState(false);
  const [valorAlvoMeta, setValorAlvoMeta] = useState(0);
  const [saldoDoUsuario, setSaldoDoUsuario] = useState(usuarioLogado.saldoUsuario);
  const [usuario, setUsuario] = useState(usuarioLogado);

  // INICIALIZAÇÃO DA PÁGINA ---------------------------------------------------
  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (usuarioLogado) {
      // Requisita as participações do usuário logado
      fetch(`http://localhost:3000/participacoes?usuarioId=${usuarioLogado.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao buscar participações do usuário");
          }
          return response.json();
        })
        .then((participacoes) => {
          const metaIds = participacoes.map((p) => p.metaId);

          // Requisita as Metas do usuário com base nos IDs
          return Promise.allSettled(
            metaIds.map((id) =>
              fetch(`http://localhost:3000/metas/${id}`).then((res) => {
                if (!res.ok) {
                  throw new Error(`Erro ao buscar meta com ID ${id}`);
                }
                return res.json();
              })
            )
          );
        })
        .then((results) => {
          const metas = results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
          setMetasUsuario(metas);
        })
        .catch((error) => console.error("Erro ao carregar dados do usuário:", error));
    } else {
      navigate("/login");
    }
  }, [isAuthLoading, usuarioLogado, navigate]);

  
  // ALTERANDO VISUALIZAÇÃO DE META ----------------------------------------------------
  
  const selectMetaValor = (event) => {
    const idMeta = event.target.value;

    // Atualiza o valor alvo da meta selecionada
    const metaSelecionada = metasUsuario.find((meta) => meta.id === idMeta);
    setValorAlvoMeta(metaSelecionada?.valorAlvo || 0);

    fetch(`http://localhost:3000/contribuicoes?metaId=${idMeta}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro ao buscar contribuições da meta");
        }
        return response.json();
      });
  };


  // REGISTRO DA CONTRIBUIÇÃO ----------------------------------------------------
  async function registrarContribuicao(data) {

    // Variáveis da contribuição
    const meta = data.meta;
    const valor = parseFloat(data.valor);
    // Outras variáveis
    const datahora = new Date().toISOString();
  const saldoUsuario = usuarioLogado.saldoUsuario;

    // CRIANDO CONTRIBUIÇÃO -------------------------------------------------
    try {
      const resposta = await fetch("http://localhost:3000/contribuicoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metaId: meta,
          usuarioId: usuarioLogado.id,
          valor,
          data: datahora,
        }),
      });
      if (!resposta.ok) {
        throw new Error("Erro ao registrar contribuição");
      }
      

      // ALTERANDO STATUS DA META, SE NECESSÁRIO ---------------------------------------------
      // Calcula o novo saldo da meta após a contribuição
      const saldoMetaAtualizado = (saldoMeta || 0) + valor;
      const diferenca = Math.abs(saldoMetaAtualizado - valorAlvoMeta);
      // Verifica se o saldo atualizado é maior ou igual ao valor alvo, considerando uma margem de erro para números decimais
      if (saldoMetaAtualizado >= valorAlvoMeta || diferenca < 0.01) {
        const respPatchMeta = await fetch(`http://localhost:3000/metas/${meta}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Concluída" }),
        });
        if (!respPatchMeta.ok) console.error('Falha ao atualizar status da meta', await respPatchMeta.text());
      }


      // ATUALIZANDO SALDO DO USUÁRIO -------------------------------------------------
      const saldoCalculado = (Number(saldoDoUsuario) || Number(usuarioLogado.saldoUsuario) || 0) - Number(valor);
      
      // Pro saldo não ficar negativo (mínimo 0)
  const saldoUsuarioAtualizado = saldoCalculado < 0 ? 0 : saldoCalculado;
      setSaldoDoUsuario(saldoUsuarioAtualizado);
      const respostaAlterarSaldo = await fetch(`http://localhost:3000/usuarios/${usuarioLogado.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ saldoUsuario: saldoUsuarioAtualizado }),
      });
      if (!respostaAlterarSaldo.ok) {
        console.error('Falha ao atualizar usuário', await respostaAlterarSaldo.text());
      } else {
        // Atualiza o estado local do usuário antes de re-logar para garantir que o contexto receba o novo saldo
        const usuarioAtualizado = { ...usuario, saldoUsuario: saldoUsuarioAtualizado };
        setUsuario(usuarioAtualizado);
        // refresh do contexto: faz logout e login com o usuário atualizado
        try {
          logout();
          login(usuarioAtualizado);
        } catch (e) {
          console.warn('Erro ao reiniciar sessão para atualizar contexto:', e);
        }
      }
      

      const metaContribuidaData = metasUsuario.find((m) => m.id === meta);
      setMetaContribuida(metaContribuidaData?.titulo || "");
      setValorAlvoMeta(metaContribuidaData?.valorAlvo || 0);
      
      setMostrarMensagemContribuicao(true);
      setTimeout(() => setMostrarMensagemContribuicao(false), 3000);
      
    } catch (error) {
      console.error("Erro ao registrar contribuição:", error);
    } finally {
      reset();
    }
  }

  // RENDERIZAÇÃO DO COMPONENTE -------------------------------------------------
  return (
    <div>
      < Header />

      <div className="flex justify-center text-center">
        <Titulo texto="Sua contribuição é a chave do LetsGoals!" />
      </div>

      <form onSubmit={handleSubmit(registrarContribuicao)}>
        <div className="form__select__meta  m-4 flex flex-col items-center">
          <div>

            <label
              htmlFor="meta"
              className="text-sm/8 font-medium text-gray-900">
              Em qual Meta você deseja contribuir?
            </label>

            <div className="grid grid-cols-1 m-0">

              <select
                id="meta"
                {...register("meta", {
                  required: "Você precisa selecionar uma meta",
                  onChange: (event) => {
                    const idMeta = event.target.value;
                    if (idMeta === "Selecione uma meta") {
                      setSaldoMeta(0);
                      setValorAlvoMeta(0);
                      return;
                    }

                    // Atualiza saldoMeta e valorAlvoMeta com base na meta selecionada
                    const metaSelecionada = metasUsuario.find((meta) => meta.id === idMeta);
                    setValorAlvoMeta(metaSelecionada?.valorAlvo || 0);

                    fetch(`http://localhost:3000/contribuicoes?metaId=${idMeta}`)
                      .then((response) => {
                        if (!response.ok) {
                          throw new Error("Erro ao buscar contribuições da meta");
                        }
                        return response.json();
                      })
                      .then((contribuicoes) => {
                        const totalContribuido = contribuicoes.reduce((acc, curr) => acc + curr.valor, 0);
                        setSaldoMeta(totalContribuido);
                      })
                      .catch((error) => {
                        console.error("Erro ao calcular saldo da meta:", error);
                        setSaldoMeta(0);
                      });
                  },
                })}
              >
                <option value="Selecione uma meta">Selecione uma meta</option>
                {metasUsuario.map((meta) => (
                  <option key={meta.id} value={meta.id}>
                    {meta.titulo}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 16 16" fill="currentColor" data-slot="icon" aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4">
                <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
              </svg>

            </div>
          </div>

          {errors.meta && (
            <p className="text-red-500 text-sm mt-1">{errors.meta.message}</p>
          )}

        </div>

        <div className="form__input__valor  m-4 flex flex-col items-center">

          <label
            htmlFor="valor"
            className="text-sm/8 font-medium text-gray-900">
            Qual valor que você pretende obter no total?
          </label>

          {
            document.getElementById("meta")?.value === "Selecione uma meta"
              ? <div><p className='text-fundo mb-2'>.</p></div>
              : <div className='informações__da__meta  flex gap-2 mb-2'>
                <p className="text-sm text-gray-700 mt-2">
                  Saldo atual <FormatarReais valor={saldoMeta} />
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Valor Alvo: <FormatarReais
                    valor={metasUsuario.find(meta => meta.id === document.getElementById("meta")?.value)?.valorAlvo || 0} />
                </p>
              </div>

          }

          <input
            id="valor"
            type="number"
            step="0.01"
            name="valor"
            min={0}
            className="block rounded-md bg-white px-4 py-2 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-verdeescuro"
            {...register("valor", {
              required: "Você precisa informar o valor da contribuição",
              validate: {
                maiorQueZero: (v) => v > 0 || "Verifique o valor informado",
                menorQueValorAlvo: (v) =>
                  v <= (valorAlvoMeta - saldoMeta) || `O valor não pode ser maior que ${(valorAlvoMeta - saldoMeta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2,maximumFractionDigits: 2 })}`},})}
          />
          {errors.valor && (
            <p className="text-red-500 text-sm mt-1">{errors.valor.message}</p>
          )}
        </div>

        <div className="form__botoes  flex p-4 justify-center gap-4 mt-12">
          <input
            className=" bg-branco text-textop py-3 px-9 text-md rounded-full flex items-center text-center font-bold cursor-pointer hover:text-textos hover:outline-1"
            type="reset"
            value="Limpar" />

          <input
            className="bg-verde text-white py-3 px-9 text-md rounded-full flex items-center text-center font-bold cursor-pointer hover:bg-verdeescuro"
            type="submit"
            value="Contribuir" />
        </div>

      </form>

      {mostrarMensagemContribuicao && (
        <div className='text-center'>
          <Subtitulo className="text-center" texto={`Bem demais! Você contribuiu na Meta ${metaContribuida}`} />
        </div>
      )}

      <Footer />
    </div >
  );
}
