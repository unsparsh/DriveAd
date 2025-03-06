import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import './index.css';

const App = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Add placeholder routes for future implementation */}
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
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Advertiser Dashboard (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/advertiser/campaigns" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Campaigns (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/advertiser/create-campaign" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Create Campaign (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        
        {/* Driver routes */}
        <Route path="/driver/dashboard" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Driver Dashboard (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/driver/available-banners" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Available Banners (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/driver/my-banners" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">My Banners (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
        <Route path="/driver/earnings" element={
          <MainLayout>
            <div className="min-h-[calc(100vh-64px-200px)] flex items-center justify-center">
              <h1 className="text-3xl font-bold">Earnings (Coming Soon)</h1>
            </div>
          </MainLayout>
        } />
      </Routes>
    </div>
  );
};

export default App;