import React, { useState, useEffect } from 'react';
import { FiCopy, FiZap, FiEdit2, FiFilter, FiClock, FiColumns, FiPause, FiPlay } from 'react-icons/fi';
import InvocationsTable from '../components/invocations/InvocationsTable';
import InvocationsLayout from '../components/invocations/InvocationsLayout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInvocationsFromLMP } from '../hooks/useBackend';

const Traces = () => {
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();


  // TODO Unify invocation search behaviour with the LMP page.
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  const { data: invocations , isLoading } = useInvocationsFromLMP(null, null, currentPage, pageSize);
  

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const invocationId = searchParams.get('i');
    if (invocationId && invocations) {
      const selectedInvocation = invocations.find(inv => inv.id === invocationId);
      if (selectedInvocation) {
        setSelectedTrace(selectedInvocation);
      }
    }
  }, [location.search, invocations]);

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  const handleSelectTrace = (trace) => {
    setSelectedTrace(trace);
    navigate(`?i=${trace.id}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (

      <InvocationsLayout 
        selectedTrace={selectedTrace} 
      setSelectedTrace={setSelectedTrace}
      showSidebar={true}
      containerClass={'p-6'}
      >
      <div className="flex items-center mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Personal</span>
          <span>&gt;</span>
          <span>Projects</span>
          <span>&gt;</span>
          <div className="flex items-center space-x-1">
            <FiCopy className="text-blue-400" />
            <span className="text-white">default</span>
          </div>
        </div>
        <span className="ml-auto px-2 py-1 text-xs bg-[#1c2128] text-blue-400 rounded">DEVELOPER</span>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white flex items-center">
          <FiCopy className="mr-2 text-blue-400" />
          default
        </h1>
        <div className="flex items-center space-x-2">
          <FiCopy className="text-gray-400" />
          <span className="text-gray-400">ID</span>
          <div className="flex items-center bg-[#1c2128] rounded px-2 py-1">
            <span className="mr-2">Data Retention</span>
            <select className="bg-transparent text-white">
              <option>14d</option>
            </select>
          </div>
          <button className="flex items-center px-3 py-1.5 bg-[#1c2128] text-sm rounded hover:bg-gray-700">
            <FiZap className="mr-1" />
            Add Rule
          </button>
          <button className="flex items-center px-3 py-1.5 bg-[#1c2128] text-sm rounded hover:bg-gray-700">
            <FiEdit2 className="mr-1" />
            Edit
          </button>
        </div>
      </div>
      <div className="flex space-x-6 mb-6 border-b border-gray-800">
        <button className="text-blue-400 font-medium pb-4 border-b-2 border-blue-400">Runs</button>
        <button className="text-gray-400 hover:text-white pb-4">Threads</button>
        <button className="text-gray-400 hover:text-white pb-4">Monitor</button>
        <button className="text-gray-400 hover:text-white pb-4">Setup</button>
      </div>
      <div className="flex items-center space-x-2 mb-6">
        <button className="flex items-center px-2 py-1 bg-[#1c2128] text-xs rounded hover:bg-gray-700">
          <FiFilter className="mr-1" />
          1 filter
        </button>
        <button className="flex items-center px-2 py-1 bg-[#1c2128] text-xs rounded hover:bg-gray-700">
          <FiClock className="mr-1" />
          Last 7 days
        </button>
        <button className="px-2 py-1 bg-[#1c2128] text-xs rounded hover:bg-gray-700">Root Runs</button>
        <button className="px-2 py-1 bg-[#1c2128] text-xs rounded hover:bg-gray-700">LLM Calls</button>
        <button className="px-2 py-1 bg-[#1c2128] text-xs rounded hover:bg-gray-700">All Runs</button>
        <button
          className={`flex items-center px-2 py-1 ${isPolling ? 'bg-blue-600' : 'bg-[#1c2128]'} text-xs rounded hover:bg-gray-700`}
          onClick={togglePolling}
        >
          {isPolling ? <FiPause className="mr-1" /> : <FiPlay className="mr-1" />}
          {isPolling ? 'Pause Updates' : 'Resume Updates'}
        </button>
        <button className="ml-auto flex items-center px-2 py-1 bg-[#1c2128] text-xs rounded hover:bg-gray-700">
          <FiColumns className="mr-1" />
          Columns
        </button>
      </div>
      <InvocationsTable 
        invocations={invocations} 
        currentPage={currentPage}
        expandAll={true}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        onSelectTrace={handleSelectTrace} 
        currentlySelectedTrace={selectedTrace}
      />
      
    </InvocationsLayout>
  );
};

export default Traces;