
import React from 'react';
import { StoryboardScene } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface StoryboardFrameProps {
  scene: StoryboardScene;
  onRegenerate: (id: string) => void;
}

const StoryboardFrame: React.FC<StoryboardFrameProps> = ({ scene, onRegenerate }) => {
  return (
    <div className="group relative bg-[#121212] rounded-xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-300 hover:border-amber-500/30">
      <div className="aspect-video relative bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
        {scene.isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <LoadingSpinner size="md" label="Filming..." />
          </div>
        ) : null}

        {scene.imageUrl ? (
          <img 
            src={scene.imageUrl} 
            alt={scene.description} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="text-gray-600 italic text-sm p-8 text-center">
            {scene.error ? <span className="text-red-400">{scene.error}</span> : 'Waiting for production...'}
          </div>
        )}

        {scene.imageUrl && !scene.isGenerating && (
          <button 
            onClick={() => onRegenerate(scene.id)}
            className="absolute bottom-4 right-4 bg-black/80 hover:bg-amber-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            title="Reshoot"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase px-2 py-0.5 bg-amber-500/10 rounded">
            Scene {scene.order + 1}
          </span>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            {scene.shotType}
          </span>
        </div>
        <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed font-light italic">
          "{scene.description}"
        </p>
      </div>
    </div>
  );
};

export default StoryboardFrame;
