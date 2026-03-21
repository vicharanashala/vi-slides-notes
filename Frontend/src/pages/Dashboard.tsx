import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.fullname}</h1>
      {user?.role === "Instructor" ? (
        <p>You are logged in as an Instructor</p>
      ) : (
        <p>You are logged in as a Student</p>
      )}
    </div>
  );
}