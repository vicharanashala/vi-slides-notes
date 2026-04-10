import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, LogOut, ArrowRight } from 'lucide-react';

export default function JoinClassDashboard() {
  const [sessionCode, setSessionCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionCode.trim()) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Successfully joined class with code: ${sessionCode}`);
      navigate(`/student-session/${sessionCode}`);
    } catch (error) {
      console.error("Failed to join class", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Basic logout logic
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Vi-SlideS</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
            Welcome, Student!
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Enter the session code provided by your teacher to join the live classroom.
          </p>
        </div>

        <div className="mt-10 max-w-xl mx-auto">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                <Users className="h-5 w-5 text-indigo-500 mr-2" />
                Join a Class Session
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>The code is typically 6-8 characters long (e.g., AB12CD).</p>
              </div>
              <form className="mt-5 sm:flex sm:items-center" onSubmit={handleJoinClass}>
                <div className="w-full sm:max-w-xs">
                  <label htmlFor="sessionCode" className="sr-only">
                    Session Code
                  </label>
                  <input
                    type="text"
                    name="sessionCode"
                    id="sessionCode"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none uppercase"
                    placeholder="Enter Session Code"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !sessionCode}
                  className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : 'Join Class'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
