import React from 'react';
import Plot from 'react-plotly.js';

const GraficoRosca = ({ valores, cores }) => {
  
  // Paleta padrão
const coresPadrao = [
  '#064E3B', // Verde Profundo
  '#047857', // Verde Bandeira
  '#10B981', // Menta (Sua cor principal)
  '#6EE7B7', // Menta Claro
  '#D1FAE5', // Menta Pálido
];

  return (
    <div className="w-full h-full">
      <Plot
        data={[
          {
            values: valores,
            type: 'pie',
            hole: 0.6,
            
            marker: {
              colors: cores || coresPadrao,
            },

            // --- LIMPEZA TOTAL ---
            textinfo: 'none',  // Remove os números/porcentagens de dentro das fatias
            hoverinfo: 'none', // Remove o texto que aparece ao passar o mouse
          },
        ]}
        layout={{
          showlegend: false, // Remove a legenda lateral
          
          // Remove margens para ocupar 100% da div pai
          margin: { l: 0, r: 0, t: 0, b: 0 }, 
          
          // Fundo transparente
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          autosize: true,
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        // Remove a barra de ferramentas do topo
        config={{ displayModeBar: false, staticPlot: true }} 
      />
    </div>
  );
};

export default GraficoRosca;