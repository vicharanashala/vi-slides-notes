import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.name) navigate('/');
    setName(user.name);
  }, [navigate]);

  const handleJoin = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sessions/join/${code}`);
      localStorage.setItem('activeSession', JSON.stringify(res.data.session));
      navigate(`/session/${code}`);
    } catch (err) { alert("Invalid Code"); }
  };

  return (
    <div className="full-page">
      <header className="navbar">
        <h2 style={{ color: '#6c5ce7', fontWeight: 900 }}>STUDENT</h2>
        <button className="btn-3d btn-logout" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => { localStorage.clear(); navigate('/'); }}>Logout</button>
      </header>
      <main className="centered-container">
        <div className="glass-card">
          <h1>Hello, {name}</h1>
          <p style={{ color: '#aaa', marginBottom: '30px' }}>Enter the 6-digit class code to join.</p>
          <input 
            type="text" placeholder="000000" maxLength={6}
            value={code} onChange={(e) => setCode(e.target.value)}
            style={{ textAlign: 'center', fontSize: '32px', letterSpacing: '10px' }}
          />
          <button className="btn-3d btn-student" onClick={handleJoin}>Join Session</button>
        </div>
      </main>
    </div>
  );
}