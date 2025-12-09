import React from 'react';
import { LayoutGrid, Clock, Settings, Plus, ChevronRight, Command, Layers, PanelLeftClose, FolderKanban } from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  history: Project[];
  onSelectScreen: (project: Project) => void;
  onNewProject: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ history, onSelectScreen, onNewProject, isOpen, onClose }) => {
  return (
    <>
        {/* Backdrop for mobile or just focus */}
        <div 
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            onClick={onClose}
        ></div>

        <div 
            className={`fixed top-0 left-0 h-full w-[280px] bg-[#080808] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
        <div className="p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={onNewProject}>
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-300">
                    <Command size={18} strokeWidth={3} />
                </div>
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">UI-FLOW</span>
                </div>
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                >
                    <PanelLeftClose size={18} />
                </button>
            </div>

            <button 
            onClick={() => { onNewProject(); onClose(); }}
            className="w-full bg-[#1c1c1c] hover:bg-white hover:text-black border border-white/10 hover:border-white text-gray-200 transition-all duration-300 py-3 px-4 rounded-xl font-medium flex items-center gap-3 justify-center mb-8 shadow-lg group"
            >
            <Plus size={18} className="group-hover:scale-110 transition-transform" />
            <span>New Project</span>
            </button>

            <nav className="space-y-1">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-3 flex items-center gap-2">
                <FolderKanban size={12} /> Library
            </div>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <LayoutGrid size={16} />
                <span>All Projects</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Clock size={16} />
                <span>Recent</span>
            </a>
            </nav>

            <div className="mt-8 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between px-3 mb-3">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Your Designs
                    </div>
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-400 border border-white/5">{history.length}</span>
                </div>
                
                <div className="space-y-1 overflow-y-auto custom-scrollbar pr-2 flex-1">
                    {history.length === 0 ? (
                        <div className="px-3 py-8 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                            <p className="text-xs text-gray-600">No projects yet.</p>
                        </div>
                    ) : (
                        history.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => { onSelectScreen(project); onClose(); }}
                                className="group w-full text-left flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] shrink-0 overflow-hidden relative flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors">
                                    {project.screens[0]?.imageUrl ? (
                                        <img src={project.screens[0].imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                                    ) : (
                                        <Layers size={14} className="text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="block truncate text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{project.prompt}</span>
                                    <span className="block text-[10px] text-gray-600 group-hover:text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-xs text-white font-bold border border-white/10 shadow-lg">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white group-hover:text-brand-200 transition-colors">John Doe</span>
                        <span className="text-[10px] text-gray-500">Pro Plan</span>
                    </div>
                    <Settings size={16} className="ml-auto text-gray-600 group-hover:text-white transition-colors" />
                </div>
            </div>
        </div>
        </div>
    </>
  );
};