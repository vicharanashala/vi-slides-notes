import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, MessageSquare, AlertCircle, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface QuestionData {
  _id: string;
  question: string;
  isAnonymous: boolean;
  status: string;
  aiSuggestedAnswer?: string;
  createdAt: string;
}

export default function StudentSession() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [escalatingIds, setEscalatingIds] = useState<Set<string>>(new Set());
  const [sessionStatus, setSessionStatus] = useState<'active' | 'paused' | 'ended'>('active');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/questions/${code}`);
        if (response.ok) {
          const data = await response.json();
          setQuestions(data);
        }
      } catch (err) {}
    };
    
    const fetchSessionInfo = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/sessions/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionCode: code })
        });
        if (response.ok) {
          const data = await response.json();
          setSessionStatus(data.status || 'active');
        }
      } catch (err) {}
    };

    fetchQuestions();
    fetchSessionInfo();

    const newSocket = io('http://localhost:5000', { reconnectionAttempts: 10, reconnectionDelay: 2000 });
    setSocket(newSocket);

    newSocket.on('connect', () => {
        setSocketStatus('connected');
        if (code) newSocket.emit('join_session', code);
    });

    newSocket.on('disconnect', () => setSocketStatus('disconnected'));
    newSocket.on('connect_error', () => setSocketStatus('error'));

    newSocket.on('slide_update', (data) => {
        setCurrentSlide(data.slideIndex);
    });

    newSocket.on('session_status_change', (data) => {
        setSessionStatus(data.status);
        if (data.status === 'ended') {
            navigate('/join-class');
        }
    });

    newSocket.on('receive_question', (data) => {
        const newQ: QuestionData = {
            _id: data.id, question: data.question, isAnonymous: data.isAnonymous, status: 'pending', createdAt: data.timestamp
        };
        setQuestions((prev) => {
            const existing = prev.find(q => q._id === data.id || q._id === data.tempId);
            if (existing) {
                return prev.map(q => (q._id === data.id || q._id === data.tempId) ? { ...q, status: 'pending', _id: data.id } : q);
            }
            return [newQ, ...prev];
        });
    });

    newSocket.on('auto_answer', (data) => {
        setQuestions((prev) => {
            const existing = prev.find(q => q._id === data.questionId || q._id === data.tempId);
            if (existing) {
                return prev.map(q => (q._id === data.questionId || q._id === data.tempId) ? { ...q, _id: data.questionId, status: 'answered_ai', aiSuggestedAnswer: data.answer } : q);
            }
            return [{
                _id: data.questionId, question: data.question, isAnonymous: false, status: 'answered_ai', aiSuggestedAnswer: data.answer, createdAt: new Date().toISOString()
            }, ...prev];
        });
        setStatusMsg('Your question was answered immediately by AI!');
        setTimeout(() => setStatusMsg(''), 5000);
    });

    newSocket.on('receive_teacher_reply', (data) => {
        setQuestions((prev) => {
            return prev.map(q => q._id === data.questionId ? { ...q, status: 'answered_teacher', aiSuggestedAnswer: data.answer } : q);
        });
        setStatusMsg('A teacher replied to a question!');
        setTimeout(() => setStatusMsg(''), 5000);
    });

    return () => { newSocket.disconnect(); };
  }, [code]);

  const handleLeave = () => navigate('/join-class');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Optimistic UI temporary question
    const tempId = `temp-${Date.now()}`;
    const newQ: QuestionData = {
        _id: tempId, question, isAnonymous, status: 'sending', createdAt: new Date().toISOString()
    };
    setQuestions(prev => [newQ, ...prev]);
    
    setSubmitting(true);
    try {
      if (socket && socket.connected && code) {
        socket.emit('send_question', { sessionCode: code, question, isAnonymous, tempId });
        setQuestion('');
        setStatusMsg('Question sent! AI is triaging...');
      }
    } catch (error) {
      // Revert optimistic
      setQuestions(prev => prev.filter(q => q._id !== tempId));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalate = (questionId: string) => {
      if (!socket || !socket.connected) return;
      socket.emit('escalate_question', { questionId });
      setEscalatingIds(prev => new Set(prev).add(questionId));
      setStatusMsg('Question escalated to your Live Teacher!');
      setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {socketStatus !== 'connected' && (
        <div className="bg-red-500 text-white px-4 py-2 flex items-center justify-center text-sm font-medium sticky top-0 z-50">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Cannot connect. Retrying...
        </div>
      )}

      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Live Session: {code}</span>
            </div>
            
            {/* Sync Indicator */}
            <div className="flex items-center bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
              <span className="text-sm font-bold text-indigo-900">Following Teacher • Slide {currentSlide}</span>
            </div>

            <button onClick={handleLeave} className="flex items-center text-sm font-medium text-red-500 hover:text-red-700">
              <LogOut className="h-5 w-5 mr-1" /> Leave Session
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-5 h-fit flex flex-col bg-white shadow rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ask a Question</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-md p-3 outline-none resize-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:opacity-75"
              placeholder={sessionStatus === 'paused' ? "Session paused..." : "Type your question here..."}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={sessionStatus === 'paused'}
              required
            />

            <div className="flex justify-between mt-4">
              <div className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                <label className="ml-2 text-sm text-gray-900">Anonymous</label>
              </div>
              <div className="flex justify-end mt-4 sm:mt-0">
                <button 
                  type="submit" 
                  disabled={submitting || sessionStatus === 'paused'}
                  className="bg-indigo-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : <><Send className="w-4 h-4 mr-2" /> Send</>}
                </button>
              </div>
            </div>

            {sessionStatus === 'paused' && (
              <div className="bg-amber-100 text-amber-800 p-3 rounded-lg text-sm text-center font-medium animate-pulse border border-amber-200 mt-4 shadow-sm">
                  Teacher has paused question submissions.
              </div>
            )}{statusMsg && (
              <div className="mt-4 p-3 text-sm rounded flex items-center shadow-sm bg-indigo-50 text-indigo-700 border border-indigo-200">
                <AlertCircle className="h-5 w-5 mr-2" /> <span>{statusMsg}</span>
              </div>
            )}
          </form>
        </div>

        <div className="lg:col-span-7 bg-white shadow rounded-lg p-6 h-[500px]">
          <h3 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Live Q&A History</h3>
          <div className="overflow-y-auto h-full pr-2 space-y-4">
            {questions.map((q) => (
              <div key={q._id} className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                 <div className="flex justify-between mb-2">
                   <span className="text-xs font-bold text-gray-600"><User className="inline h-3 w-3 mr-1"/>{q.isAnonymous ? 'Anonymous' : 'Student'}</span>
                   <span className="text-xs text-gray-400 capitalize bg-gray-200 px-2 py-0.5 rounded-full">{q.status}</span>
                 </div>
                 <p className="text-sm font-medium">{q.question}</p>
                 
                 {/* AI Answer & Escalation */}
                 {q.status === 'answered_ai' && q.aiSuggestedAnswer && (
                   <div className="mt-3 bg-indigo-50 p-3 rounded-md border border-indigo-100">
                     <p className="text-xs font-bold text-indigo-800"><CheckCircle2 className="inline h-3 w-3"/> AI Answer</p>
                     <p className="text-sm text-indigo-900">{q.aiSuggestedAnswer}</p>
                     
                     <button 
                         onClick={() => handleEscalate(q._id)} 
                         disabled={escalatingIds.has(q._id)}
                         className="mt-3 w-full bg-white border border-indigo-200 text-indigo-600 font-bold text-xs py-1.5 rounded hover:bg-indigo-100 disabled:opacity-50 uppercase tracking-widest"
                     >
                         {escalatingIds.has(q._id) ? 'Escalated' : 'Still Confused? Ask Teacher'}
                     </button>
                   </div>
                 )}
                 {/* Teacher Answer */}
                 {q.status === 'answered_teacher' && q.aiSuggestedAnswer && (
                   <div className="mt-3 bg-emerald-50 p-3 rounded-md border border-emerald-100">
                     <p className="text-xs font-bold text-emerald-800">👩‍🏫 Teacher Reply</p>
                     <p className="text-sm text-emerald-900">{q.aiSuggestedAnswer}</p>
                   </div>
                 )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
