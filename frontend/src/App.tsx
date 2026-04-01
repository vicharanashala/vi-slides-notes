import { BrowserRouter, Routes, Route } from "react-router-dom";
import Student from "./components/student";
import Teacher from "./components/Teacher";
import HomePage from "./components/Home"; // imported Home page component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME PAGE */}
        <Route path="/" element={<HomePage />} />

        {/* ROLE PAGES */}
        <Route path="/student" element={<Student />} />
        <Route path="/teacher" element={<Teacher />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;