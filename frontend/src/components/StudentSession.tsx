import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, LogOut, MessageSquare, AlertCircle } from 'lucide-react';

export default function StudentSession() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleLeave = () => {
    navigate('/join-class');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmitting(true);
    setStatusMsg('');
    try {
      // Simulated submit
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubmitting(false);
      setQuestion('');
      setStatusMsg('Question sent successfully!');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (error) {
      setSubmitting(false);
      setStatusMsg('Failed to send question.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Live Session: {code}</span>
            </div>
            <button
              onClick={handleLeave}
              className="flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Leave Session</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="w-full bg-white shadow sm:rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Ask a Question</h2>
            <p className="text-gray-500 mt-2">Your question will be sent to the teacher and AI system.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question" className="sr-only">Your Question</label>
              <textarea
                id="question"
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-3 outline-none resize-none"
                placeholder="Type your question here..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="anonymous"
                  name="anonymous"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-900">
                  Ask Anonymously
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || !question.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              >
                {submitting ? 'Sending...' : 'Send'}
                {!submitting && <Send className="ml-2 h-4 w-4" />}
              </button>
            </div>
            {statusMsg && (
              <div className={`mt-3 p-3 text-sm rounded-md flex items-center ${statusMsg.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <AlertCircle className="h-5 w-5 mr-2" />
                {statusMsg}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
