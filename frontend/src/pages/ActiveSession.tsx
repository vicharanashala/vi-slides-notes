import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Hand, ArrowLeft, Presentation, Share2, MessageSquare, ChevronRight, Sparkles, Pause, Play, StopCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Question {
  id: string;
  _id?: string;
  question: string;
  isAnonymous: boolean;
  timestamp: string;
  complexity?: number;
}

export default function ActiveSession() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [studentsJoined, setStudentsJoined] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  
  // Slide Management
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 10; // Simulated slide deck
  const [newQuestionNotif, setNewQuestionNotif] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<'active' | 'paused' | 'ended'>('active');

  useEffect(() => {
    if (code) {
      fetch(`http://localhost:5000/api/questions/${code}`)
        .then(res => res.json())
        .then(data => {
            const pending = data.filter((q: any) => q.status === 'pending');
            setQuestions(pending);
        })
        .catch(err => console.error('Failed to fetch questions:', err));
    }

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    if (code) {
        newSocket.emit('join_session', code);
    }

    newSocket.on('receive_question', (data: Question) => {
        setQuestions((prev) => {
           // Prevent duplicates if already in list
           if (prev.some(q => (q.id || q._id) === (data.id || data._id))) return prev;
           return [data, ...prev];
        });
        setNewQuestionNotif(true);
        setTimeout(() => setNewQuestionNotif(false), 3000); 
    });

    newSocket.on('member_count', (count: number) => {
        setStudentsJoined(Math.max(0, count - 1));
    });

    newSocket.on('ai_assist_result', (data) => {
        setReplyTexts(prev => ({ ...prev, [data.questionId]: data.answer }));
    });

    return () => {
        newSocket.disconnect();
    };
  }, [code]);

  const handleMarkAnswered = (questionId: string) => {
    setQuestions(prev => prev.filter((q: any) => (q.id || q._id) !== questionId));
  };

  const handleReplySubmit = (questionId: string) => {
    const reply = replyTexts[questionId];
    if (!reply || !reply.trim() || !socket) return;
    socket.emit('teacher_reply', {
        questionId,
        answer: reply,
        sessionCode: code
    });
    // Clear the reply input and remove from list
    setReplyTexts(prev => { const next = {...prev}; delete next[questionId]; return next; });
    handleMarkAnswered(questionId);
  };

  const handleAIAssist = (questionId: string) => {
      setReplyTexts(prev => ({ ...prev, [questionId]: "Generating AI Draft..." }));
      socket?.emit('request_ai_answer', { questionId });
  };

  const handleNextSlide = () => {
    if (currentSlide < totalSlides) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      socket?.emit('slide_update', { sessionCode: code, slideIndex: next });
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 1) {
      const prev = currentSlide - 1;
      setCurrentSlide(prev);
      socket?.emit('slide_update', { sessionCode: code, slideIndex: prev });
    }
  };

  const handleTogglePause = async () => {
    const newStatus = sessionStatus === 'active' ? 'paused' : 'active';
    try {
       await fetch(`http://localhost:5000/api/sessions/${code}/status`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status: newStatus })
       });
       setSessionStatus(newStatus);
       socket?.emit('session_status_change', { sessionCode: code, status: newStatus });
    } catch (e) {
       console.error("Failed to toggle pause", e);
    }
  };

  const handleEndSession = async () => {
    if(!window.confirm("Are you sure you want to end this session? Students will be disconnected.")) return;
    try {
       await fetch(`http://localhost:5000/api/sessions/${code}/status`, {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status: 'ended' })
       });
       setSessionStatus('ended');
       socket?.emit('session_status_change', { sessionCode: code, status: 'ended' });
       navigate(`/summary/${code}`);
    } catch (e) {
       console.error("Failed to end session", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-gray-900 font-sans">
      {/* Session Header */}
      <header className="h-20 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/teacher-dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-3 tracking-tight">
              <Presentation className="w-5 h-5 text-indigo-600" />
              Live Session
            </h1>
            <div className="flex items-center gap-2 mt-1 -ml-1">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-widest border ${sessionStatus === 'active' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-500 animate-pulse'}`}>
                {sessionStatus === 'active' ? 'Class Active' : 'Class Paused'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Join Code</span>
            <div className="bg-gray-50 px-4 py-1.5 rounded-lg flex items-center gap-3 border border-gray-200 shadow-inner">
              <span className="font-mono text-2xl font-bold tracking-widest text-indigo-600">{code}</span>
              <button className="text-gray-400 hover:text-indigo-600 transition-colors p-1" title="Copy link">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="h-10 w-px bg-gray-200"></div>

          <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-600">{studentsJoined} <span className="text-gray-500">Joined</span></span>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-6 h-10">
            <button 
                onClick={handleTogglePause} 
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-colors ${sessionStatus === 'active' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ring-2 ring-emerald-400 ring-offset-1'}`}
            >
               {sessionStatus === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
               {sessionStatus === 'active' ? 'Pause' : 'Resume'}
            </button>
            <button 
                onClick={handleEndSession} 
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
            >
               <StopCircle className="w-3.5 h-3.5" /> End Session
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slides View (Left) */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center border-r border-gray-200 bg-gray-100 relative">
           <div className="absolute top-6 left-6 flex items-center gap-2 text-gray-700 bg-white/80 px-3 py-1.5 rounded-lg backdrop-blur-md border border-gray-200 shadow-sm z-20">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-medium tracking-wide">Recording Live</span>
           </div>

           {/* New Question Notification */}
           {newQuestionNotif && (
             <div className="absolute top-6 right-6 flex items-center gap-3 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg animate-bounce z-20">
               <MessageSquare className="w-4 h-4" />
               <span className="text-xs font-bold uppercase tracking-wider">New Question Received</span>
             </div>
           )}

           {/* Real Slide View Container */}
           <div className="w-full max-w-5xl aspect-video bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col relative overflow-hidden group">
             {/* Slide Content Display */}
             <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white text-gray-800 p-12 transition-all">
               <span className="absolute top-4 left-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Vi-SlideS Deck v1.0</span>
               
               <div className="text-center">
                 <h3 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-900">
                   Interactive Presentation: Slide {currentSlide}
                 </h3>
                 <p className="text-gray-500 max-w-md mx-auto">
                   Real-time slide synchronization is active. Use navigation controls to broadcast updates.
                 </p>
               </div>
               
               {/* Visual Slide Indicator (Member 1 UI refinement) */}
               <div className="mt-8 flex gap-2">
                 {Array.from({ length: totalSlides }).map((_, i) => (
                   <div 
                    key={i} 
                    className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i + 1 === currentSlide ? 'bg-indigo-600 w-12' : 'bg-gray-200'}`} 
                   />
                 ))}
               </div>
             </div>

             {/* Slide Navigation Controls */}
             <div className="h-16 bg-white border-t border-gray-100 px-6 flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <button 
                  onClick={handlePrevSlide}
                  disabled={currentSlide === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                 >
                   <ArrowLeft className="w-5 h-5 text-gray-600" />
                 </button>
                 <span className="text-sm font-semibold text-gray-500 min-w-[80px] text-center">
                    Slide {currentSlide} <span className="text-gray-300 mx-1">/</span> {totalSlides}
                 </span>
                 <button 
                  onClick={handleNextSlide}
                  disabled={currentSlide === totalSlides}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                 >
                   <ChevronRight className="w-5 h-5 text-gray-600" />
                 </button>
               </div>

               <div className="flex items-center gap-2">
                 <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-indigo-600 uppercase tracking-widest px-3 py-2 rounded-lg transition-colors">
                   <Share2 className="w-3.5 h-3.5" />
                   Share Deck
                 </button>
               </div>
             </div>
           </div>
        </div>

        {/* Questions Sidebar (Right) */}
        <aside className="w-96 flex flex-col bg-white border-l border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Live Questions
            </h2>
            <div className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md border border-indigo-200">
              {questions.length} New
            </div>
          </div>
          
          <div className={`flex-1 p-6 flex flex-col items-center ${questions.length === 0 ? 'justify-center' : ''} text-center overflow-y-auto bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzQxNTUiLz48L3N2Zz4=')]`}>
            {questions.length === 0 ? (
              <div className="bg-white/80 p-6 rounded-2xl border border-gray-200 backdrop-blur-sm shadow-sm">
                <Hand className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                <p className="text-gray-900 font-medium mb-1">No questions yet</p>
                <p className="text-sm text-gray-500 max-w-[200px] leading-relaxed">Questions will appear here after passing AI triage.</p>
              </div>
            ) : (
              <div className="w-full space-y-4">
                {questions.map((q: any) => (
                  <div 
                    key={q.id || q._id} 
                    className={`bg-white border p-4 rounded-xl shadow-sm text-left transition-all border-l-4 ${
                      (q.complexity || 0) >= 4 ? 'border-l-red-500 ring-1 ring-red-50 ring-inset' : 
                      (q.complexity || 0) >= 3 ? 'border-l-amber-500' : 
                      'border-l-emerald-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${
                            (q.complexity || 0) >= 4 ? 'text-red-600' : 'text-indigo-600'
                         }`}>
                           {q.isAnonymous ? 'Anonymous' : 'Student'}
                         </span>
                         {(q.complexity || 0) >= 4 && (
                           <span className="animate-pulse flex items-center gap-1 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                               Critical
                           </span>
                         )}
                       </div>
                       <span className="text-xs text-gray-400">
                         {new Date(q.timestamp || q.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed font-medium">{q.question}</p>
                    
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-2">
                          <button 
                            onClick={() => handleAIAssist(q.id || q._id)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3" /> Auto-Draft AI Reply
                          </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Type reply..." 
                          value={replyTexts[q.id || q._id] || ''}
                          onChange={(e) => setReplyTexts(prev => ({ ...prev, [q.id || q._id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(q.id || q._id)}
                          className="flex-1 text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button 
                          onClick={() => handleReplySubmit(q.id || q._id)}
                          disabled={!replyTexts[q.id || q._id]?.trim()}
                          className="bg-indigo-600 text-white text-xs px-2 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 min-w-[50px] font-medium"
                        >
                          Reply
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                       <span className="text-[10px] text-gray-400">AI Complexity: <strong>{q.complexity}/10</strong></span>
                       <button 
                         onClick={() => handleMarkAnswered(q.id || q._id)}
                         className="text-[10px] font-bold text-gray-500 hover:text-gray-700 uppercase tracking-tighter"
                       >
                         Dismiss
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
