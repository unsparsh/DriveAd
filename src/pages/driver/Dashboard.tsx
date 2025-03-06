import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, DollarSign, Car, Camera, Plus } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import MainLayout from '../../components/Layout/MainLayout';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ChartContainer from '../../components/dashboard/ChartContainer';
import BannerCard from '../../components/dashboard/BannerCard';
import QRScanner from '../../components/QRScanner';
import { supabase } from '../../lib/supabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DriverDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeBanners: 0,
    totalEarnings: 0,
    pendingPayment: 0,
    completedCampaigns: 0
  });
  const [activeBanners, setActiveBanners] = useState<any[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        
        // Mock stats
        setStats({
          activeBanners: 2,
          totalEarnings: 4200,
          pendingPayment: 1400,
          completedCampaigns: 3
        });
        
        // Mock active banners
        setActiveBanners([
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
          }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare chart data
  const earningsData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Earnings (₹)',
        data: [500, 700, 600, 900, 1200, 1300],
        borderColor: 'rgb(79, 70, 229)',
        tension: 0.4
      }
    ]
  };

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
        setActiveBanners(prev => 
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Link
            to="/driver/available-banners"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={16} className="mr-2" />
            Browse Available Banners
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DashboardCard
                title="Active Banners"
                value={stats.activeBanners.toString()}
                icon={<Car size={24} className="text-white" />}
                color="bg-indigo-600"
              />
              <DashboardCard
                title="Total Earnings"
                value={`₹${stats.totalEarnings.toLocaleString()}`}
                icon={<DollarSign size={24} className="text-white" />}
                color="bg-green-600"
                change={{ value: 25, isPositive: true }}
              />
              <DashboardCard
                title="Pending Payment"
                value={`₹${stats.pendingPayment.toLocaleString()}`}
                icon={<DollarSign size={24} className="text-white" />}
                color="bg-amber-600"
              />
              <DashboardCard
                title="Completed Campaigns"
                value={stats.completedCampaigns.toString()}
                icon={<BarChart2 size={24} className="text-white" />}
                color="bg-purple-600"
              />
            </div>

            {/* Earnings Chart */}
            <div className="mb-8">
              <ChartContainer title="Earnings History">
                <Line 
                  data={earningsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      }
                    }
                  }}
                  height={300}
                />
              </ChartContainer>
            </div>

            {/* Active Banners */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Active Banners</h2>
              {activeBanners.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <Car size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No active banners</h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any active banners at the moment.
                  </p>
                  <Link
                    to="/driver/available-banners"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Browse Available Banners
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBanners.map(banner => (
                    <BannerCard
                      key={banner.id}
                      id={banner.id}
                      campaignName={banner.campaignName}
                      status={banner.status}
                      startDate={banner.startDate}
                      endDate={banner.endDate}
                      vehicleType={banner.vehicleType}
                      bannerImage={banner.bannerImage}
                      onVerify={() => handleVerifyBanner(banner.id)}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {showScanner && (
              <QRScanner 
                onScan={handleScan} 
                onClose={() => {
                  setShowScanner(false);
                  setSelectedBannerId(null);
                }} 
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default DriverDashboard;