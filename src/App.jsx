import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import GDModule from './pages/GDModule';
import WATModule from './pages/WATModule';
import SRTModule from './pages/SRTModule';
import PPDTModule from './pages/PPDTModule';
import GTOModule from './pages/GTOModule';
import LecturetteModule from './pages/LecturetteModule';
import MeetSessions from './pages/MeetSessions';
import YoutubeSessions from './pages/YoutubeSessions';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /><span>AUTHENTICATING...</span></div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
};

export default function App() {
  return (
    <div className="scanlines">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="gd" element={<GDModule />} />
          <Route path="wat" element={<WATModule />} />
          <Route path="srt" element={<SRTModule />} />
          <Route path="ppdt" element={<PPDTModule />} />
          <Route path="gto" element={<GTOModule />} />
          <Route path="lecturette" element={<LecturetteModule />} />
          <Route path="meet" element={<MeetSessions />} />
          <Route path="youtube" element={<YoutubeSessions />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}
