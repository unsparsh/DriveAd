import { useState, useEffect } from 'react';
import { DollarSign, Calendar, Download } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import MainLayout from '../../components/Layout/MainLayout';
import ChartContainer from '../../components/dashboard/ChartContainer';
import { supabase } from '../../lib/supabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayment: 0,
    totalPaid: 0,
    monthlyEarnings: [] as { month: string; amount: number }[]
  });
  const [earningHistory, setEarningHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchEarnings = async () => {
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
        
        // Mock earnings data
        setEarnings({
          totalEarnings: 4200,
          pendingPayment: 1400,
          totalPaid: 2800,
          monthlyEarnings: [
            { month: 'Jan', amount: 500 },
            { month: 'Feb', amount: 700 },
            { month: 'Mar', amount: 600 },
            { month: 'Apr', amount: 900 },
            { month: 'May', amount: 1200 },
            { month: 'Jun', amount: 300 }
          ]
        });
        
        // Mock earning history
        setEarningHistory([
          {
            id: '1',
            campaignName: 'Summer Sale Promotion',
            startDate: '2025-06-01',
            endDate: '2025-06-15',
            daysActive: 15,
            vehicleType: 'auto',
            ratePerDay: 70,
            totalEarning: 1050,
            status: 'paid',
            paidOn: '2025-06-20'
          },
          {
            id: '2',
            campaignName: 'New Store Launch',
            startDate: '2025-05-15',
            endDate: '2025-05-30',
            daysActive: 16,
            vehicleType: 'auto',
            ratePerDay: 70,
            totalEarning: 1120,
            status: 'paid',
            paidOn: '2025-06-05'
          },
          {
            id: '3',
            campaignName: 'Holiday Special',
            startDate: '2025-04-01',
            endDate: '2025-04-15',
            daysActive: 15,
            vehicleType: 'auto',
            ratePerDay: 70,
            totalEarning: 1050,
            status: 'paid',
            paidOn: '2025-04-20'
          },
          {
            id: '4',
            campaignName: 'Festival Discount',
            startDate: '2025-06-15',
            endDate: '2025-06-30',
            daysActive: 16,
            vehicleType: 'auto',
            ratePerDay: 70,
            totalEarning: 1120,
            status: 'pending',
            paidOn: null
          }
        ]);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  // Prepare chart data
  const earningsChartData: ChartData<'bar'> = {
    labels: earnings.monthlyEarnings.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Earnings (₹)',
        data: earnings.monthlyEarnings.map(item => item.amount),
        backgroundColor: 'rgba(79, 70, 229, 0.8)'
      }
    ]
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Earnings</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-2">
                  <DollarSign size={20} className="text-indigo-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Total Earnings</h3>
                </div>
                <p className="text-3xl font-bold text-indigo-600">₹{earnings.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-2">
                  <Calendar size={20} className="text-green-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Total Paid</h3>
                </div>
                <p className="text-3xl font-bold text-green-600">₹{earnings.totalPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-2">
                  <Calendar size={20} className="text-amber-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Pending Payment</h3>
                </div>
                <p className="text-3xl font-bold text-amber-600">₹{earnings.pendingPayment.toLocaleString()}</p>
              </div>
            </div>

            {/* Earnings Chart */}
            <div className="mb-8">
              <ChartContainer title="Monthly Earnings">
                <Bar 
                  data={earningsChartData} 
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

            {/* Earnings History */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Earnings History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days Active
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earningHistory.map((earning) => (
                      <tr key={earning.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{earning.campaignName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(earning.startDate)} - {formatDate(earning.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{earning.daysActive} days</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{earning.ratePerDay}/day</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">₹{earning.totalEarning}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            earning.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {earning.status === 'paid' 
                              ? `Paid on ${formatDate(earning.paidOn)}` 
                              : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
                <button className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                  <Download size={16} className="mr-1" />
                  Download Statement
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Schedule</h3>
                <p className="text-sm text-gray-600">
                  Payments are processed on the 5th and 20th of each month for all completed campaigns.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Bank Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Account Holder</p>
                    <p className="text-sm font-medium">John Doe</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium">HDFC Bank</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="text-sm font-medium">XXXX XXXX XXXX 1234</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium">HDFC0001234</p>
                  </div>
                </div>
                <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-800">
                  Update Bank Details
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Earnings;