import React from 'react';
import { DeviceType } from '../types';

interface DeviceFrameProps {
  type: DeviceType;
  children: React.ReactNode;
  scale?: number;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ type, children, scale = 1 }) => {
  const scaleStyle = { transform: `scale(${scale})`, transformOrigin: 'top center' };

  if (type === DeviceType.IOS) {
    return (
      <div style={scaleStyle} className="relative transition-all duration-300 ease-out select-none">
        {/* Outer Frame (Titanium) */}
        <div className="relative mx-auto border-[#2a2a2a] bg-[#1a1a1a] border-[8px] rounded-[56px] h-[852px] w-[393px] shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden ring-1 ring-white/10 box-content z-10">
            {/* Inner Bezel (Black Border) */}
            <div className="absolute inset-0 border-[8px] border-black rounded-[48px] pointer-events-none z-20"></div>
            
            {/* Buttons */}
            <div className="absolute -left-[10px] top-[100px] h-[30px] w-[4px] bg-[#333] rounded-l-md shadow-lg"></div> {/* Mute */}
            <div className="absolute -left-[10px] top-[150px] h-[60px] w-[4px] bg-[#333] rounded-l-md shadow-lg"></div> {/* Vol Up */}
            <div className="absolute -left-[10px] top-[225px] h-[60px] w-[4px] bg-[#333] rounded-l-md shadow-lg"></div> {/* Vol Down */}
            <div className="absolute -right-[10px] top-[180px] h-[90px] w-[4px] bg-[#333] rounded-r-md shadow-lg"></div> {/* Power */}

            {/* Dynamic Island Area */}
            <div className="absolute top-[20px] left-1/2 transform -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-30 flex items-center justify-center pointer-events-none">
                <div className="w-[80px] h-[20px] bg-black rounded-full flex items-center justify-end pr-2">
                    <div className="w-2 h-2 rounded-full bg-[#1a1a1a]/80"></div>
                </div>
            </div>

            {/* Screen Content */}
            <div className="w-full h-full bg-black relative overflow-hidden rounded-[48px]">
                <div className="w-full h-full [&>img]:w-full [&>img]:h-full [&>img]:object-cover">
                    {children}
                </div>
                
                {/* Status Bar Overlay */}
                <div className="absolute top-0 w-full h-[58px] flex justify-between px-8 items-center z-20 mix-blend-difference text-white pointer-events-none">
                    <span className="text-[16px] font-semibold pl-4 tracking-tight">9:41</span>
                    <div className="flex gap-2 items-center pr-3">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M1 13v-2h4v2H1zm6 0v-4h4v4H7zm6 0v-6h4v6h-4zm6 0v-8h4v8h-4z"/></svg>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
                    </div>
                </div>
                
                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[130px] h-[5px] bg-white rounded-full z-20 pointer-events-none mix-blend-exclusion"></div>
            </div>
            
            {/* Sophisticated Reflection Overlay */}
            <div className="absolute inset-0 rounded-[56px] pointer-events-none z-40 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-40"></div>
            <div className="absolute inset-0 rounded-[56px] pointer-events-none z-40 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"></div>
        </div>
      </div>
    );
  }

  // Android / Generic
  return (
    <div style={scaleStyle} className="relative transition-all duration-300 ease-out select-none">
      <div className="relative mx-auto border-[#222] bg-[#121212] border-[4px] rounded-[36px] h-[860px] w-[400px] shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden ring-1 ring-white/10 box-content">
         {/* Buttons */}
         <div className="absolute -right-[6px] top-[200px] h-[60px] w-[3px] bg-[#333] rounded-r-md"></div>
         <div className="absolute -left-[6px] top-[150px] h-[80px] w-[3px] bg-[#333] rounded-l-md"></div>

         {/* Punch Hole */}
         <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black rounded-full z-30 ring-1 ring-gray-800"></div>

        <div className="w-full h-full bg-black relative overflow-hidden rounded-[32px]">
             {/* Image Container */}
            <div className="w-full h-full [&>img]:w-full [&>img]:h-full [&>img]:object-cover">
                {children}
            </div>
            
             <div className="absolute top-0 w-full h-[40px] flex justify-between px-6 items-center z-20 mix-blend-difference text-white pointer-events-none">
                <span className="text-xs font-medium">10:00</span>
                <div className="flex gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                </div>
            </div>
        </div>
        
        {/* Reflection */}
        <div className="absolute inset-0 rounded-[36px] pointer-events-none z-40 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-30"></div>
      </div>
    </div>
  );
};