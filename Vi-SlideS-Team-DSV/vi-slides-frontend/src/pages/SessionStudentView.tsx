import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SessionStudentView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <div className="full-page">
      <header className="navbar">
        <button className="btn-3d btn-logout" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/student')}>Exit</button>
        <h2 style={{ fontWeight: 300 }}>LIVE: {code}</h2>
        <div style={{ width: '60px' }}></div>
      </header>
      <main className="centered-container">
        <div className="glass-card">
          <h2 style={{ color: '#00d2ff', marginBottom: '20px' }}>Ask AI Brain</h2>
          <textarea 
            placeholder="Type your question..." 
            value={q} onChange={(e) => setQ(e.target.value)} 
          />
          <button className="btn-3d btn-student" onClick={() => alert("Submitting to AI...")}>Analyze & Send</button>
          <div style={{ marginTop: '30px', width: '100%', textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
             <p style={{ color: '#444', fontSize: '12px', textTransform: 'uppercase' }}>Log</p>
             <p style={{ color: '#777', fontSize: '14px' }}>No activity yet.</p>
          </div>
        </div>
      </main>
    </div>
  );
}