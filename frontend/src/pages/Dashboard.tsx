import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard, Settings, LogOut, Users, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('classes');

  const handleCreateSession = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const teacherId = userStr ? JSON.parse(userStr)._id : 'guest-teacher';

      const res = await fetch('http://localhost:5000/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacherId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      navigate(`/teacher-session/${data.sessionCode}`);
    } catch (error) {
       console.error("Failed to create session", error);
       alert("Failed to create session. Ensure the backend is running and USE_MOCK_DB is enabled if you don't have MongoDB.");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3 text-indigo-600 font-bold text-xl tracking-tight">
           <BookOpen className="w-6 h-6" />
           Vi-SlideS
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'classes' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Active Classes
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'students' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5" />
            Students
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="h-20 border-b border-gray-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-10 transition-all">
          <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-sm">
              TD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl w-full flex-1">
          {activeTab === 'classes' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-medium text-gray-900">Your Sessions</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your active and upcoming classes</p>
                </div>
                <button 
                  onClick={handleCreateSession}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  New Session
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-gray-500 min-h-[300px] col-span-full hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 border border-gray-200 shadow-sm">
                    <LayoutDashboard className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active sessions</h3>
                  <p className="text-sm max-w-xs mb-6 leading-relaxed">Create a new session to generate a unique join code for your students and begin the class.</p>
                  <button 
                    onClick={handleCreateSession}
                    className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 group"
                  >
                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> Create your first session
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-2xl mx-auto shadow-sm">
               <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
               <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Management</h2>
               <p className="text-gray-500 leading-relaxed mb-8">
                 In Sprint 4, you will be able to manage your student roster, track individual participation levels, and view personalized AI-generated progress reports.
               </p>
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100 italic">
                 Coming in Sprint 4: Analytics & Polish
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
               <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden text-left">
                  <div className="p-6 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                           <ShieldCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                           <div className="font-semibold text-gray-900">Mock Mode Active</div>
                           <div className="text-sm text-gray-500">You are currently running in development without MongoDB</div>
                        </div>
                     </div>
                     <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md uppercase tracking-tight italic border border-emerald-200">Enabled</span>
                  </div>
                  <div className="p-6 opacity-50 cursor-not-allowed">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                           <Settings className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                           <div className="font-semibold text-gray-900">Advanced AI Configurations</div>
                           <div className="text-sm text-gray-500 disabled">Adjust thresholds for AI triage complexity and suggested responses</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
