import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import StudentRegister from './pages/StudentRegister'
import ProfessorLogin from './pages/ProfessorLogin'
import Dashboard from './pages/Dashboard'
import ExamsList from './pages/ExamsList'
import CreateExam from './pages/CreateExam'
import GradeEntry from './pages/GradeEntry'
import ExamResults from './pages/ExamResults'
import Students from './pages/Students'
import MyResults from './pages/MyResults'
import ResultDetail from './pages/ResultDetail'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/inscription" element={<StudentRegister />} />
            <Route path="/professeur" element={<ProfessorLogin />} />

            <Route element={<ProtectedRoute role="student" />}>
              <Route element={<AppLayout role="student" />}>
                <Route path="/resultats" element={<MyResults />} />
                <Route path="/resultats/:id" element={<ResultDetail />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="professor" />}>
              <Route element={<AppLayout role="professor" />}>
                <Route path="/tableau-de-bord" element={<Dashboard />} />
                <Route path="/examens" element={<ExamsList />} />
                <Route path="/examens/nouveau" element={<CreateExam />} />
                <Route path="/examens/:id/notes" element={<GradeEntry />} />
                <Route path="/examens/:id/resultats" element={<ExamResults />} />
                <Route path="/etudiants" element={<Students />} />
                <Route path="/resultats-publies" element={<ExamsList onlyPublished />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}