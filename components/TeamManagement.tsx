
import React, { useState, useRef, useEffect } from 'react';
import { TeamMember, Role } from '../types';
import { fileToBase64 } from '../utils';
import { 
  Users, 
  UserPlus, 
  Mail, 
  MoreVertical, 
  Check, 
  Copy,
  Shield,
  Clock,
  Send,
  Camera,
  Upload,
  RefreshCcw,
  Edit,
  Trash2,
  Power,
  Ban
} from 'lucide-react';

interface TeamManagementProps {
  members: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id' | 'joinedDate' | 'status'>) => void;
  onUpdateMember: (member: TeamMember) => void;
  onDeleteMember: (id: string) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ members, onAddMember, onUpdateMember, onDeleteMember }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  const [inviteCode, setInviteCode] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  
  // Add Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Recruiter' as Role
  });

  // Edit Avatar State
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMember({
      name: formData.name,
      email: formData.email,
      role: formData.role
    });
    setShowAddModal(false);
    showNotification(`Invitation sent to ${formData.email}`);
    setFormData({ name: '', email: '', role: 'Recruiter' });
  };

  const generateInviteCode = () => {
    const code = 'EDU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    setShowInviteModal(true);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    showNotification("Code copied to clipboard!");
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setNewAvatar(member.avatarUrl || null);
    setActiveMenuId(null);
  };

  const handleActionClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleStatusChange = (member: TeamMember, newStatus: 'Active' | 'Inactive') => {
    onUpdateMember({ ...member, status: newStatus });
    showNotification(`User ${member.name} is now ${newStatus}`);
    setActiveMenuId(null);
  };

  const handleDelete = (member: TeamMember) => {
    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
      onDeleteMember(member.id);
      showNotification("Team member removed");
    }
    setActiveMenuId(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await fileToBase64(file);
        // Add data uri prefix for image display
        setNewAvatar(`data:${file.type};base64,${base64}`);
      } catch (err) {
        console.error("Failed to convert image", err);
        showNotification("Failed to process image");
      }
    }
  };

  const handleSelectPreset = (seed: string) => {
    setNewAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  const handleSaveProfile = () => {
    if (editingMember) {
      onUpdateMember({
        ...editingMember,
        avatarUrl: newAvatar || undefined
      });
      setEditingMember(null);
      showNotification("Profile updated successfully");
    }
  };

  const PRESET_SEEDS = ['Felix', 'Aneka', 'Zoe', 'Jack', 'Rocky', 'Ginger'];

  return (
    <div className="space-y-6 animate-fade-in-up relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[60] bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <Check size={18} className="text-emerald-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500 mt-1">Manage users, roles, and invitations.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateInviteCode}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <Mail size={18} />
            Invite with Code
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <UserPlus size={18} />
            Invite by Email
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-visible pb-24 lg:pb-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 overflow-hidden">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-700">
                    <Shield size={14} className="text-blue-500" />
                    {member.role}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    member.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : member.status === 'Inactive'
                      ? 'bg-slate-100 text-slate-500 border-slate-300'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(member.joinedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 relative">
                    <button 
                      onClick={() => handleEditClick(member)}
                      className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Profile"
                    >
                      <Edit size={18} />
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => handleActionClick(e, member.id)}
                        className={`p-2 rounded-lg transition-colors ${activeMenuId === member.id ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === member.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 border border-slate-100 overflow-hidden animate-fade-in origin-top-right">
                          <div className="py-1">
                            {member.status !== 'Active' && (
                              <button
                                onClick={() => handleStatusChange(member, 'Active')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Power size={16} className="text-emerald-500" />
                                Activate
                              </button>
                            )}
                            
                            {member.status !== 'Inactive' && (
                              <button
                                onClick={() => handleStatusChange(member, 'Inactive')}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Ban size={16} className="text-amber-500" />
                                Deactivate
                              </button>
                            )}
                            
                            <div className="border-t border-slate-100 my-1"></div>
                            
                            <button
                              onClick={() => handleDelete(member)}
                              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              Delete Member
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Profile Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
                <button 
                  onClick={() => setEditingMember(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="flex flex-col items-center mb-6">
                 <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="h-24 w-24 rounded-full border-4 border-slate-100 shadow-inner overflow-hidden mb-3 bg-slate-50">
                        {newAvatar ? (
                           <img src={newAvatar} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                            <Users size={32} />
                          </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Camera className="text-white" size={24} />
                    </div>
                 </div>
                 <h3 className="font-semibold text-slate-900">{editingMember.name}</h3>
                 <p className="text-sm text-slate-500">{editingMember.email}</p>
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   onChange={handleAvatarUpload} 
                   accept="image/*" 
                   className="hidden" 
                 />
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                    >
                       <Upload size={16} />
                       Upload Image
                    </button>
                    <button 
                       onClick={() => handleSelectPreset(editingMember.name)}
                       className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                    >
                       <RefreshCcw size={16} />
                       Randomize
                    </button>
                 </div>

                 <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Or choose a preset</p>
                    <div className="flex gap-3 justify-between overflow-x-auto pb-2">
                       {PRESET_SEEDS.map(seed => (
                         <button 
                           key={seed}
                           onClick={() => handleSelectPreset(seed)}
                           className="h-10 w-10 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ring-2 ring-transparent hover:ring-blue-500"
                         >
                           <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                              alt={seed}
                              className="h-full w-full rounded-full" 
                           />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-3 pt-2 mt-4">
                   <button 
                      onClick={() => setEditingMember(null)}
                      className="flex-1 px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                      onClick={handleSaveProfile}
                      className="flex-1 px-4 py-2.5 text-white bg-blue-600 font-medium hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-200"
                   >
                     Save Changes
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add Member / Email Invite Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Invite Team Member</h2>
            <p className="text-sm text-slate-500 mb-4">Send an email invitation to a new user.</p>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Alice Observer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="alice@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                  value={formData.role}
                  // @ts-ignore
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="Admin">Admin</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Observer">Observer</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.role === 'Observer' ? 'Observers can view candidates and add manual notes/feedback.' : 
                   formData.role === 'Admin' ? 'Admins have full access to settings and team management.' :
                   formData.role === 'Recruiter' ? 'Recruiters can run evaluations and manage candidates.' :
                   'Viewers can only see results.'}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Send size={16} />
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Code Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invitation Code</h2>
            <p className="text-sm text-slate-500 mb-6">
              Share this code with your team members to let them join your workspace.
            </p>
            
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <code className="text-lg font-mono font-bold text-slate-800">{inviteCode}</code>
              <button onClick={copyCode} className="text-slate-400 hover:text-blue-600 transition-colors" title="Copy Code">
                <Copy size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <a 
                href={`mailto:?subject=Join me on EduTalent&body=Here is your invitation code: ${inviteCode}`}
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Send via Email App
              </a>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="w-full px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};