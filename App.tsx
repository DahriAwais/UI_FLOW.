import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Generator } from './components/Generator';
import { Project } from './types';

function App() {
  const [history, setHistory] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNewProject = () => {
    setCurrentProject(null);
  };

  return (
    <div className="flex h-screen w-screen bg-[#020202] text-white font-sans overflow-hidden selection:bg-brand-500/30">
      <Sidebar 
        history={history} 
        onSelectScreen={setCurrentProject} 
        onNewProject={handleNewProject}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <Generator 
        history={history}
        setHistory={setHistory}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
    </div>
  );
}

export default App;