
export enum EvaluationStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface CandidateMetadata {
  firstName: string;
  lastName: string;
  gender: string;
  subject: string;
}

export type Role = 'Admin' | 'Recruiter' | 'Viewer' | 'Observer';

export interface ManualFeedback {
  id: string;
  authorName: string;
  authorId: string;
  role: Role;
  note: string;
  decision: 'Recommended' | 'Not Recommended' | 'Neutral';
  date: string;
}

export interface EvaluationResult {
  id: string;
  date: string;
  // Metadata fields
  candidateName: string; // Combined from metadata or AI
  firstName?: string;
  lastName?: string;
  gender?: string;
  subject?: string;
  
  // Scores
  matchScore: number;
  pedagogicalRating: number;
  communicationRating: number;
  emotionalIntelligence: number;
  
  // Text analysis
  summary: string;
  strengths: string[];
  weaknesses: string[];
  interviewHighlights: string;
  
  // New specific analysis fields
  toneAnalysis: string;
  appearanceAnalysis: string; // "N/A" if audio only
  
  recommendation: string; // AI Recommendation

  // Human Feedback
  manualFeedback: ManualFeedback[];
}

export interface UploadedFile {
  file: File;
  type: 'cv' | 'demo' | 'interview';
  previewUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Pending' | 'Invited' | 'Inactive';
  joinedDate: string;
  avatarUrl?: string;
}

export type ViewState = 'dashboard' | 'upload' | 'detail' | 'team' | 'settings';