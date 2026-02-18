import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/client/Login'
import Register from './pages/client/Register'
import ForgotPassword from './pages/client/ForgotPassword'
import ResetPassword from './pages/client/ResetPassword'
import Home from './pages/client/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="app">
          <div className="content">
            <h1 className="title">
              Welcome to <span className="brand">Hot</span><span className="brand-alt">IPTV</span><span className="brand">Man</span>.com
            </h1>
            <p className="subtitle">Your Premium Streaming Experience</p>
            <div style={{ marginTop: '2rem' }}>
              <a href="/login" style={{ color: '#dc2626', textDecoration: 'none', fontSize: '1.2rem' }}>
                Go to Login →
              </a>
            </div>
          </div>
        </div>
      } />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
