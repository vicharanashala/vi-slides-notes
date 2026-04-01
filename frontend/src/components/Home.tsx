export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Vislides</h1>
      <p>Choose your role:</p>

      <div style={{ marginTop: "40px" }}>
        {/* Teacher Button */}
        <a
          href="/teacher"
          target="_blank"             // Open in new tab
          rel="noopener noreferrer"   // Security best practice
          style={{
            display: "inline-block",
            padding: "15px 30px",
            marginRight: "20px",
            backgroundColor: "#4CAF50",
            color: "white",
            textDecoration: "none",
            fontSize: "18px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Teacher
        </a>

        {/* Student Button */}
        <a
          href="/student"
          target="_blank"             // Open in new tab
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "15px 30px",
            backgroundColor: "#2196F3",
            color: "white",
            textDecoration: "none",
            fontSize: "18px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Student
        </a>
      </div>
    </div>
  );
}