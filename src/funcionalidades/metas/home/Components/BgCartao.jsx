import BotaoBrancoLongo from "../../../../components/Botoes/BotaoBrancoLongo";
import FormatarReais from "../../../../components/Layout/FormatarReais";
import GraficoRosca from "../../../metas/home/Components/BarPie";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../context/usuarioContext";

export default function BgCartao() {
  const { usuarioLogado } = useAuth();
  
  // CORREÇÃO 1: O primeiro item é o valor (contribuidoTotal), o segundo é a função (set...)
  const [contribuidoTotal, setContribuidoTotal] = useState(0); 

  const [chartValues, setChartValues] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);

  useEffect(() => {
    if (usuarioLogado) {
      fetch(`http://localhost:3000/contribuicoes?usuarioId=${usuarioLogado.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao buscar contribuições");
          }
          return response.json();
        })
        .then((data) => {
          // TOTAL GERAL
          const totalGeral = data.reduce((acc, item) => acc + item.valor, 0);
          setContribuidoTotal(totalGeral);

          // LÓGICA DO GRÁFICO
          const dadosAgrupados = data.reduce((acc, item) => {
            const id = item.metaId;
            if (!acc[id]) {
              acc[id] = 0;
            }
            acc[id] += item.valor;
            return acc;
          }, {});

          const valores = Object.values(dadosAgrupados);
          const labels = Object.keys(dadosAgrupados).map((id) => `Meta ${id}`);

          setChartValues(valores);
          setChartLabels(labels);
        })
        .catch((error) => {
          console.error("Erro ao buscar contribuições:", error);
        });
    }
  }, [usuarioLogado]);

  const usuario = usuarioLogado?.nomeUsuario || "Usuário";

  const coresDoGrafico = ["#FBBF24", "#FFFFFF", "#F87171", "#C084FC", "#60A5FA"];

  return (
    <div className="m-3 p-3 rounded-2xl h-60 bg-gradient-verde text-branco flex flex-col items-center justify-around gap-4">
      
      {/* INICIO DO CONTAINER FLEX (Lado a Lado) */}
      <div className="card__container flex justify-center md:gap-16 items-center w-full px-4">
        
        {/* LADO ESQUERDO: Textos */}
        <div className="card__infos flex-col text-center md:text-left">
          <h3 className="text-xl mt-2 mb-6 font-medium">Bem-vind@ {usuario}!</h3>
          <div>
            <h4 className="text-sm opacity-90">Você já contribuiu</h4>
            <h4 className="text-3xl font-bold mt-1">
              {/* CORREÇÃO 2: Usando a variável correta do state */}
              <FormatarReais valor={contribuidoTotal} />
            </h4>
          </div>
        </div>

        {/* LADO DIREITO: Gráfico (No lugar da caixa cinza antiga) */}
        <div className="flex justify-center items-center w-32 h-32">
          {chartValues.length > 0 ? (
            <GraficoRosca
              valores={chartValues}
              labels={chartLabels}
              cores={coresDoGrafico}
            />
          ) : (
            // Fallback visual (círculo vazio) se não tiver dados
            <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center text-xs opacity-50 text-center">
              Sem contribuições
            </div>
          )}
        </div>

      </div> 
      {/* FIM DO CONTAINER FLEX */}

      <BotaoBrancoLongo texto="Bora criar uma Meta" link="/criarmeta" />
    </div>
  );
}