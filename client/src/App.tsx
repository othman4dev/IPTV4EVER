import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/client/Login'
import Register from './pages/client/Register'
import ForgotPassword from './pages/client/ForgotPassword'
import ResetPassword from './pages/client/ResetPassword'
import Home from './pages/client/Home'
import Loading from './pages/Loading'
import Plans from './pages/client/Plans'
import Contact from './pages/client/Contact'
import Dashboard from './pages/admin/Dashboard'
import AdminPlans from './pages/admin/Plans'
import AdminUsers from './pages/admin/Users'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/plans" element={<AdminPlans />} />
      <Route path="/admin/users" element={<AdminUsers />} />
    </Routes>
  )
}

export default App
