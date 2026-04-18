import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SessionTeacherView() {
  const { code } = useParams();
  const navigate = useNavigate();

  const handleEnd = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sessions/end/${code}`);
      navigate('/teacher');
    } catch (err) { alert("Error ending session"); }
  };

  return (
    <div className="full-page">
      <header className="navbar">
        <button className="btn-3d btn-student" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/teacher')}>← Lobby</button>
        <h2 style={{ fontWeight: 300 }}>SESSION ACTIVE</h2>
        <button className="btn-3d btn-logout" style={{ width: 'auto', padding: '10px 20px' }} onClick={handleEnd}>Terminate</button>
      </header>
      <main className="centered-container">
        <div className="glass-card" style={{ maxWidth: '800px' }}>
          <p style={{ color: '#aaa', letterSpacing: '3px' }}>JOIN CODE</p>
          <h1 style={{ fontSize: '120px', color: '#00d2ff', margin: '10px 0', letterSpacing: '10px' }}>{code}</h1>
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(0,210,255,0.05)', borderRadius: '20px', color: '#00d2ff', width: '100%' }}>
            <strong>Waiting for student interaction...</strong>
          </div>
        </div>
      </main>
    </div>
  );
}