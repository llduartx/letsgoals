import React from 'react';
import Plot from 'react-plotly.js';

const GraficoMeta = ( {atual, total}) => {
  // Definição dos valores
  const metaTotal = total;
  const contribuido = atual;
  const falta = metaTotal - contribuido; // Calcula automatico: 500

  return (
    <div className='flex w-full h-6'>
      <Plot 
        data={[
          // Parte 1: O que já foi feito (Base da pilha)
          {
            x: [contribuido], // O nome da coluna deve ser IGUAL nos dois objetos
            y: ['Minha Meta'],
            name: 'Contribuído',
            type: 'bar',
            marker: { color: '#4F46E5'
             }, // Verde
            orientation: 'h',
            textposition: 'none',
          },
          // Parte 2: O que falta (Topo da pilha)
          {
            x: [falta], 
            y: ['Minha Meta'],
            type: 'bar',
            orientation: 'h',
            textposition: 'none',
            marker: { color: '#6B7280' }, // Cinza claro
            hoverinfo: 'none',
          },
        ]}
        layout={{
            barmode: 'stack', // <--- ISSO É O MAIS IMPORTANTE: Empilha as barras
            showlegend: false,
            autosize: true,
            bargap: 0,
            margin: { l: 0, r: 0, t: 0, b: 0 },
            paper_bgcolor: 'rgba(0,0,0,0)', 
          plot_bgcolor: 'rgba(0,0,0,0)',
          xaxis: {
            visible:false,
            range: [0, metaTotal > 0 ? metaTotal : 1], // Um pouco de espaço extra acima do 2000
            fixedrange: true,  
        },
          yaxis:{
            visible:false,
            fixedrange:true,
            showticklabels: false
          },    
        }}
        useResizeHandler={true}
        config={{ displayModeBar: false}}
         style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default GraficoMeta;