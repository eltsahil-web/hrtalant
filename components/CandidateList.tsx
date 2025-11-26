import React, { useState } from 'react';
import { EvaluationResult } from '../types';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar,
  MoreHorizontal,
  TrendingUp,
  UserCheck,
  Award
} from 'lucide-react';

interface CandidateListProps {
  candidates: EvaluationResult[];
  onSelectCandidate: (candidate: EvaluationResult) => void;
  onNewEvaluation: () => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({ 
  candidates, 
  onSelectCandidate,
  onNewEvaluation
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCandidates = candidates.filter(c => 
    c.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.recommendation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getRecommendationBadge = (rec: string) => {
    const r = rec.toLowerCase();
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    
    if (r.includes('strongly hire')) colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    else if (r.includes('hire')) colorClass = 'bg-green-100 text-green-800 border-green-200';
    else if (r.includes('second') || r.includes('maybe')) colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
    else if (r.includes('no') || r.includes('reject')) colorClass = 'bg-rose-100 text-rose-800 border-rose-200';

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {rec}
      </span>
    );
  };

  // Stats
  const averageScore = candidates.length > 0 
    ? Math.round(candidates.reduce((acc, c) => acc + c.matchScore, 0) / candidates.length) 
    : 0;
  
  const hiredCount = candidates.filter(c => 
    c.recommendation.toLowerCase().includes('hire')
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <UserCheck size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Candidates</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{candidates.length}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Hireable Profile</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{hiredCount}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-medium text-slate-500">Average Match</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{averageScore}%</div>
        </div>
      </div>

      {/* Main List Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800">Candidate Pool</h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Table/List */}
        <div className="overflow-x-auto flex-1">
          {filteredCandidates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">No candidates found</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                {candidates.length === 0 
                  ? "Get started by uploading your first candidate evaluation." 
                  : "Try adjusting your search terms."}
              </p>
              {candidates.length === 0 && (
                <button 
                  onClick={onNewEvaluation}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Start New Evaluation
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Scores</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidates.map((candidate) => (
                  <tr 
                    key={candidate.id} 
                    onClick={() => onSelectCandidate(candidate)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold flex items-center justify-center">
                          {candidate.candidateName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{candidate.candidateName}</div>
                          <div className="text-xs text-slate-500">K12 Education Applicant</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRecommendationBadge(candidate.recommendation)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded-md text-sm font-bold border ${getScoreColor(candidate.matchScore)}`}>
                          {candidate.matchScore}
                        </div>
                        <div className="flex flex-col gap-0.5 text-xs text-slate-400">
                            <span>Pedagogy: {candidate.pedagogicalRating}</span>
                            <span>Comm: {candidate.communicationRating}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} />
                        {new Date(candidate.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Footer pagination (Visual only) */}
        {filteredCandidates.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
                <span>Showing {filteredCandidates.length} results</span>
                <div className="flex gap-2">
                    <button disabled className="px-3 py-1 rounded border bg-white disabled:opacity-50">Previous</button>
                    <button disabled className="px-3 py-1 rounded border bg-white disabled:opacity-50">Next</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};