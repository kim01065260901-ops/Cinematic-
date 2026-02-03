
export interface StoryboardScene {
  id: string;
  order: number;
  shotType: string;
  description: string;
  visualPrompt: string;
  imageUrl?: string;
  isGenerating: boolean;
  error?: string;
}

export interface ScriptAnalysis {
  globalContext: string;
  scenes: Omit<StoryboardScene, 'imageUrl' | 'isGenerating'>[];
}
