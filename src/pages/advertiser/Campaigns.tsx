import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search } from 'lucide-react';
import MainLayout from '../../components/Layout/MainLayout';
import CampaignCard from '../../components/dashboard/CampaignCard';
import { supabase } from '../../lib/supabase';

const AdvertiserCampaigns = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        
        // Get user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not found');
        
        // Get advertiser profile
        const { data: advertiserData, error: advertiserError } = await supabase
          .from('advertisers')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (advertiserError) throw advertiserError;
        if (!advertiserData) throw new Error('Advertiser profile not found');
        
        // For now, we'll use mock data
        // In a real implementation, you would fetch this data from your API
        
        // Mock campaigns
        const mockCampaigns = [
          {
            id: '1',
            name: 'Summer Sale Promotion',
            status: 'active',
            startDate: '2025-06-01',
            endDate: '2025-06-30',
            bannerCount: 10,
            remainingBanners: 2,
            vehicleType: 'auto',
            bannerImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '2',
            name: 'New Store Launch',
            status: 'active',
            startDate: '2025-05-15',
            endDate: '2025-07-15',
            bannerCount: 5,
            remainingBanners: 0,
            vehicleType: 'car',
            bannerImage: 'https://images.unsplash.com/photo-1581077968324-c1c7e64bfa2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '3',
            name: 'Festival Discount',
            status: 'pending',
            startDate: '2025-08-01',
            endDate: '2025-08-15',
            bannerCount: 8,
            remainingBanners: 8,
            vehicleType: 'auto'
          },
          {
            id: '4',
            name: 'Holiday Special',
            status: 'completed',
            startDate: '2025-01-01',
            endDate: '2025-01-15',
            bannerCount: 6,
            remainingBanners: 0,
            vehicleType: 'car',
            bannerImage: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          },
          {
            id: '5',
            name: 'Weekend Flash Sale',
            status: 'cancelled',
            startDate: '2025-02-10',
            endDate: '2025-02-12',
            bannerCount: 4,
            remainingBanners: 4,
            vehicleType: 'auto'
          }
        ];
        
        setCampaigns(mockCampaigns);
        setFilteredCampaigns(mockCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Apply filters when search term or filters change
  useEffect(() => {
    let result = [...campaigns];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(campaign => campaign.status === statusFilter);
    }
    
    // Apply vehicle filter
    if (vehicleFilter !== 'all') {
      result = result.filter(campaign => campaign.vehicleType === vehicleFilter);
    }
    
    setFilteredCampaigns(result);
  }, [searchTerm, statusFilter, vehicleFilter, campaigns]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
          <Link
            to="/advertiser/create-campaign"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={16} className="mr-2" />
            Create Campaign
          </Link>
        </div>

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
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="mb-4 sm:mb-0">
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
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {filteredCampaigns.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Filter size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No campaigns found</h3>
                <p className="text-gray-500 mb-4">
                  {campaigns.length === 0 
                    ? "You haven't created any campaigns yet." 
                    : "No campaigns match your current filters."}
                </p>
                {campaigns.length === 0 && (
                  <Link
                    to="/advertiser/create-campaign"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Your First Campaign
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map(campaign => (
                  <CampaignCard
                    key={campaign.id}
                    id={campaign.id}
                    name={campaign.name}
                    status={campaign.status}
                    startDate={campaign.startDate}
                    endDate={campaign.endDate}
                    bannerCount={campaign.bannerCount}
                    remainingBanners={campaign.remainingBanners}
                    vehicleType={campaign.vehicleType}
                    bannerImage={campaign.bannerImage}
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

export default AdvertiserCampaigns;