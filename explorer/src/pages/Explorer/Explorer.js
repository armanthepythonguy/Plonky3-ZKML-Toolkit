import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, RefreshCw, Search, Upload, X } from 'lucide-react';
import '../../index.css';
import { useNavigate } from 'react-router';
import axios from 'axios';

const generateMockAgents = () => {
  const roles = [
    'Cognitive Analysis', 'Data Synthesis', 'Code Generation', 
    'Advanced Search', 'Creative Writing', 'Problem Solving'
  ];
  const statuses = ['Active', 'Pending', 'Completed', 'Idle'];
  
  const agentTypes = [
    { emoji: '🧠', type: 'Cognitive' },
    { emoji: '💻', type: 'Computational' },
    { emoji: '🔬', type: 'Analytical' }
  ];

  return Array.from({ length: 50 }, (_, i) => {
    const agentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
    return {
      id: `AI-${String(i + 1).padStart(3, '0')}`,
      name: `${roles[Math.floor(Math.random() * roles.length)]} Agent`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleString(),
      emoji: agentType.emoji,
      type: agentType.type,
      metadata: {}
    };
  });
};

const Explorer = () => {
  const [agents, setAgents] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [metadataFile, setMetadataFile] = useState(null);
  const navigate = useNavigate();

  const regenerateAgents = () => {
   getAgents();
  };

  const handleMetadataUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const uploadedMetadata = JSON.parse(e.target.result);
          setMetadataFile({
            name: file.name,
            metadata: uploadedMetadata
          });
          
          const updatedAgents = agents.map((agent, index) => ({
            ...agent,
            metadata: uploadedMetadata[index] || {}
          }));
          setAgents(updatedAgents);
        } catch (error) {
          console.error('Error parsing metadata file:', error);
          alert('Invalid metadata file. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const removeMetadataFile = () => {
    setMetadataFile(null);
   getAgents();
  };

 const getAgents=async()=>{
    try{
    const agentsList=await (await axios.get("http://localhost:3001/proofs")).data
    setAgents(agentsList);
    }
    catch{
        console.log("Axios error");
    }
 }

  useEffect(() => {
    getAgents();
  }, []);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  const getGraph=async(id)=>{
try{
const getAgentData= (await axios.get(`http://localhost:3001/agent/${id}`)).data;
navigate('/graph',{state:{agent:getAgentData}});
}
catch{
    console.log("Axios error");
}
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="main-wrap relative w-full h-[600px] max-w-4xl bg-neutral-900  bg-transparent rounded-2xl ">
        <div 
         className="absolute-gradient-border absolute inset-0 pointer-events-none z-0"
         style={{
            background: 'linear-gradient(90deg, #d500f9 0%, #2962ff  50%), linear-gradient(180deg, #2962ff  50%, #d500f9 100%)',
            borderRadius: '1rem',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            border: '4px solid transparent',
           padding: '1px',
         }}
        />
 <div className="scroll-wrap relative z-10 w-full h-full border-6 border-transparent rounded-2xl overflow-y-auto bg-transparent p-6"
 style={{margin: '1px'}} > 
 <div className="scroll-wrap relative z-10 w-full h-full overflow-y-auto bg-transparent"> 
        <div className=" p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Verified AI Explorer</h1>
          
          <div className="flex space-x-2">
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search agents..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-neutral-800 text-white px-3 py-2 rounded-md text-sm pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            </div>

            {/* Controls */}
            <label className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-md transition-colors cursor-pointer">
              <input 
                type="file" 
                accept=".json"
                className="hidden"
                onChange={handleMetadataUpload}
              />
              <Upload size={16} />
            </label>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-neutral-800 text-white px-2 py-2 rounded-md text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Idle">Idle</option>
            </select>
            
            <button 
              onClick={regenerateAgents}
              className="bg-neutral-800 hover:bg-neutral-700 text-white p-2 rounded-md"
              title="Regenerate Agents"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Agents List */}
        <div className="divide-y divide-neutral-700">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-neutral-900 text-neutral-300 font-semibold text-xs p-4">
            <div 
              className="col-span-2 cursor-pointer hover:text-white"
              onClick={() => handleSort('id')}
            >
              Proof ID <ArrowUpDown size={12} className="ml-1 inline" />
            </div>
            <div 
              className="col-span-3 cursor-pointer hover:text-white"
              onClick={() => handleSort('name')}
            >
              Agent ID <ArrowUpDown size={12} className="ml-1 inline" />
            </div>
            <div 
              className="col-span-2 cursor-pointer hover:text-white"
              onClick={() => handleSort('type')}
            >
              Type <ArrowUpDown size={12} className="ml-1 inline" />
            </div>
            <div className="col-span-3">Timestamp</div>
            <div 
              className="col-span-2 cursor-pointer hover:text-white"
              onClick={() => handleSort('status')}
            >
              Status <ArrowUpDown size={12} className="ml-1 inline" />
            </div>
          </div>

          {/* Agents List */}
          {agents && agents?.map((agent) => (
            <div 
              key={agent?.id} 
              className="grid grid-cols-12 items-center p-4 hover:bg-neutral-800"
              onClick={()=>getGraph(agent?.agentId)}
            >
              <div className="col-span-2 flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  {agent?.emoji}
                </div>
                <span className="text-white text-sm">{agent?._id.slice(-5)}</span>
              </div>
              <div className="col-span-3 text-white text-sm">{agent?.agentId.slice(-10)}</div>
              <div className="col-span-2 text-neutral-400 text-xs">on-chain</div>
              <div className="col-span-3 text-neutral-400 text-xs">{new Date(agent?.timestamp).toString()}</div>
              <div className="col-span-2">
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300`}
                >
                  Verified
                </span>
              </div>
            </div>
          ))}

          {/* No Results State */}
          {agents && agents?.length === 0 && (
            <div className="text-center py-10 text-neutral-500">
              No agents found matching your search or filters.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-900 border-t border-neutral-800 p-4 text-neutral-400 text-sm flex justify-between">
          <span>Total Agents: {agents?.length}</span>
          <span>AI Agent Management System</span>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Explorer;
