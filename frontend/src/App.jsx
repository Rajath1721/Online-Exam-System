import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/Dashboard';
import ManageTests from './pages/admin/ManageTests';
import ManageQuestions from './pages/admin/ManageQuestions';
import AdminStudentResults from './pages/admin/StudentResults';

import StudentDashboard from './pages/student/Dashboard';
import AvailableTests from './pages/student/AvailableTests';
import TakeTest from './pages/student/TakeTest';
import StudentResults from './pages/student/Results';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/tests" element={<ManageTests />} />
        <Route path="/admin/tests/:testId/questions" element={<ManageQuestions />} />
        <Route path="/admin/results" element={<AdminStudentResults />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/available-tests" element={<AvailableTests />} />
        <Route path="/student/tests/:testId/take" element={<TakeTest />} />
        <Route path="/student/results" element={<StudentResults />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
