import { useState, useEffect } from 'react';
import { Filter, Search, Car } from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../../components/Layout/MainLayout';
import BannerCard from '../../components/dashboard/BannerCard';
import { supabase } from '../../lib/supabase';

const AvailableBanners = () => {
  const [loading, setLoading] = useState(true);
  const [availableBanners, setAvailableBanners] = useState<any[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  useEffect(() => {
    const fetchAvailableBanners = async () => {
      try {
        setLoading(true);
        
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');
        
        // Get driver profile
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('id, vehicle_type')
          .eq('user_id', user.id)
          .single();
          
        if (driverError) throw driverError;
        if (!driverData) throw new Error('Driver profile not found');
        
        // For now, we'll use mock data
        // In a real implementation, you would fetch this data from your API
        
        // Mock available banners
        const mockBanners = [
          {
            id: '1',
            campaignName: 'Summer Sale Promotion',
            status: 'available',
            startDate: '2025-06-01',
            endDate: '2025-06-30',
            vehicleType: 'auto',
            bannerImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '2',
            campaignName: 'New Store Launch',
            status: 'available',
            startDate: '2025-05-15',
            endDate: '2025-07-15',
            vehicleType: 'car',
            bannerImage: 'https://images.unsplash.com/photo-1581077968324-c1c7e64bfa2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '3',
            campaignName: 'Festival Discount',
            status: 'available',
            startDate: '2025-08-01',
            endDate: '2025-08-15',
            vehicleType: 'auto'
          },
          {
            id: '4',
            campaignName: 'Holiday Special',
            status: 'available',
            startDate: '2025-07-01',
            endDate: '2025-07-15',
            vehicleType: 'auto',
            bannerImage: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '5',
            campaignName: 'Weekend Flash Sale',
            status: 'available',
            startDate: '2025-06-15',
            endDate: '2025-06-17',
            vehicleType: 'car'
          }
        ];
        
        // Filter banners based on driver's vehicle type
        const filteredByVehicleType = mockBanners.filter(
          banner => banner.vehicleType === driverData.vehicle_type
        );
        
        setAvailableBanners(filteredByVehicleType);
        setFilteredBanners(filteredByVehicleType);
      } catch (error) {
        console.error('Error fetching available banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableBanners();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    let result = [...availableBanners];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(banner => 
        banner.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply vehicle filter
    if (vehicleFilter !== 'all') {
      result = result.filter(banner => banner.vehicleType === vehicleFilter);
    }
    
    setFilteredBanners(result);
  }, [searchTerm, vehicleFilter, availableBanners]);

  const handleClaimBanner = async (bannerId: string) => {
    try {
      // In a real implementation, you would call your API to claim the banner
      
      // For now, we'll just simulate success
      toast.success('Banner claimed successfully!');
      
      // Remove the claimed banner from the list
      setAvailableBanners(prev => prev.filter(banner => banner.id !== bannerId));
      setFilteredBanners(prev => prev.filter(banner => banner.id !== bannerId));
    } catch (error: any) {
      console.error('Error claiming banner:', error);
      toast.error(error.message || 'Failed to claim banner');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Banners</h1>

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
              <label htmlFor="vehicle-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                id="vehicle-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
              >
                <option value="all">All Vehicles</option>
                <option value="auto">Auto</option>
                <option value="car">Car</option>
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
                <Filter size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No banners available</h3>
                <p className="text-gray-500">
                  {availableBanners.length === 0 
                    ? "There are no banners available for your vehicle type at the moment." 
                    : "No banners match your current filters."}
                </p>
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
                    onClaim={() => handleClaimBanner(banner.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AvailableBanners;