import { useNavigate } from 'react-router-dom';
import { BookOpen, Presentation, User } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-3xl relative z-10 text-center mb-16 mt-[-40px]">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30 rotate-3 transform cursor-pointer border border-blue-500/40">
          <BookOpen className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">Vi-SlideS</h1>
        <p className="text-xl text-slate-400 font-medium">Choose your role to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
        <button 
          onClick={() => navigate('/teacher-login')}
          className="group bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-10 rounded-[32px] shadow-2xl hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300 text-left flex flex-col w-full relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300 relative z-10">
            <Presentation className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
          </div>
          <h2 className="text-3xl font-bold mb-3 relative z-10">Teacher</h2>
          <p className="text-slate-400 flex-1 leading-relaxed relative z-10 text-lg">Create live sessions, present interactive slides, and manage real-time student Q&A.</p>
        </button>

        <button 
          onClick={() => navigate('/student-login')}
          className="group bg-slate-800/80 backdrop-blur-xl border border-slate-700 p-10 rounded-[32px] shadow-2xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 text-left flex flex-col w-full relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300 relative z-10">
            <User className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300" />
          </div>
          <h2 className="text-3xl font-bold mb-3 relative z-10">Student</h2>
          <p className="text-slate-400 flex-1 leading-relaxed relative z-10 text-lg">Join active classes, view slides in real-time, and ask anonymous questions instantly.</p>
        </button>
      </div>
    </div>
  );
}
