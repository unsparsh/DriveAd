import { useState, useEffect } from 'react';
import { Filter, Search, Car } from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../../components/Layout/MainLayout';
import BannerCard from '../../components/dashboard/BannerCard';
import QRScanner from '../../components/QRScanner';
import { supabase } from '../../lib/supabase';

const MyBanners = () => {
  const [loading, setLoading] = useState(true);
  const [myBanners, setMyBanners] = useState<any[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyBanners = async () => {
      try {
        setLoading(true);
        
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');
        
        // Get driver profile
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (driverError) throw driverError;
        if (!driverData) throw new Error('Driver profile not found');
        
        // For now, we'll use mock data
        // In a real implementation, you would fetch this data from your API
        
        // Mock my banners
        const mockBanners = [
          {
            id: '1',
            campaignName: 'Summer Sale Promotion',
            status: 'verified',
            startDate: '2025-06-01',
            endDate: '2025-06-30',
            vehicleType: 'auto',
            bannerImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '2',
            campaignName: 'New Store Launch',
            status: 'assigned',
            startDate: '2025-05-15',
            endDate: '2025-07-15',
            vehicleType: 'auto',
            bannerImage: 'https://images.unsplash.com/photo-1581077968324-c1c7e64bfa2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '3',
            campaignName: 'Holiday Special',
            status: 'completed',
            startDate: '2025-01-01',
            endDate: '2025-01-15',
            vehicleType: 'auto',
            bannerImage: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          }
        ];
        
        setMyBanners(mockBanners);
        setFilteredBanners(mockBanners);
      } catch (error) {
        console.error('Error fetching my banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBanners();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    let result = [...myBanners];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(banner => 
        banner.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(banner => banner.status === statusFilter);
    }
    
    setFilteredBanners(result);
  }, [searchTerm, statusFilter, myBanners]);

  const handleVerifyBanner = (bannerId: string) => {
    setSelectedBannerId(bannerId);
    setShowScanner(true);
  };

  const handleScan = (data: string, imageData?: string) => {
    console.log('Scanned data:', data);
    
    if (data === 'photo_verification' && imageData) {
      // Handle photo verification
      // In a real implementation, you would upload the image to your server
      toast.success('Verification photo captured successfully!');
      
      // Update banner status
      if (selectedBannerId) {
        setMyBanners(prev => 
          prev.map(banner => 
            banner.id === selectedBannerId 
              ? { ...banner, status: 'verified' } 
              : banner
          )
        );
      }
    } else {
      // Handle QR code scan
      toast.success('QR code scanned successfully: ' + data);
    }
    
    setShowScanner(false);
    setSelectedBannerId(null);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Banners</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="flex-1 mb-4 md:mb-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="verified">Verified</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {filteredBanners.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Car size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No banners found</h3>
                <p className="text-gray-500 mb-4">
                  {myBanners.length === 0 
                    ? "You haven't claimed any banners yet." 
                    : "No banners match your current filters."}
                </p>
                {myBanners.length === 0 && (
                  <Link
                    to="/driver/available-banners"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Browse Available Banners
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBanners.map(banner => (
                  <BannerCard
                    key={banner.id}
                    id={banner.id}
                    campaignName={banner.campaignName}
                    status={banner.status}
                    startDate={banner.startDate}
                    endDate={banner.endDate}
                    vehicleType={banner.vehicleType}
                    bannerImage={banner.bannerImage}
                    onVerify={banner.status !== 'completed' ? () => handleVerifyBanner(banner.id) : undefined}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {showScanner && (
          <QRScanner 
            onScan={handleScan} 
            onClose={() => {
              setShowScanner(false);
              setSelectedBannerId(null);
            }} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default MyBanners;