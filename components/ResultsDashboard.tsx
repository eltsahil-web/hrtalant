import React, { useState } from 'react';
import { EvaluationResult, ManualFeedback, User } from '../types';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer
} from 'recharts';
import { 
  User as UserIcon, 
  Award, 
  Brain, 
  ThumbsUp, 
  AlertTriangle,
  Mic,
  BookOpen,
  Video,
  Activity,
  Briefcase,
  MessageSquare,
  Send,
  UserCircle,
  History,
  Clock
} from 'lucide-react';

interface ResultsDashboardProps {
  data: EvaluationResult;
  currentUser: User;
  onAddFeedback: (note: string, decision: ManualFeedback['decision']) => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  data, 
  currentUser,
  onAddFeedback 
}) => {
  const [newNote, setNewNote] = useState('');
  const [decision, setDecision] = useState<ManualFeedback['decision']>('Neutral');

  const radarData = [
    { subject: 'Pedagogy', A: data.pedagogicalRating, fullMark: 100 },
    { subject: 'Communication', A: data.communicationRating, fullMark: 100 },
    { subject: 'Emotional Intel', A: data.emotionalIntelligence, fullMark: 100 },
    { subject: 'Overall Match', A: data.matchScore, fullMark: 100 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRecColor = (rec: string) => {
    const r = rec.toLowerCase();
    if (r.includes('strongly hire') || r.includes('hire')) return 'bg-emerald-600 text-white shadow-emerald-200';
    if (r.includes('second') || r.includes('maybe')) return 'bg-amber-500 text-white shadow-amber-200';
    return 'bg-rose-500 text-white shadow-rose-200';
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddFeedback(newNote, decision);
      setNewNote('');
      setDecision('Neutral');
    }
  };

  // Sort feedback newest first
  const sortedFeedback = [...data.manualFeedback].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200">
            <UserIcon size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{data.candidateName}</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
              {data.subject && (
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Briefcase size={12} />
                  {data.subject}
                </span>
              )}
              {data.gender && (
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                   {data.gender}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className={`px-6 py-3 rounded-full font-bold shadow-lg text-sm uppercase tracking-wide flex items-center gap-2 ${getRecColor(data.recommendation)}`}>
          <Award size={18} />
          {data.recommendation}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Score Card - Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <Brain size={20} className="text-blue-500" />
              Competency Matrix
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={data.candidateName}
                    dataKey="A"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border text-center ${getScoreColor(data.pedagogicalRating)}`}>
                <div className="text-2xl font-bold">{data.pedagogicalRating}</div>
                <div className="text-xs uppercase font-semibold opacity-75">Pedagogy</div>
              </div>
              <div className={`p-3 rounded-lg border text-center ${getScoreColor(data.matchScore)}`}>
                <div className="text-2xl font-bold">{data.matchScore}</div>
                <div className="text-xs uppercase font-semibold opacity-75">Match Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Details - Right Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Executive Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen size={20} className="text-indigo-500" />
              Executive Summary
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {data.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <ThumbsUp size={20} className="text-emerald-500" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {data.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-rose-500" />
                Areas for Growth
              </h3>
              <ul className="space-y-2">
                {data.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Behavioral & Non-Verbal Analysis */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg text-white">
             <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                <Activity size={24} className="text-blue-400" />
                <h3 className="text-xl font-semibold">Behavioral & Non-Verbal Analysis</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <h4 className="flex items-center gap-2 text-sm font-bold text-blue-300 mb-2 uppercase tracking-wide">
                      <Mic size={16} />
                      Tone & Voice (NLP)
                   </h4>
                   <p className="text-slate-300 text-sm leading-relaxed">
                     {data.toneAnalysis}
                   </p>
                </div>

                <div>
                   <h4 className="flex items-center gap-2 text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">
                      <Video size={16} />
                      Appearance & Body Language
                   </h4>
                   <p className="text-slate-300 text-sm leading-relaxed">
                     {data.appearanceAnalysis}
                   </p>
                </div>
             </div>

             <div className="mt-6 pt-4 border-t border-slate-700">
               <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase">Interview Highlights</h4>
                <p className="text-slate-300 text-sm italic">
                  "{data.interviewHighlights}"
                </p>
             </div>
             
             <div className="mt-6 flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>EQ Score</span>
                        <span>{data.emotionalIntelligence}/100</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-400 rounded-full" 
                            style={{ width: `${data.emotionalIntelligence}%` }}
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Communication</span>
                        <span>{data.communicationRating}/100</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-purple-400 rounded-full" 
                            style={{ width: `${data.communicationRating}%` }}
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* Evaluation History Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <History size={20} className="text-blue-500" />
                Evaluation History
              </h3>
              <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-full shadow-sm">
                {sortedFeedback.length} {sortedFeedback.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            <div className="p-6">
              {/* Add new note form */}
              <form onSubmit={handleSubmitFeedback} className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8">
                 <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                   <MessageSquare size={16} className="text-slate-500" />
                   Add New Observation
                 </h4>
                 <textarea
                   value={newNote}
                   onChange={(e) => setNewNote(e.target.value)}
                   placeholder="Write your observation notes about the candidate..."
                   className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-3 min-h-[80px] bg-white"
                   required
                 />
                 
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-600 mr-2">Decision:</label>
                      <select 
                        value={decision}
                        // @ts-ignore
                        onChange={(e) => setDecision(e.target.value)}
                        className="text-sm border border-slate-300 rounded-lg px-2 py-1.5 bg-white outline-none focus:border-blue-500"
                      >
                        <option value="Neutral">Neutral</option>
                        <option value="Recommended">Recommended</option>
                        <option value="Not Recommended">Not Recommended</option>
                      </select>
                    </div>
                    <button 
                      type="submit"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
                    >
                      <Send size={14} />
                      Log Entry
                    </button>
                 </div>
              </form>

              {/* Timeline History */}
              {sortedFeedback.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                  {sortedFeedback.map((fb) => (
                    <div key={fb.id} className="relative flex gap-6 group">
                      {/* Timeline Dot */}
                      <div className="absolute left-0 ml-5 -translate-x-1/2 mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-500 transition-colors shadow-sm ring-4 ring-white"></div>
                      
                      <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-white shadow-sm">
                               {fb.authorName.charAt(0)}
                             </div>
                             <div>
                               <div className="flex items-center gap-2">
                                  <span className="font-semibold text-slate-900 text-sm">{fb.authorName}</span>
                                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-medium uppercase tracking-wide">{fb.role}</span>
                               </div>
                               <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                  <Clock size={10} />
                                  {new Date(fb.date).toLocaleDateString()} at {new Date(fb.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </div>
                             </div>
                          </div>
                          
                          <div className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${
                            fb.decision === 'Recommended' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            fb.decision === 'Not Recommended' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {fb.decision === 'Recommended' && <ThumbsUp size={12} />}
                            {fb.decision === 'Not Recommended' && <AlertTriangle size={12} />}
                            {fb.decision}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed pl-10">
                          {fb.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-slate-50 p-4 rounded-full inline-flex mb-3">
                    <History size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm italic">No history logged yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};