import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuthCallback from './pages/auth/OAuthCallback';
import HomeFeed from './pages/HomeFeed';
import MainLayout from './components/layout/MainLayout';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Search from './pages/Search';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />

      {/* Protected Routes inside Main Layout */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeFeed />} />
        <Route path="profile/:userId" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="search" element={<Search />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
