
import React, { useState, useCallback, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { StoryboardScene } from './types';
import StoryboardFrame from './components/StoryboardFrame';
import LoadingSpinner from './components/LoadingSpinner';

const DEFAULT_SCRIPT = `EXT. HIGHLANDS - DAY
A lone traveler stands on a jagged peak. The wind howls. 

CLOSE UP
The traveler's eyes narrow as they spot something on the horizon.

WIDE SHOT
A massive floating citadel emerges from the clouds, blotting out the sun.

LOW ANGLE
The traveler grips their sword hilt. They are ready.`;

const App: React.FC = () => {
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [globalContext, setGlobalContext] = useState('');
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const generateSingleFrame = async (sceneId: string, currentScenes: StoryboardScene[], context: string) => {
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isGenerating: true, error: undefined } : s));
    
    const targetScene = currentScenes.find(s => s.id === sceneId);
    if (!targetScene) return;

    try {
      const imageUrl = await geminiService.generateFrame(targetScene.visualPrompt, context);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, imageUrl, isGenerating: false } : s));
    } catch (err) {
      console.error(err);
      setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, isGenerating: false, error: 'Failed to generate frame.' } : s));
    }
  };

  const handleGenerateStoryboard = async () => {
    if (!script.trim()) return;

    setIsAnalyzing(true);
    setScenes([]);
    
    try {
      const analysis = await geminiService.analyzeScript(script);
      setGlobalContext(analysis.globalContext);
      
      const initializedScenes: StoryboardScene[] = analysis.scenes.map(s => ({
        ...s,
        isGenerating: true,
      }));
      
      setScenes(initializedScenes);
      setIsAnalyzing(false);

      // Scroll to grid
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Generate images in sequence to manage load
      for (const scene of initializedScenes) {
        await generateSingleFrame(scene.id, initializedScenes, analysis.globalContext);
      }
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      alert("Error analyzing script. Please try again.");
    }
  };

  const handleRegenerate = (id: string) => {
    generateSingleFrame(id, scenes, globalContext);
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-amber-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <h1 className="font-serif text-xl font-semibold tracking-tight text-white">Cinematic Storyboard AI</h1>
        </div>
        <div className="hidden md:block">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Powered by Gemini 3</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-serif text-white">Visualize your story.</h2>
              <p className="text-gray-400 font-light">Enter your script beats below and watch them come to life in cinematic realism.</p>
            </div>

            <div className="relative group">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste your script here... (e.g. EXT. FOREST - NIGHT...)"
                className="w-full h-80 bg-[#121212] border border-white/10 rounded-2xl p-6 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all resize-none font-mono text-sm leading-relaxed"
              />
              <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Script Pad</div>
            </div>

            <button
              onClick={handleGenerateStoryboard}
              disabled={isAnalyzing || !script.trim()}
              className="w-full bg-white hover:bg-amber-500 text-black font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl shadow-amber-500/10"
            >
              {isAnalyzing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Analyzing Script...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V4.33a5.5 5.5 0 014.223 4.223h2.333a1 1 0 110 2h-2.333a5.5 5.5 0 01-4.223 4.223v2.333a1 1 0 11-2 0v-2.333a5.5 5.5 0 01-4.223-4.223H3.667a1 1 0 110-2h2.333a5.5 5.5 0 014.223-4.223V1.997a1 1 0 01.95-1.047zM10 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" clipRule="evenodd" />
                  </svg>
                  <span>Generate Storyboard</span>
                </>
              )}
            </button>

            {globalContext && !isAnalyzing && (
              <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Visual Style & Continuity</h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed italic">{globalContext}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7" ref={scrollRef}>
            {scenes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scenes.map((scene) => (
                  <StoryboardFrame 
                    key={scene.id} 
                    scene={scene} 
                    onRegenerate={handleRegenerate} 
                  />
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-40">
                <div className="w-16 h-16 mb-6 rounded-full border border-white/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-serif text-white mb-2">Director's Board Empty</h3>
                <p className="text-sm text-gray-500 font-light max-w-xs mx-auto">Input your script to the left to generate cinematic frames and visualize your vision.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center px-6">
        <p className="text-gray-600 text-[11px] uppercase tracking-widest">
          Cinematic Realism • High Fidelity • Dramatic Lighting
        </p>
      </footer>
    </div>
  );
};

export default App;
