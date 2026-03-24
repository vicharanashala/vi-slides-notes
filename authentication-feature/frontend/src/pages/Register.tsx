import { useState } from "react";
import { registerUser } from "../api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);

      console.log("📤 Sending Data:", formData);

      const res = await registerUser(formData);

      alert("✅ Registered Successfully");

      console.log("✅ RESPONSE:", res.data);

      // reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "Student",
      });

    } catch (err: any) {
      console.log("❌ FULL ERROR:", err);

      if (err.response) {
        alert(err.response.data.message); // 🔥 backend message
      } else {
        alert("❌ Backend not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>

      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
      />
      <br />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <br />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />
      <br />

      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="Student">Student</option>
        <option value="Teacher">Teacher</option>
      </select>
      <br /><br />

      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
};

export default Register;