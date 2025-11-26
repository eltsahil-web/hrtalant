
import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Settings, 
  Sparkles,
  LogOut
} from 'lucide-react';
import { ViewState, User } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  candidateCount: number;
  user: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  candidateCount,
  user,
  onLogout
}) => {
  // Navigation handler
  const handleNavigation = (view: ViewState) => {
    onChangeView(view);
  };

  const NavItem = ({ view, icon: Icon, label, count }: { view: ViewState, icon: any, label: string, count?: number }) => (
    <button
      onClick={() => handleNavigation(view)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} className={currentView === view ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
        <span className="font-medium text-sm whitespace-nowrap">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          currentView === view ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* Sidebar Container - Always visible */}
      <div 
        className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-sm"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 rounded-lg p-2">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="overflow-hidden">
              <span className="block text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 leading-tight whitespace-nowrap">
                EduTalent
              </span>
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">HR Platform</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Menu</div>
          
          <NavItem 
            view="dashboard" 
            icon={LayoutDashboard} 
            label="Candidates" 
            count={candidateCount}
          />
          
          <NavItem 
            view="upload" 
            icon={PlusCircle} 
            label="New Evaluation" 
          />

          <NavItem 
            view="team" 
            icon={Users} 
            label="Team Members" 
          />

          <NavItem 
            view="settings" 
            icon={Settings} 
            label="Settings" 
          />
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-slate-300 transition-colors">
            {user.avatarUrl ? (
               <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                {user.name.charAt(0)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            
            <button 
              onClick={onLogout}
              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
