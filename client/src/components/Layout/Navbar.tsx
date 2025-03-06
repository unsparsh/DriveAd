import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Car, BarChart2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                <polyline points="17 2 12 7 7 2"></polyline>
                <line x1="2" y1="17" x2="22" y2="17"></line>
              </svg>
              <span className="ml-2 text-xl font-bold text-indigo-600">DriveAds</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'advertiser' && (
                  <>
                    <Link to="/advertiser/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                      Dashboard
                    </Link>
                    <Link to="/advertiser/campaigns" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                      Campaigns
                    </Link>
                    <Link to="/advertiser/create-campaign" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                      Create Campaign
                    </Link>
                  </>
                )}
                {user?.role === 'driver' && (
                  <>
                    <Link to="/driver/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                      Dashboard
                    </Link>
                    <Link to="/driver/available-banners" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                      Available Banners
                    </Link>
                    <Link to="/driver/my-banners" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                      My Banners
                    </Link>
                    <Link to="/driver/earnings" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                      Earnings
                    </Link>
                  </>
                )}
                <div className="flex items-center ml-4">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Login
                </Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                {user?.role === 'advertiser' && (
                  <>
                    <Link to="/advertiser/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                      <BarChart2 size={18} className="inline mr-2" />
                      Dashboard
                    </Link>
                    <Link to="/advertiser/campaigns" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                      <BarChart2 size={18} className="inline mr-2" />
                      Campaigns
                    </Link>
                    <Link to="/advertiser/create-campaign" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                      <BarChart2 size={18} className="inline mr-2" />
                      Create Campaign
                    </Link>
                  </>
                )}
                {user?.role === 'driver' && (
                  <>
                    <Link to="/driver/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                      <BarChart2 size={18} className="inline mr-2" />
                      Dashboard
                    </Link>
                    <Link to="/driver/available-banners" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                      <Car size={18} className="inline mr-2" />
                      Available Banners
                    </Link>
                    <Link to="/driver/my-banners" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                      <Car size={18} className="inline mr-2" />
                      My Banners
                    </Link>
                    <Link to="/driver/earnings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                      <BarChart2 size={18} className="inline mr-2" />
                      Earnings
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <User size={24} className="text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 px-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600"
                    >
                      <LogOut size={18} className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                  <User size={18} className="inline mr-2" />
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600">
                  <User size={18} className="inline mr-2" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;