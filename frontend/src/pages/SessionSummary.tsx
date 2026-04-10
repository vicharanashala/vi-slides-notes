import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, Zap, BarChart3, ArrowLeft, Loader2, Smile, MessageSquare } from 'lucide-react';

interface Metrics {
  sessionCode: string;
  totalQuestions: number;
  autoAnswered: number;
  teacherAnswered: number;
  avgComplexity: number;
}

interface MoodResult {
  mood: string;
  summary: string;
}

export default function SessionSummary() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [moodData, setMoodData] = useState<MoodResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        const metRes = await fetch(`http://localhost:5000/api/analytics/${code}`, { headers });
        if (metRes.ok) {
            const metData = await metRes.json();
            setMetrics(metData);
        }

        const moodRes = await fetch(`http://localhost:5000/api/analytics/${code}/mood`, { method: 'POST', headers });
        if (moodRes.ok) {
            const moodObj = await moodRes.json();
            setMoodData({ mood: moodObj.mood, summary: moodObj.summary });
        }
      } catch (err) {
        console.error("Error fetching Phase 4 analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    if (code) fetchAnalytics();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
           <p className="text-gray-500 font-medium animate-pulse">Generating AI Class Analytics...</p>
         </div>
      </div>
    );
  }

  // Calculate percentages strictly bounded
  const autoPercent = metrics?.totalQuestions ? Math.round((metrics.autoAnswered / metrics.totalQuestions) * 100) : 0;
  
  const getMoodColor = (mood: string) => {
    const m = mood?.toLowerCase() || '';
    if (m.includes('engage') || m.includes('curious')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (m.includes('confus')) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (m.includes('frust')) return 'text-red-700 bg-red-50 border-red-200';
    return 'text-indigo-700 bg-indigo-50 border-indigo-200';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        <header className="flex items-center justify-between mb-2">
            <div>
              <button onClick={() => navigate('/teacher-dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-3 transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-indigo-600" /> Session Intelligence Report
              </h1>
              <p className="text-gray-500 mt-1">Join Code: <span className="font-mono text-indigo-600 font-bold">{code}</span></p>
            </div>
            <div className="text-right">
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-bold uppercase tracking-widest border border-gray-300">Session Ended</span>
            </div>
        </header>

        {/* AI Insight Highlight */}
        <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm transition-all ${getMoodColor(moodData?.mood || '')}`}>
            <div className="p-4 bg-white/60 rounded-full shrink-0 shadow-sm border border-black/5">
               <Smile className="w-12 h-12" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2 flex items-center justify-center md:justify-start gap-2">
                    <Brain className="w-4 h-4" /> Overall Class Sentiment: <span className="capitalize">{moodData?.mood || 'Neutral'}</span>
                </h3>
                <p className="text-xl font-medium leading-relaxed opacity-95">
                    "{moodData?.summary || 'No class insight could be generated for this session.'}"
                </p>
            </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4 text-gray-500 font-medium text-sm border-b border-gray-50 pb-3">
                    <MessageSquare className="w-5 h-5 text-blue-500" /> Total Interaction
                </div>
                <div>
                   <span className="text-5xl font-extrabold text-gray-900">{metrics?.totalQuestions || 0}</span>
                   <span className="text-gray-500 ml-2 font-medium">Questions</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center gap-3 mb-4 text-gray-500 font-medium text-sm border-b border-gray-50 pb-3">
                    <Zap className="w-5 h-5 text-amber-500" /> AI Auto-Deflection
                </div>
                <div>
                   <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-extrabold text-indigo-600">{autoPercent}%</span>
                   </div>
                   <p className="text-sm text-gray-400 font-medium mt-2 leading-snug">
                       Gemini answered {metrics?.autoAnswered || 0} questions instantly.
                   </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4 text-gray-500 font-medium text-sm border-b border-gray-50 pb-3">
                    <Brain className="w-5 h-5 text-purple-500" /> Avg Complexity
                </div>
                <div>
                   <span className="text-5xl font-extrabold text-purple-600">{metrics?.avgComplexity || '0.0'}</span>
                   <span className="text-gray-400 font-bold ml-1 text-xl">/ 10</span>
                   <p className="text-sm text-gray-400 font-medium mt-2 leading-snug">Average depth of class queries.</p>
                </div>
            </div>

        </div>

        {/* Closing Actions */}
        <div className="mt-8 flex justify-center pb-20">
            <button onClick={() => navigate('/teacher-dashboard')} className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors shadow-md text-sm uppercase tracking-widest">
                Return to Dashboard
            </button>
        </div>

      </div>
    </div>
  );
}
