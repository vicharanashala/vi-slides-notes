import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navbar";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <main className="pt-18">
      {/*finally student or teacher dashboard will render inside main based on role*/}
        <h1>Welcome, {user?.fullname}</h1>
        {user?.role === "Instructor" ? (
          <p>You are logged in as an Instructor</p>
        ) : (
          <p>You are logged in as a Student</p>
        )}
      </main>
    </div>
  );
}