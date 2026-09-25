import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/client/Login'
import Register from './pages/client/Register'
import ForgotPassword from './pages/client/ForgotPassword'
import ResetPassword from './pages/client/ResetPassword'
import Home from './pages/client/Home'
import Profile from './pages/client/Profile'
import Loading from './pages/Loading'
import Plans from './pages/client/Plans'
import Plan from './pages/client/Plan'
import Contact from './pages/client/Contact'
import BlogsPage from './pages/client/Blogs'
import BlogPostPage from './pages/client/BlogPost'
import Dashboard from './pages/admin/Dashboard'
import AdminPlans from './pages/admin/Plans'
import AdminUsers from './pages/admin/Users'
import AdminSubscriptions from './pages/admin/Subscriptions'
import AdminPages from './pages/admin/Pages'
import SlidesPage from './pages/admin/Slides'
import HeroSectionPage from './pages/admin/HeroSection'
import EndpointsPage from './pages/admin/Endpoints'
import AnnouncementsPage from './pages/admin/Announcements'
import NavLinksPage from './pages/admin/NavLinks'
import FeatureCardsPage from './pages/admin/FeatureCards'
import TestimonialsPage from './pages/admin/Testimonials'
import FAQPage from './pages/admin/FAQ'
import AdminBlogsPage from './pages/admin/Blogs'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blogs" element={<BlogsPage />} />
      <Route path="/blog/:id" element={<BlogPostPage />} />
      <Route path="/plan/:id" element={<Plan />} />
      <Route path="*" element={<Navigate to="/" replace />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/admin/plans" element={<AdminPlans />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
      <Route path="/admin/endpoints" element={<EndpointsPage />} />
      <Route path="/admin/pages" element={<AdminPages />} />
      <Route path="/admin/pages/hero" element={<HeroSectionPage />} />
      <Route path="/admin/pages/slides" element={<SlidesPage />} />
      <Route path="/admin/pages/announcements" element={<AnnouncementsPage />} />
      <Route path="/admin/pages/nav-links" element={<NavLinksPage />} />
      <Route path="/admin/pages/features" element={<FeatureCardsPage />} />
      <Route path="/admin/pages/testimonials" element={<TestimonialsPage />} />
      <Route path="/admin/pages/faq" element={<FAQPage />} />
      <Route path="/admin/blog" element={<AdminBlogsPage />} />
    </Routes>
  )
}

export default App
