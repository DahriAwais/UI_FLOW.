import React, { useState, useRef, useEffect } from 'react';
import { DeviceType, Project, Message } from '../types';
import { DeviceFrame } from './DeviceFrame';
import { FlowArrow } from './FlowArrow';
import { Sparkles, Smartphone, Figma, ZoomIn, ZoomOut, Loader2, Send, BrainCircuit, PanelLeft, PanelLeftOpen, Paperclip, Wand2, ArrowRight } from 'lucide-react';
import { generateAppDesign, iterateAppDesign } from '../services/geminiService';

interface GeneratorProps {
  history: Project[];
  setHistory: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProject: Project | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<Project | null>>;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Generator: React.FC<GeneratorProps> = ({ history, setHistory, currentProject, setCurrentProject, isSidebarOpen, toggleSidebar }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(DeviceType.IOS);
  const [zoom, setZoom] = useState(0.65);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Panning State
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [prompt]);

  // Scroll chat to bottom
  useEffect(() => {
      if (chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [currentProject?.messages, isGenerating]);

  // Sync selected device with project
  useEffect(() => {
      if (currentProject?.deviceType) {
          setSelectedDevice(currentProject.deviceType);
      }
  }, [currentProject]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setLoadingStage('Analyzing requirements...');
    
    try {
      if (currentProject) {
          // Iteration Mode
          const userMsg: Message = {
              id: crypto.randomUUID(),
              role: 'user',
              type: 'text',
              content: prompt,
              timestamp: Date.now()
          };
          
          const updatedProjectBeforeAI = {
              ...currentProject,
              messages: [...currentProject.messages, userMsg]
          };
          setCurrentProject(updatedProjectBeforeAI);
          setHistory(prev => prev.map(p => p.id === currentProject.id ? updatedProjectBeforeAI : p));
          setPrompt('');

          const { newScreens, messages } = await iterateAppDesign(currentProject, prompt);
          
          const finalProject = {
              ...updatedProjectBeforeAI,
              screens: [...updatedProjectBeforeAI.screens, ...newScreens],
              messages: [...updatedProjectBeforeAI.messages, ...messages]
          };
          
          setCurrentProject(finalProject);
          setHistory(prev => prev.map(p => p.id === currentProject.id ? finalProject : p));

      } else {
          // New Project Mode
          setTimeout(() => setLoadingStage('Architecting user flow...'), 1200);
          setTimeout(() => setLoadingStage('Generating high-fidelity screens...'), 2500);
          setTimeout(() => setLoadingStage('Finalizing details...'), 5000);
          
          const newProject = await generateAppDesign(prompt, selectedDevice);
          setHistory(prev => [newProject, ...prev]);
          setCurrentProject(newProject);
          setPrompt('');
      }
      
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate design");
    } finally {
      setIsGenerating(false);
      setLoadingStage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleExportFigma = () => {
      if (!currentProject) return;
      setIsExporting(true);
      setTimeout(() => {
          setIsExporting(false);
          const element = document.createElement("a");
          const file = new Blob([JSON.stringify(currentProject, null, 2)], {type: 'application/json'});
          element.href = URL.createObjectURL(file);
          element.download = `uiflow-export-${currentProject.id.slice(0, 8)}.json`;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
      }, 2000);
  };

  // --- Panning Handlers ---
  const onMouseDown = (e: React.MouseEvent) => {
      if (!canvasRef.current || !currentProject) return;
      setIsDragging(true);
      setStartX(e.pageX - canvasRef.current.offsetLeft);
      setStartY(e.pageY - canvasRef.current.offsetTop);
      setScrollLeft(canvasRef.current.scrollLeft);
      setScrollTop(canvasRef.current.scrollTop);
  };

  const onMouseLeave = () => {
      setIsDragging(false);
  };

  const onMouseUp = () => {
      setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !canvasRef.current) return;
      e.preventDefault();
      const x = e.pageX - canvasRef.current.offsetLeft;
      const y = e.pageY - canvasRef.current.offsetTop;
      const walkX = (x - startX) * 1.5;
      const walkY = (y - startY) * 1.5;
      canvasRef.current.scrollLeft = scrollLeft - walkX;
      canvasRef.current.scrollTop = scrollTop - walkY;
  };

  const suggestions = [
      "DeFi Wallet",
      "SaaS Dashboard",
      "Fitness Tracker",
      "AI Chat Interface"
  ];

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300 ${currentProject ? 'bg-[#050505]' : 'bg-[#080808]'}`}>
        
        {/* Sleek Landing Background */}
        {!currentProject && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 {/* Modern Gradient Mesh */}
                <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-neutral-900/50 via-neutral-950/20 to-transparent"></div>
                <div className="absolute bottom-0 inset-x-0 h-[400px] bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                {/* Architectural Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>
            </div>
        )}

        {/* Top Navigation Bar */}
        <header className="h-20 flex items-center justify-between px-8 z-20 shrink-0 bg-transparent">
            <div className="flex items-center gap-4">
               <button onClick={toggleSidebar} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                   {isSidebarOpen ? <PanelLeft size={20} /> : <PanelLeftOpen size={20} />}
               </button>
               {currentProject && (
                 <div className="flex items-center gap-3 animate-fade-in">
                    <div className="h-6 w-px bg-white/10"></div>
                    <span className="text-white/90 font-medium truncate max-w-[300px] text-sm tracking-wide">
                        {currentProject.prompt}
                    </span>
                 </div>
               )}
            </div>
            
            <div className="flex items-center gap-6">
                 {/* Device Toggles */}
                 <div className="flex bg-[#111] rounded-lg p-1 border border-white/5 shadow-sm">
                     <button 
                        onClick={() => setSelectedDevice(DeviceType.IOS)}
                        className={`p-2 rounded-md transition-all duration-300 ${selectedDevice === DeviceType.IOS ? 'bg-[#252525] text-white shadow-sm ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        title="iPhone (iOS)"
                     >
                        <Smartphone size={16} />
                     </button>
                     <button 
                        onClick={() => setSelectedDevice(DeviceType.ANDROID)}
                        className={`p-2 rounded-md transition-all duration-300 ${selectedDevice === DeviceType.ANDROID ? 'bg-[#252525] text-white shadow-sm ring-1 ring-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        title="Android"
                     >
                         <div className="flex items-center justify-center w-[16px] h-[16px] border-[1.5px] border-current rounded-[3px] scale-90"></div>
                     </button>
                 </div>
                 
                 <button 
                    className="flex items-center gap-2 px-4 py-2 text-[11px] font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                    onClick={handleExportFigma}
                    disabled={!currentProject}
                 >
                    <Figma size={13} className="group-hover:text-purple-400 transition-colors" />
                    <span>Export</span>
                 </button>
            </div>
        </header>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden relative z-10">
            
            <main className="flex-1 overflow-hidden relative flex flex-col">
                {/* Subtle Grid - Only visible when zooming/panning canvas */}
                <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none ${currentProject ? 'opacity-100' : 'opacity-0'}`}></div>
                
                {/* Floating Canvas Controls */}
                <div className="absolute bottom-8 left-8 flex items-center gap-2 bg-[#121212]/80 backdrop-blur-xl border border-white/10 p-1.5 rounded-xl z-30 shadow-2xl">
                    <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ZoomOut size={16} /></button>
                    <div className="w-12 text-center text-xs text-gray-300 font-medium">{Math.round(zoom * 100)}%</div>
                    <button onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ZoomIn size={16} /></button>
                </div>

                <div 
                    ref={canvasRef}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    className={`relative w-full h-full overflow-auto custom-scrollbar flex bg-transparent ${currentProject ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                    {currentProject ? (
                        <div 
                            className="flex items-center p-32 min-w-max min-h-max mx-auto my-auto"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                        >
                            {currentProject.screens.map((screen, index) => (
                            <React.Fragment key={screen.id}>
                                <div className="flex flex-col items-center group relative">
                                    <div className="absolute -top-24 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <div className="text-white/90 text-xl font-medium px-6 py-3 rounded-2xl bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-[10px] font-bold text-black shadow-[0_0_10px_rgba(56,189,248,0.5)]">{index + 1}</span>
                                            {screen.name}
                                        </div>
                                    </div>

                                    <div className="relative hover:scale-[1.015] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                                        <DeviceFrame type={selectedDevice}>
                                            <img 
                                                src={screen.imageUrl} 
                                                alt={screen.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </DeviceFrame>
                                    </div>
                                </div>
                                
                                {index < currentProject.screens.length - 1 && (
                                    <FlowArrow />
                                )}
                            </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        // --- MODERN SLEEK LANDING HERO ---
                        <div className="flex flex-col items-center justify-center w-full h-full p-6 select-none relative z-40">
                            {isGenerating ? (
                                <div className="flex flex-col items-center gap-8 animate-fade-in">
                                    <div className="relative w-24 h-24">
                                        <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_2s_ease-out_infinite]"></div>
                                        <div className="absolute inset-2 rounded-full border-t border-white animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                           <Sparkles className="text-white fill-white" size={24} />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-light text-white tracking-tight">{loadingStage}</h3>
                                        <p className="text-gray-500 text-xs tracking-[0.2em] uppercase">Generating Interface</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full max-w-5xl flex flex-col items-center relative z-10">
                                    
                                    <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-gray-300 tracking-[0.15em] uppercase animate-fade-in backdrop-blur-md">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span>System Online v2.1</span>
                                    </div>
                                    
                                    <h1 className="text-5xl md:text-8xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 mb-6 tracking-tight leading-[1.05] animate-fade-in drop-shadow-sm">
                                        Design at the <br/> Speed of Thought.
                                    </h1>
                                    
                                    <p className="text-gray-400 text-lg text-center max-w-lg mb-12 leading-relaxed font-light animate-fade-in animation-delay-500 tracking-wide">
                                        Create high-fidelity mobile interfaces instantly with our advanced generative engine.
                                    </p>

                                    {/* MODERN SLEEK INPUT BOX - WIDER */}
                                    <div className="w-full max-w-3xl relative group animate-fade-in animation-delay-500">
                                        {/* Outer Glow on Hover */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                                        
                                        <div className="relative bg-[#111] rounded-[32px] p-1.5 ring-1 ring-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] focus-within:ring-white/20 focus-within:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all duration-300">
                                            <div className="flex items-center bg-black/40 rounded-[28px] pl-6 pr-2 py-2">
                                                <textarea
                                                    ref={textareaRef}
                                                    value={prompt}
                                                    onChange={(e) => setPrompt(e.target.value)}
                                                    onKeyDown={handleKeyDown}
                                                    placeholder="Describe your app idea..."
                                                    className="w-full bg-transparent border-0 text-white placeholder-gray-600 focus:ring-0 resize-none py-3 text-lg font-light leading-relaxed outline-none min-h-[56px] max-h-[120px]"
                                                    rows={1}
                                                />
                                                <button
                                                    onClick={handleGenerate}
                                                    disabled={!prompt.trim()}
                                                    className={`h-12 px-6 rounded-full flex items-center gap-2 transition-all duration-300 font-medium text-sm shrink-0 ${
                                                        prompt.trim() 
                                                        ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transform hover:scale-105' 
                                                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <span>Generate</span>
                                                    <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Suggestions Pills */}
                                    <div className="mt-8 flex flex-wrap justify-center gap-2 animate-fade-in animation-delay-700">
                                        {suggestions.map(s => (
                                            <button 
                                                key={s} 
                                                onClick={() => setPrompt(s)}
                                                className="text-[11px] text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors border border-white/5 hover:border-white/10"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="mt-8 text-red-300 text-sm bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/20 backdrop-blur-md shadow-lg flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                            {error}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Chat Sidebar (Floating Glass Panel) */}
            {(currentProject || (isGenerating && !currentProject)) && (
                <div className="w-[380px] h-full flex flex-col z-20 transition-all duration-300 glass-panel border-l border-white/5 bg-[#0a0a0a]">
                    {/* Header */}
                    <div className="h-20 flex items-center px-6 shrink-0 border-b border-white/5 justify-between">
                         <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white ring-1 ring-white/10">
                                <Wand2 size={18} />
                             </div>
                             <div>
                                 <span className="font-semibold text-white text-sm block">Design Assistant</span>
                                 <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Gemini 2.0 Flash</span>
                             </div>
                         </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                        {currentProject?.messages.map((msg) => (
                             <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                 <div className={`flex gap-3 max-w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                     {msg.role === 'ai' && (
                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/5 ${msg.type === 'analysis' ? 'bg-purple-500/10 text-purple-400' : 'bg-white/5 text-white'}`}>
                                             {msg.type === 'analysis' ? <BrainCircuit size={14} /> : <Sparkles size={14} />}
                                         </div>
                                     )}
                                     <div className={`rounded-2xl p-4 text-sm leading-relaxed border shadow-sm ${
                                         msg.role === 'user' 
                                         ? 'bg-white text-black border-white rounded-tr-sm' 
                                         : msg.type === 'analysis'
                                            ? 'bg-[#151515] text-gray-400 border-white/5 font-mono text-xs'
                                            : 'bg-[#1a1a1a] text-gray-200 border-white/10 rounded-tl-sm'
                                     }`}>
                                         {msg.type === 'analysis' && <div className="text-[10px] uppercase font-bold text-purple-400 mb-2 tracking-widest flex items-center gap-1.5 opacity-80">Thinking Process</div>}
                                         {msg.content}
                                     </div>
                                 </div>
                             </div>
                        ))}
                        
                        {isGenerating && (
                            <div className="flex gap-4 items-center pl-2 opacity-50">
                                <Loader2 size={16} className="animate-spin text-white" />
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Generating...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-5 border-t border-white/5 bg-black/20">
                         <div className="relative w-full group">
                            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-white/10 to-gray-500/10 opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm pointer-events-none"></div>
                            
                            <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-lg flex flex-col transition-colors">
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isGenerating}
                                    placeholder="Make changes..."
                                    className="w-full bg-transparent border-0 text-white placeholder-gray-600 focus:ring-0 resize-none py-3 px-4 max-h-[150px] text-sm leading-relaxed outline-none"
                                    rows={1}
                                    style={{ minHeight: '52px' }}
                                />
                                <div className="flex items-center justify-between px-2 pb-2 mt-1">
                                     <div className="flex items-center gap-1">
                                          <button disabled={isGenerating} className="p-2 text-gray-600 hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Paperclip size={14} /></button>
                                     </div>
                                     <button
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !prompt.trim()}
                                        className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                            isGenerating || !prompt.trim()
                                            ? 'text-white hover:bg-white/10'
                                            : 'text-gray-600'
                                        }`}
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* Export Overlay */}
        {isExporting && (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-white">Preparing Export</h3>
                        <p className="text-gray-500 text-sm">Packaging assets for Figma...</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};