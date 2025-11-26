
import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2,
  AlertCircle,
  ArrowLeft,
  User as UserIcon,
  Book,
  FileText,
  Video,
  Mic,
  Presentation
} from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Sidebar } from './components/Sidebar';
import { CandidateList } from './components/CandidateList';
import { LoginScreen } from './components/LoginScreen';
import { TeamManagement } from './components/TeamManagement';
import { SettingsPanel } from './components/SettingsPanel';
import { ChatBot } from './components/ChatBot';
import { evaluateCandidate, DEFAULT_RUBRIC, DEFAULT_DEMO_RUBRIC } from './services/geminiService';
import { 
  EvaluationStatus, 
  EvaluationResult, 
  ViewState, 
  User, 
  CandidateMetadata,
  TeamMember,
  ManualFeedback
} from './types';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, formatBytes, generateId } from './utils';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [candidates, setCandidates] = useState<EvaluationResult[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<EvaluationResult | null>(null);

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Principal', email: 'sarah.p@edutalent.ai', role: 'Admin', status: 'Active', joinedDate: '2023-09-15', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: '2', name: 'John HR', email: 'john.hr@edutalent.ai', role: 'Recruiter', status: 'Active', joinedDate: '2023-10-01', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  ]);

  // Settings State
  const [customPrompt, setCustomPrompt] = useState<string>(DEFAULT_RUBRIC);
  const [customDemoRubric, setCustomDemoRubric] = useState<string>(DEFAULT_DEMO_RUBRIC);

  // Form State
  const [metadata, setMetadata] = useState<CandidateMetadata>({
    firstName: '',
    lastName: '',
    gender: '',
    subject: ''
  });

  // Upload Form State
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [demoFile, setDemoFile] = useState<File | null>(null);
  const [interviewFile, setInterviewFile] = useState<File | null>(null);
  const [status, setStatus] = useState<EvaluationStatus>(EvaluationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    // Mock user data for demonstration
    const mockUser: User = {
      id: '123',
      name: 'Sarah Principal',
      email: 'sarah.p@edutalent.ai',
      role: 'Admin', // Default to admin for demo
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    };
    setUser(mockUser);
  };

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
    setSelectedCandidate(null);
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const validateAndSetFile = (file: File, setter: (f: File) => void) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please upload a smaller file.`);
      return;
    }
    setter(file);
    setError(null);
  };

  const handleEvaluate = async () => {
    if (!cvFile) {
      setError("Please upload a CV/Resume at minimum.");
      return;
    }
    if (!metadata.firstName || !metadata.lastName || !metadata.subject) {
      setError("Please fill in the candidate information fields.");
      return;
    }
    
    // Check total payload size
    const totalSize = cvFile.size + (demoFile?.size || 0) + (interviewFile?.size || 0);
    // Increased limit for total request body to approx 300MB based on user request for 100MB per file
    if (totalSize > 300 * 1024 * 1024) { 
      setError(`Total upload size (${formatBytes(totalSize)}) is too large. Please ensure combined files are under 300MB.`);
      return;
    }

    setStatus(EvaluationStatus.ANALYZING);
    setError(null);
    
    try {
      const result = await evaluateCandidate(
        cvFile, 
        demoFile, 
        interviewFile, 
        metadata,
        customPrompt, // Pass the custom rubric from settings
        customDemoRubric // Pass the custom demo rubric
      );
      
      // Enhance result with ID and date
      const newCandidate: EvaluationResult = {
        ...result,
        id: generateId(),
        date: new Date().toISOString(),
        manualFeedback: [] // Initialize empty
      };

      setCandidates(prev => [newCandidate, ...prev]);
      setSelectedCandidate(newCandidate);
      setStatus(EvaluationStatus.SUCCESS);
      setView('detail');
      
      // Reset form
      setCvFile(null);
      setDemoFile(null);
      setInterviewFile(null);
      setMetadata({ firstName: '', lastName: '', gender: '', subject: '' });

    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Analysis failed. Please try again.";
      setError(errorMessage);
      setStatus(EvaluationStatus.ERROR);
    }
  };

  const handleAddFeedback = (note: string, decision: ManualFeedback['decision']) => {
    if (!selectedCandidate || !user) return;

    const newFeedback: ManualFeedback = {
      id: generateId(),
      authorName: user.name,
      authorId: user.id,
      role: user.role,
      note: note,
      decision: decision,
      date: new Date().toISOString()
    };

    // Update the selected candidate state
    const updatedCandidate = {
      ...selectedCandidate,
      manualFeedback: [...selectedCandidate.manualFeedback, newFeedback]
    };

    // Update in the list
    setCandidates(prev => prev.map(c => c.id === updatedCandidate.id ? updatedCandidate : c));
    setSelectedCandidate(updatedCandidate);
  };

  const handleSelectCandidate = (candidate: EvaluationResult) => {
    setSelectedCandidate(candidate);
    setView('detail');
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setSelectedCandidate(null);
  };

  const handleAddMember = (member: Omit<TeamMember, 'id' | 'joinedDate' | 'status'>) => {
    const newMember: TeamMember = {
      ...member,
      id: generateId(),
      joinedDate: new Date().toISOString(),
      status: 'Invited'
    };
    setTeamMembers([...teamMembers, newMember]);
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    // If the logged-in user updates themselves, update the user state too
    if (user && user.id === updatedMember.id) { // In a real app check ID properly, here mocking ID
       // Assuming Sarah is ID 1 for this logic demo
       if (updatedMember.name === user.name) {
          setUser({ ...user, avatarUrl: updatedMember.avatarUrl });
       }
    }
  };

  const handleDeleteMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <CandidateList 
            candidates={candidates}
            onSelectCandidate={handleSelectCandidate}
            onNewEvaluation={() => setView('upload')}
          />
        );

      case 'team':
        return (
          <TeamManagement 
            members={teamMembers}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        );

      case 'settings':
        return (
          <SettingsPanel 
            currentPrompt={customPrompt}
            currentDemoRubric={customDemoRubric}
            onSaveSettings={(prompt, demoRubric) => {
              setCustomPrompt(prompt);
              setCustomDemoRubric(demoRubric);
            }}
            onResetSettings={() => {
              setCustomPrompt(DEFAULT_RUBRIC);
              setCustomDemoRubric(DEFAULT_DEMO_RUBRIC);
            }}
          />
        );

      case 'detail':
        if (!selectedCandidate || !user) return null;
        return (
          <div className="space-y-6">
            <button 
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors pl-1"
            >
              <ArrowLeft size={18} />
              Back to Candidates
            </button>
            <ResultsDashboard 
              data={selectedCandidate} 
              currentUser={user}
              onAddFeedback={handleAddFeedback}
            />
          </div>
        );

      case 'upload':
        return (
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">New Evaluation</h1>
              <p className="text-slate-500">Enter candidate details and upload materials for AI analysis.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              
              <div className="p-8 space-y-8">
                
                {/* 1. Candidate Info Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <UserIcon size={20} className="text-blue-500" />
                    Candidate Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={metadata.firstName}
                        onChange={handleMetadataChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        placeholder="e.g. Jane"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Surname</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={metadata.lastName}
                        onChange={handleMetadataChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                        placeholder="e.g. Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                      <select 
                        name="gender"
                        value={metadata.gender}
                        onChange={handleMetadataChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Teaching Subject</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          name="subject"
                          value={metadata.subject}
                          onChange={handleMetadataChange}
                          className="w-full px-4 py-2.5 pl-10 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                          placeholder="e.g. Mathematics"
                        />
                        <Book size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2"></div>

                {/* 2. Uploads */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <FileText size={20} className="text-blue-500" />
                    Application Materials
                  </h3>
                  
                  <div className="bg-blue-50 text-blue-800 text-xs px-4 py-2 rounded-lg border border-blue-100 mb-2 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Note: Maximum file size is {MAX_FILE_SIZE_MB}MB per file.
                  </div>

                  <FileUpload 
                    label="Curriculum Vitae (CV)" 
                    subLabel="PDF or Text files"
                    accept=".pdf,.txt,.rtf"
                    file={cvFile}
                    onFileSelect={(f) => validateAndSetFile(f, setCvFile)}
                    onClear={() => setCvFile(null)}
                    icon={<FileText size={32} />}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                    {/* Demo Lesson */}
                    <FileUpload 
                      label="Demo Lesson Material" 
                      subLabel="PDF, Images, or Text"
                      accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
                      file={demoFile}
                      onFileSelect={(f) => validateAndSetFile(f, setDemoFile)}
                      onClear={() => setDemoFile(null)}
                      icon={<Presentation size={32} />}
                    />

                    {/* Interview Audio/Video */}
                    <FileUpload 
                      label="Interview Recording" 
                      subLabel="Audio (MP3, WAV) or Video (MP4, MOV)"
                      accept="audio/*,video/*"
                      file={interviewFile}
                      onFileSelect={(f) => validateAndSetFile(f, setInterviewFile)}
                      onClear={() => setInterviewFile(null)}
                      icon={<Mic size={32} />}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                 <div className="hidden sm:block">
                     <p className="text-xs text-slate-400 font-medium">AI Analysis Includes:</p>
                     <div className="flex gap-4 mt-1">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Pedagogy</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Tone of Voice</span>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Body Language</span>
                     </div>
                 </div>
                 
                 <div className="flex gap-3 ml-auto">
                    <button
                      onClick={handleBackToDashboard}
                      className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEvaluate}
                      disabled={!cvFile || status === EvaluationStatus.ANALYZING}
                      className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all
                        ${!cvFile || status === EvaluationStatus.ANALYZING 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-0.5'
                        }
                      `}
                    >
                      {status === EvaluationStatus.ANALYZING ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Run Analysis
                        </>
                      )}
                    </button>
                 </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        candidateCount={candidates.length}
        user={user}
        onLogout={handleLogout}
      />
      
      {/* 
        Main Content Wrapper
        Added ml-64 to account for fixed sidebar width
      */}
      <main className="min-h-screen transition-all duration-300 ml-64">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {renderContent()}
        </div>
      </main>

      {/* Global ChatBot Widget */}
      <ChatBot />
    </div>
  );
}

export default App;