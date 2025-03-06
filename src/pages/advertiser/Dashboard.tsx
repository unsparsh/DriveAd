import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, DollarSign, Users, Car, TrendingUp, Plus } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import MainLayout from '../../components/Layout/MainLayout';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ChartContainer from '../../components/dashboard/ChartContainer';
import CampaignCard from '../../components/dashboard/CampaignCard';
import { supabase } from '../../lib/supabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdvertiserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalCampaigns: 0,
    totalSpent: 0,
    totalBanners: 0,
    assignedBanners: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        
        // Mock stats
        setStats({
          activeCampaigns: 3,
          totalCampaigns: 5,
          totalSpent: 12500,
          totalBanners: 25,
          assignedBanners: 18
        });
        
        // Mock recent campaigns
        setRecentCampaigns([
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
  const campaignData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Active Campaigns',
        data: [2, 3, 2, 4, 3, 5],
        borderColor: 'rgb(79, 70, 229)',
        tension: 0.4
      }
    ]
  };

  const spendingData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Spending (₹)',
        data: [2000, 3000, 2500, 4000, 3500, 5000],
        backgroundColor: 'rgba(79, 70, 229, 0.8)'
      }
    ]
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Link
            to="/advertiser/create-campaign"
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus size={16} className="mr-2" />
            Create Campaign
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
                title="Active Campaigns"
                value={stats.activeCampaigns.toString()}
                icon={<BarChart2 size={24} className="text-white" />}
                color="bg-indigo-600"
                change={{ value: 20, isPositive: true }}
              />
              <DashboardCard
                title="Total Campaigns"
                value={stats.totalCampaigns.toString()}
                icon={<TrendingUp size={24} className="text-white" />}
                color="bg-green-600"
              />
              <DashboardCard
                title="Total Spent"
                value={`₹${stats.totalSpent.toLocaleString()}`}
                icon={<DollarSign size={24} className="text-white" />}
                color="bg-amber-600"
                change={{ value: 15, isPositive: true }}
              />
              <DashboardCard
                title="Active Banners"
                value={`${stats.assignedBanners}/${stats.totalBanners}`}
                icon={<Car size={24} className="text-white" />}
                color="bg-purple-600"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartContainer title="Campaign Performance">
                <Line 
                  data={campaignData}
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
              <ChartContainer title="Monthly Spending">
                <Bar 
                  data={spendingData}
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

            {/* Recent Campaigns */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Campaigns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentCampaigns.map(campaign => (
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
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default AdvertiserDashboard;