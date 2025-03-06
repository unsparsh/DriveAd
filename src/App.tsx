import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import AdvertiserDashboard from './pages/advertiser/Dashboard';
import AdvertiserCampaigns from './pages/advertiser/Campaigns';
import CreateCampaign from './pages/advertiser/CreateCampaign';
import DriverDashboard from './pages/driver/Dashboard';
import AvailableBanners from './pages/driver/AvailableBanners';
import MyBanners from './pages/driver/MyBanners';
import Earnings from './pages/driver/Earnings';
import './index.css';

// Protected route component
const ProtectedRoute = ({ children, role }: { children: JSX.Element, role?: string }) => {
  const { isAuthenticated, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && profile?.role !== role) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* About and info pages */}
        <Route path="/about" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">About Us (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/contact" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Contact Us (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/faq" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">FAQ (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/terms" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Terms of Service (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/privacy" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Privacy Policy (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        
        {/* Advertiser routes */}
        <Route path="/advertiser/dashboard" element={
          <ProtectedRoute role="advertiser">
            <AdvertiserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/advertiser/campaigns" element={
          <ProtectedRoute role="advertiser">
            <AdvertiserCampaigns />
          </ProtectedRoute>
        } />
        <Route path="/advertiser/create-campaign" element={
          <ProtectedRoute role="advertiser">
            <CreateCampaign />
          </ProtectedRoute>
        } />
        
        {/* Driver routes */}
        <Route path="/driver/dashboard" element={
          <ProtectedRoute role="driver">
            <DriverDashboard />
          </ProtectedRoute>
        } />
        <Route path="/driver/available-banners" element={
          <ProtectedRoute role="driver">
            <AvailableBanners />
          </ProtectedRoute>
        } />
        <Route path="/driver/my-banners" element={
          <ProtectedRoute role="driver">
            <MyBanners />
          </ProtectedRoute>
        } />
        <Route path="/driver/earnings" element={
          <ProtectedRoute role="driver">
            <Earnings />
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-indigo-600 mb-4">404</h1>
                <p className="text-xl mb-6">Page not found</p>
                <Link to="/" className="btn-primary">
                  Go back home
                </Link>
              </div>
            </div>
          </MainLayout>
        } />
      </Routes>
    </div>
  );
};

export default App;