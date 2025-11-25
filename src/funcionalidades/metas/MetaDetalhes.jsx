import { useParams } from "react-router";
import { useEffect, useState } from "react";

import { useAuth } from "../../context/usuarioContext";
import { FaCalendarAlt } from "react-icons/fa";
import { PiMoneyWavyFill } from "react-icons/pi";

import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import BotaoVerde from "../../components/Botoes/BotaoVerde";
import FormatarReais from "../../components/Layout/FormatarReais";

// INICIA A FUNÇÃO PRINCIPAL ---------------------------------------------------

export function MetaDetalhes() {

    // Cria as variáveis de estado e hooks
    const { id } = useParams();
    const { usuarioLogado } = useAuth();

    const [meta, setMeta] = useState(null);
    const [lider, setLider] = useState(null);
    const [participantes, setParticipantes] = useState([]);
    const [contribuicoes, setContribuicoes] = useState([]);
    const [error, setError] = useState(null);
    const [totalContribuido, setTotalContribuido] = useState(0);

    //
    useEffect(() => {
        // Busca os dados do Usuário atraves do ID da meta
        fetch(`http://localhost:3000/metas/${id}`)
            .then((response) => {
                if (!response.ok) { throw new Error("Erro ao buscar detalhes da meta"); }
                return response.json();
            })
            .then((data) => {
                setMeta(data); // Todas infos da Meta
                // Busca o líder da meta
                return fetch(`http://localhost:3000/usuarios/${data.liderId}`);
            })
            .then((response) => {
                if (!response.ok) { throw new Error("Erro ao buscar líder da meta"); }
                return response.json();
            })
            .then((data) => setLider(data)) // Todas infos do Usuário Lider
            .catch((err) => setError(err.message));

        // Busca os participantes da meta
        fetch(`http://localhost:3000/participacoes?metaId=${id}`)
            .then((response) => {
                if (!response.ok) { throw new Error("Erro ao buscar participantes da meta"); }
                return response.json();
            })
            .then((data) => {
                const userPromises = data.map((participacao) =>
                    fetch(`http://localhost:3000/usuarios/${participacao.usuarioId}`)
                        .then((response) => {
                            if (!response.ok) { throw new Error("Erro ao buscar usuário participante"); }
                            return response.json();
                        })
                );

                Promise.all(userPromises)
                    .then((users) => setParticipantes(users))
                    .catch((err) => setError(err.message));
            })
            .catch((err) => setError(err.message));

        // Busca as contribuições do usuário logado e dos participantes
        fetch(`http://localhost:3000/contribuicoes?metaId=${id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro ao buscar contribuições da meta");
                }
                return response.json();
            })
            .then((data) => setContribuicoes(data))
            .catch((err) => setError(err.message));
    }, [id, usuarioLogado]);

    // Recalcula o total contribuído sempre que a lista de contribuições mudar
    useEffect(() => {
        const total = contribuicoes.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
        setTotalContribuido(total);
    }, [contribuicoes]);

    // REMOVENDO PARTICIPANTE ------------------------------------------------------------------
    const removerParticipante = async (p) => {
        try {
            const participacoes = await fetch(
                `http://localhost:3000/participacoes?metaId=${id}&usuarioId=${p.id}`
            ).then((res) => res.json());

            if (participacoes.length > 0) {
                await fetch(`http://localhost:3000/participacoes/${participacoes[0].id}`, {
                    method: "DELETE",
                });
                setParticipantes(participantes.filter((part) => part.id !== p.id));
            }

            // Reembolsa o participante com base nas contribuições feitas
            const contribsDoAlvo = contribuicoes.filter((c) => c.usuarioId === p.id);
            const totalDoAlvo = contribsDoAlvo.reduce((acc, item) => acc + item.valor, 0);

            if (totalDoAlvo > 0) {
                const usuarioData = await fetch(`http://localhost:3000/usuarios/${p.id}`)
                .then((res) => res.json());
                const novoSaldo = usuarioData.saldoUsuario + totalDoAlvo * 0.2;

                await fetch(`http://localhost:3000/usuarios/${p.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ saldoUsuario: novoSaldo }),
                });

                // Registra a contribuição de penalidade (80% do valor) com usuárioId "0000"
                await fetch(`http://localhost:3000/contribuicoes`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        metaId: meta.id,
                        usuarioId: "0000",
                        valor: parseFloat(totalDoAlvo * 0.8),
                        data: new Date().toISOString(),
                    }),
                });
            }

            // Remove as contribuições do participante
            for (const contribuicao of contribsDoAlvo) {
                await fetch(`http://localhost:3000/contribuicoes/${contribuicao.id}`, {
                    method: "DELETE",
                });
            }
            setContribuicoes(contribuicoes.filter((c) => c.usuarioId !== p.id));
        } catch (error) {
            console.error("Erro ao remover participante:", error);
            alert("Erro ao remover participante.");
        }
    };

    if (error) {
        return <p>{error}</p>;
    }

    if (!meta || !lider) {
        return <p>Carregando detalhes da meta...</p>;
    }

    // Soma da contribuição do usuário logado
    const contribuicaoUsuarioLogado = contribuicoes
        .filter((c) => c.usuarioId === usuarioLogado.id)
        .reduce((acc, curr) => acc + curr.valor, 0);

    // Somando contribuições de penalidades (usuárioId "0000")
    const contribuicoesdePenalidades = contribuicoes
        .filter((c) => c.usuarioId === "0000")
        .reduce((acc, curr) => acc + curr.valor, 0);

    return (
        <div className="bg-fundo h-screen flex flex-col">
            <Header />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">{meta.titulo}</h1>
                <img
                    src={meta.imagem}
                    alt={meta.titulo}
                    className={`w-32 h-32 object-cover rounded-md mb-4 ${meta.status === "Concluída" ? "border-4 border-verde" : ""}`}
                />
                {meta.status === "Concluída" && <p><strong>Status: <span className="bg-verdeescuro px-3 py-1 rounded-full text-white">{meta.status}</span></strong></p>}
                <p><strong>Valor Alvo:</strong> <FormatarReais valor={meta.valorAlvo} /></p>
                <p><strong>Contribuído:</strong> <FormatarReais valor={totalContribuido} />
                {contribuicoesdePenalidades > 0 && (
                <span className="italic">{" [Saldo "}<FormatarReais valor={contribuicoesdePenalidades} />{"]"}</span>)}
                </p>
                
                <p><strong>Período para Conclusão:</strong> {meta.periodoConclusao} meses</p>
                <p><strong>Líder:</strong> {lider.nomeUsuario}</p>
                <p><strong>Senha Convite:</strong> <span className="bg-azul px-1 font-semibold rounded-sm text-white">{meta.linkConvite}</span></p>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Participantes</h3>
                    <ul className="list-disc pl-5">
                        {participantes.map((p) => (
                            <li key={p.id}>
                                {p.nomeUsuario}
                                {usuarioLogado.id === lider.id && p.id !== lider.id && (
                                    <button
                                        onClick={() => removerParticipante(p)}
                                        className="ml-4 text-sm text-red-600 cursor-pointer"
                                    >
                                        Remover
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-4">
                    <h3 className="text-lg font-semibold">Contribuições</h3>
                    <p><strong>Sua contribuição:</strong> <FormatarReais valor={contribuicaoUsuarioLogado} /></p>
                    <ul className="list-disc pl-5">
                        {participantes.map((p) => {
                            const contribuicoesUsuario = contribuicoes.filter((c) => c.usuarioId === p.id);
                            return (
                                <li key={p.id}>
                                    <p>{p.nomeUsuario}:</p>
                                    <ul className="list-disc pl-5">
                                        {contribuicoesUsuario.map((contribuicao) => (
                                            <li key={contribuicao.id} className="flex items-center gap-1">
                                                <FaCalendarAlt />
                                                {new Date(contribuicao.data).toLocaleDateString()} | <PiMoneyWavyFill />
                                                <FormatarReais valor={contribuicao.valor} />
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className="flex justify-center m-4">
            <BotaoVerde link={"/contribuir"} texto={"Contribuir"} type={"button"}/>
            </div>
            <Footer />
        </div>
    );
}