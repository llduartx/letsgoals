import Subtitulo from "../../../../components/Layout/Subtitulo";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../context/usuarioContext";
import { Link } from "react-router";
import React from "react";

import FormatarReais from "../../../../components/Layout/FormatarReais";
import GraficoMeta from "../Components/BarcChart"

export default function ListaMetas() {
    const { usuarioLogado } = useAuth();
    const [metasUsuario, setMetasUsuario] = useState([]);
    const [contribuicoes, setContribuicoes] = useState([]);

    useEffect(() => {
        if (usuarioLogado) {
            // Busca as participações do usuário logado
            fetch(`http://localhost:3000/participacoes?usuarioId=${usuarioLogado.id}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Erro ao buscar participações do usuário");
                    }
                    return response.json();
                })
                .then((participacoes) => {
                    // Extrai os IDs das metas das participações
                    const metaIds = participacoes.map((p) => p.metaId);

                    // Busca as informações completas das metas
                    const promises = metaIds.map((id) =>
                        fetch(`http://localhost:3000/metas/${id}`).then((res) => {
                            if (!res.ok) {
                                throw new Error(`Erro ao buscar meta com ID ${id}`);
                            }
                            return res.json();
                        })
                    );

                    Promise.all(promises)
                        .then((metas) => setMetasUsuario(metas))
                        .catch((error) => console.error("Erro ao carregar metas:", error));
                })
                .catch((error) => console.error("Erro ao carregar participações:", error));

            // Busca as contribuições
            fetch(`http://localhost:3000/contribuicoes`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Erro ao buscar contribuições");
                    }
                    return response.json();
                })
                .then((data) => setContribuicoes(data))
                .catch((error) => console.error("Erro ao carregar contribuições:", error));
        }
    }, [usuarioLogado]);

    return (
        <div>
            <Subtitulo texto="Suas Metas" />
            {metasUsuario.length > 0 ? (
                <ul className="space-y-4 mx-4">
                    {metasUsuario.map((meta) => {
                        const totalContribuido = contribuicoes
                            .filter((c) => c.metaId === meta.id)
                            .reduce((acc, curr) => acc + curr.valor, 0);

                        return (
                            <li key={meta.id}
                                className={meta.status == 'Concluída'
                                    ? "p-4 bg-menta rounded-md shadow-md flex items-center"
                                    : "p-4 bg-gray-200 rounded-md shadow-md flex items-center"
                                }>
                                <img
                                    src={meta.imagem}
                                    alt={meta.titulo}
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                                <Link
                                    to={{
                                        pathname: `/meta-detalhes/${meta.id}`,
                                        state: { meta },
                                    }}
                                    className="block hover:underline flex-1 min-w-0 ml-4"
                                >
                                    <h3 className="text-base font-semibold ">
                                        {meta.titulo}

                                    </h3>
                                    <p className="text-md">Contribuído: <FormatarReais valor={totalContribuido} /></p>
                                    <p className="text-md">Valor Alvo: <FormatarReais valor={meta.valorAlvo} /></p>
                                        <GraficoMeta total={meta.valorAlvo} atual={totalContribuido} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="space-y-4 mx-4 italic">Você ainda não possui metas cadastradas.</p>
            )}
        </div>
    );
}