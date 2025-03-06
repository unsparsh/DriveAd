import { Link } from 'react-router-dom';

interface BannerCardProps {
  id: string;
  campaignName: string;
  status: 'available' | 'assigned' | 'verified' | 'completed';
  startDate: string;
  endDate: string;
  vehicleType: 'auto' | 'car';
  bannerImage?: string;
  onClaim?: () => void;
  onVerify?: () => void;
}

const BannerCard = ({
  id,
  campaignName,
  status,
  startDate,
  endDate,
  vehicleType,
  bannerImage,
  onClaim,
  onVerify
}: BannerCardProps) => {
  const statusColors = {
    available: 'bg-blue-100 text-blue-800',
    assigned: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="h-40 bg-gray-200 relative">
        {bannerImage ? (
          <img 
            src={bannerImage} 
            alt={campaignName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-100">
            <span className="text-indigo-500 font-medium">No banner image</span>
          </div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2 truncate">{campaignName}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-medium">{formatDate(startDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">End Date</p>
            <p className="font-medium">{formatDate(endDate)}</p>
          </div>
          <div>
            <p className="text-gray-500">Vehicle Type</p>
            <p className="font-medium capitalize">{vehicleType}</p>
          </div>
          <div>
            <p className="text-gray-500">Daily Rate</p>
            <p className="font-medium">₹{vehicleType === 'auto' ? '70' : '100'}</p>
          </div>
        </div>
        
        {status === 'available' && onClaim && (
          <button 
            onClick={onClaim}
            className="block w-full text-center py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Claim Banner
          </button>
        )}
        
        {(status === 'assigned' || status === 'verified') && onVerify && (
          <button 
            onClick={onVerify}
            className="block w-full text-center py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Verify Placement
          </button>
        )}
        
        {!onClaim && !onVerify && (
          <Link 
            to={`/driver/my-banners/${id}`} 
            className="block w-full text-center py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default BannerCard;