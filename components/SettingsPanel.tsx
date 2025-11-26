import React, { useState } from 'react';
import { 
  Save, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { DEFAULT_RUBRIC, DEFAULT_DEMO_RUBRIC } from '../services/geminiService';

interface SettingsPanelProps {
  currentPrompt: string;
  currentDemoRubric: string;
  onSaveSettings: (prompt: string, demoRubric: string) => void;
  onResetSettings: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  currentPrompt, 
  currentDemoRubric,
  onSaveSettings,
  onResetSettings 
}) => {
  const [promptText, setPromptText] = useState(currentPrompt);
  const [demoRubricText, setDemoRubricText] = useState(currentDemoRubric);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveSettings(promptText, demoRubricText);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all rubrics to default?")) {
      setPromptText(DEFAULT_RUBRIC);
      setDemoRubricText(DEFAULT_DEMO_RUBRIC);
      onResetSettings();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure AI evaluation criteria and system behavior.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start gap-4 bg-slate-50/50">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mt-1">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Evaluation Rubrics</h3>
            <p className="text-sm text-slate-500 mt-1">
              Customize how Gemini evaluates candidates. You can edit the general system instructions and the specific rubric used for Demo Lessons.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
           
           {/* Section 1: General Prompt */}
           <div>
             <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">General System Instruction</h4>
                <div className="h-px bg-slate-200 flex-1"></div>
             </div>
             <p className="text-xs text-slate-500 mb-3">
               This is the core personality and instruction set for the AI. It handles the CV analysis and Interview behavior.
             </p>
             <textarea
               value={promptText}
               onChange={(e) => setPromptText(e.target.value)}
               className="w-full h-64 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm leading-relaxed outline-none resize-y"
               placeholder="Enter your custom system instruction here..."
             />
             <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                <AlertTriangle size={14} />
                <span>
                  The "Candidate Context" (Name, Subject, Gender) is automatically appended to this prompt.
                </span>
             </div>
           </div>

           {/* Section 2: Demo Rubric */}
           <div>
             <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <BookOpen size={16} />
                  Demo Lesson Specifics
                </h4>
                <div className="h-px bg-slate-200 flex-1"></div>
             </div>
             <p className="text-xs text-slate-500 mb-3">
               These criteria are appended to the prompt ONLY when a demo lesson file is uploaded. Use this to define specific pedagogical standards.
             </p>
             <textarea
               value={demoRubricText}
               onChange={(e) => setDemoRubricText(e.target.value)}
               className="w-full h-48 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm leading-relaxed outline-none resize-y"
               placeholder="Enter your demo lesson rubric here..."
             />
           </div>

        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <RotateCcw size={16} />
            Reset Defaults
          </button>

          <button 
            onClick={handleSave}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all
              ${isSaved 
                ? 'bg-green-600 text-white shadow-green-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }
            `}
          >
            {isSaved ? (
              <>
                <CheckCircle2 size={18} />
                Saved!
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};