import React from "react"; // Importing the React library
import { LineChart } from '@mui/x-charts/LineChart';
import { useLocation } from "react-router";

// Setting up the labels for the x-axis of the chart
const labels = ["January", "February", "March", "April", "May", "June"];

// Setting up the data for the chart, including the labels and datasets
const data = {
  labels: labels,
  datasets: [
    {
        label: 'Dataset 1',
        data: [12, 19, 3, 5, 2, 3, 15],
        borderColor: 'white',
       
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Dataset 2',
        data: [5, 10, 18, 12, 8, 15, 22],
        borderColor: 'yellow', // Different color for Dataset 2
      
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Dataset 3',
        data: [20,15, 10, 12, 18, 25, 20],
        borderColor: 'green', // Different color for Dataset 3
      
        fill: true,
        tension: 0.4,
      },
    ],
};
const borderPlugin = {
    id: 'borderPlugin',
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const { width, height } = chart.canvas;
      ctx.save();
      ctx.strokeStyle = 'blue'; // Border color
      ctx.lineWidth = 2; // Border width
      ctx.strokeRect(0, 0, width, height);
      ctx.restore();
    },
  };

const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white', // Legend text color
        },
      },
      title: {
        display: true,
        text: 'Line Chart with Background and Border',
        color: 'white', // Title color
      },
      borderPlugin, // Add the custom border plugin
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Light gray grid lines
        },
        ticks: {
          color: 'white', // X-axis tick labels color
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.2)', // Light gray grid lines
        },
        ticks: {
          color: 'white', // Y-axis tick labels color
        },
        beginAtZero: true,
      },
    },
    backgroundColor: 'black', // Chart background color
    borderRadius:'7.8px'
  };

  const dataset= [
    {
        label: 'Dataset 1',
        data: [12, 19, 3, 5, 2, 3, 15],
        borderColor: 'white',
        backgroundColor: 'rgba(255,255,255,0.3)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Dataset 2',
        data: [5, 10, 18, 12, 8, 15, 22],
        borderColor: 'yellow', // Different color for Dataset 2
        backgroundColor: 'rgba(255,255,0,0.3)', // Different color for Dataset 2
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Dataset 3',
        data: [20,15, 10, 12, 18, 25, 20],
        borderColor: 'green', // Different color for Dataset 3
        backgroundColor: 'rgba(0,255,0,0.3)', // Different color for Dataset 3
        fill: true,
        tension: 0.4,
      },
    ];

const getDataset = (agentDetails) => {
  let dataset= [
    {
        label: 'Actual',
        data: agentDetails.proofs.map(obj => obj.actual).reverse(),
        borderColor: 'white',
        backgroundColor: 'rgba(197,255,255,0.3)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Predicted',
        data: agentDetails.proofs.map(obj => obj.predicted).reverse(),
        borderColor: 'yellow', // Different color for Dataset 2
        backgroundColor: 'rgba(200,255,0,0.3)', // Different color for Dataset 2
        fill: true,
        tension: 0.4,
      }
    ];
    return dataset;
}

function formatToMMSS(timestamp) {
  // Create a Date object
  const date = new Date(timestamp);

  // Get minutes and seconds
  const minutes = date.getUTCMinutes(); // Use UTC to avoid timezone effects
  const seconds = date.getUTCSeconds();

  // Format with leading zeros
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Defining the LineChart component
const GraphList = () => {
    const location = useLocation();
  console.log('location', location);
  const agentDetails=location?.state?.agent;
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
    <div className="main-wrap w-[600px] h-[500px] relative p-0 bg-transparent rounded-2xl">
    <div 
         className="absolute-gradient-border absolute inset-0 pointer-events-none z-0"
         style={{
            background: 'linear-gradient(90deg, #d500f9 0%, #2962ff  50%), linear-gradient(180deg, #2962ff  50%, #d500f9 100%)',
            borderRadius: '1rem',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            border: '4px solid transparent',
            padding: '1px'
         }}
        />
 <div className="relative z-10 w-full h-full border-6 border-transparent flex items-center flex-col rounded-2xl overflow-hidden bg-transparent p-6"
 > 
 <div className="text-white">
  {console.log(agentDetails)}
    Agent ID: - {agentDetails.agent[0]._id}
 </div>
    <LineChart
      dataset={getDataset(agentDetails)}
      colors={['#7592f5']}
      grid={{ horizontal: true }}
        series={getDataset(agentDetails)}
        xAxis={[{ scaleType: 'band', data: agentDetails.proofs.map(obj => formatToMMSS(obj.timestamp)).reverse(),tickLabelPlacement:"start", categoryGapRatio: 0.02,tickLabelStyle:{fontSize:"12px",fill:"white"}}]}
        yAxis={[{valueFormatter: (value) =>{ if(value!==0){return`${(value).toLocaleString()}`}else{return value}},tickLabelStyle:{fontSize:"12px",fill:"white"}}]}
        height={250}
        tooltip={{trigger:'none'}}
        sx= {{
            backgroundColor: 'transparent',
            '& .MuiChartsAxis-root': {
              backgroundColor: 'transparent'
            },
            '& .MuiChartsLegend-root': {
              backgroundColor: 'transparent'
            }
          }}
        slotProps={{
            legend: {
              labelStyle: {
                fill: 'white'
              }
            }
          }}
    />
    <div className="text-white">
        Agent Description :- {agentDetails.agent[0].desc}
    </div>
    </div>
    </div>
    </div>
  );
};

export default GraphList;