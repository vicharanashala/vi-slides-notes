import { useParams, useNavigate } from "react-router-dom";

const JoinEntryPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const handleGuest = () => {
    navigate(`/guest/${code}`);
  };

  const handleLogin = () => {
  navigate(`/login?redirect=/session/${code}`);
};

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Join Session</h1>
      <p>Session Code: {code}</p>

      <button onClick={handleGuest}>Continue as Guest</button>
      <br /><br />
      <button onClick={handleLogin}>Login / Register</button>
    </div>
  );
};

export default JoinEntryPage;