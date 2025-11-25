import { useEffect, useState } from "react";
import { useParams } from "react-router";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/usuarioContext";
import FormatarReais from "../../components/Layout/FormatarReais";

export default function PerfilUsuario() {
    
    const { id } = useParams();
    const { login } = useAuth();
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetch(`http://localhost:3000/usuarios/${id}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Erro ao buscar dados do usuário");
                    }
                    return response.json();
                })
                .then((data) => setUsuario(data))
                .catch((err) => setError(err.message));
        }
    }, [id]);

    // VARIAVEIS ----------------------------------------------------------------
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm()
    
    const [alterarInformacoes, setAlterarInformacoes] = useState(false);

    const toggleAlterarInformacoes = () => {
        setAlterarInformacoes(!alterarInformacoes);
    };

    async function alterarDados(data) {
        try {
            const novaImagem = data.imagem || usuario.imagemUsuario; // Mantém a imagem atual se o campo estiver vazio

            const resposta = await fetch(
                `http://localhost:3000/usuarios/${usuario.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...usuario,
                        nomeUsuario: data.nome,
                        idadeUsuario: data.idade,
                        imagemUsuario: novaImagem,
                    }),
                }
            );
            if (!resposta.ok) throw new Error(`Erro ao alterar usuário`);
            const usuarioAtualizado = await resposta.json();
            setUsuario(usuarioAtualizado);
            reset();
            login(usuarioAtualizado);
        } catch (erro) {
            console.error(`❌ Erro: ${erro.message}`);
        }
    }



    if (error) {
        return <p>{error}</p>;
    }

    if (!usuario) {
        return <p>Carregando dados do usuário...</p>;
    }

    return (
        <div>
            <Header />
            <div className="p-4 flex flex-col items-center w-screen ">
                <h1 className="text-2xl font-bold mb-4">Perfil do Usuário</h1>
                <img
                    src={usuario.imagemUsuario}
                    alt="Foto do usuário"
                    className="w-40 h-40 rounded-full mb-4"
                />

                <form onSubmit={handleSubmit(alterarDados)}>
                    <div>
                        <div className="flex flex-col gap-2">
                            <p>
                                <strong>Nome:</strong> {usuario.nomeUsuario}
                            </p>
                            {alterarInformacoes && (
                                <>
                                    <input
                                        type="text"
                                        className="block w-60 rounded-md bg-white px-4 py-2 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-verdeescuro"
                                        value={usuario.nomeUsuario}
                                        {...register("nome", {
                                            required: "Informe o novo nome de usuário",
                                        })}
                                    />
                                    {errors.nome && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.nome.message}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="mt-2">
                            <p>
                                <strong>Email:</strong> {usuario.emailUsuario}
                            </p>
                        </div>

                        <div className="mt-2">
                            <p>
                                <strong>Saldo em conta:</strong> <FormatarReais valor={usuario.saldoUsuario} />
                            </p>
                        </div>

                        <div className="flex-col mb-2">
                            <div className="flex gap-2 items-center">
                                <strong>Idade:</strong> {usuario.idadeUsuario}
                            </div>
                            {alterarInformacoes && (
                                <>
                                    <input
                                        type="text"
                                        className="block w-60 rounded-md bg-white px-4 py-2 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-verdeescuro"
                                        value={usuario.idadeUsuario}
                                        {...register("idade", {
                                            required: "Informe sua idade",
                                        })}
                                    />
                                    {errors.idade && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.idade.message}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex-col mb-2 gap-2">
                            <div className="flex items-center gap-2">
                                <p>
                                    <strong>Imagem:</strong> {usuario.imagemUsuario && " URL carregada"}
                                </p>
                            </div>
                            {alterarInformacoes && (
                                <>
                                    <input
                                        type="text"
                                        className="block w-60 rounded-md bg-white px-4 py-2 text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-verdeescuro"
                                        value={usuario.imagemUsuario}
                                        {...register("imagem", {
                                            required: "Adicione sua imagem",
                                        })}
                                    />
                                    {errors.imagem && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.imagem.message}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-8 justify-center m-0">
                        <button
                            type="button"
                            onClick={toggleAlterarInformacoes}
                            className=
                            {
                                alterarInformacoes == false
                                    ? "bg-verde text-white py-3 px-9 text-md rounded-full flex items-center text-center font-bold cursor-pointer hover:bg-verdeescuro"
                                    : "bg-branco text-textop py-3 px-9 text-md rounded-full flex items-center text-center font-bold cursor-pointer hover:text-textos hover:outline-1"
                            }
                        >
                            {alterarInformacoes ? "Cancelar" : "Editar Dados"}
                        </button>
                        {alterarInformacoes && (
                            <input
                                className="bg-verde text-white py-3 px-9 text-md rounded-full flex items-center text-center font-bold cursor-pointer hover:bg-verdeescuro"
                                type="submit"
                                value="Salvar"
                            />
                        )}
                    </div>
                </form>
            </div >
            <Footer />
        </div >
    );
}