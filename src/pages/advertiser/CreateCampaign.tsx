import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Car, Upload, DollarSign, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../../components/Layout/MainLayout';
import { supabase } from '../../lib/supabase';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vehicleType: 'auto',
    startDate: '',
    duration: 7,
    bannerCount: 1,
  });
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Calculate cost based on vehicle type, duration, and banner count
  const ratePerDay = formData.vehicleType === 'auto' ? 70 : 100;
  const totalCost = ratePerDay * formData.duration * formData.bannerCount;

  // Calculate end date
  const getEndDate = () => {
    if (!formData.startDate) return '';
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + formData.duration);
    
    return endDate.toISOString().split('T')[0];
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      const numValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: numValue > 0 ? numValue : 1
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        toast.error('Only JPEG and PNG images are allowed');
        return;
      }
      
      setBannerImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!bannerImage) {
      toast.error('Please upload a banner image');
      return;
    }
    
    if (!formData.startDate) {
      toast.error('Please select a start date');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not found');
      
      // Get advertiser profile
      const { data: advertiserData, error: advertiserError } = await supabase
        .from('advertisers')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (advertiserError) throw advertiserError;
      if (!advertiserData) throw new Error('Advertiser profile not found');

      // Upload banner image
      const timestamp = Date.now();
      const fileExt = bannerImage.name.split('.').pop();
      const filePath = `banners/${user.id}/${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-banners')
        .upload(filePath, bannerImage);

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-banners')
        .getPublicUrl(filePath);

      // Calculate end date
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + formData.duration);

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          advertiser_id: advertiserData.id,
          name: formData.name,
          vehicle_type: formData.vehicleType,
          duration: formData.duration,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_cost: totalCost,
          banner_count: formData.bannerCount,
          remaining_banners: formData.bannerCount,
          banner_image: publicUrl,
          status: 'pending'
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      toast.success('Campaign created successfully!');
      navigate('/advertiser/campaigns');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Campaign</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g. Summer Sale Promotion"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            {/* Vehicle Type */}
            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <div className="relative">
                <select
                  id="vehicleType"
                  name="vehicleType"
                  required
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  <option value="auto">Auto (₹70/day)</option>
                  <option value="car">Car (₹100/day)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Car size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.startDate}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Calendar size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            
            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (days)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                min="1"
                max="90"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.duration}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                Campaign will run from {formData.startDate || 'start date'} to {getEndDate() || 'end date'}
              </p>
            </div>
            
            {/* Banner Count */}
            <div>
              <label htmlFor="bannerCount" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Banners
              </label>
              <input
                type="number"
                id="bannerCount"
                name="bannerCount"
                min="1"
                max="50"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.bannerCount}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                How many vehicles do you want to display your ad on?
              </p>
            </div>
            
            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {imagePreview ? (
                  <div className="space-y-4 text-center">
                    <img 
                      src={imagePreview} 
                      alt="Banner preview" 
                      className="mx-auto h-40 object-contain"
                    />
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                      onClick={() => {
                        setBannerImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload size={40} className="mx-auto text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="banner-image"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="banner-image"
                          name="banner-image"
                          type="file"
                          accept="image/jpeg, image/png"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Cost Summary */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <DollarSign size={20} className="text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Cost Summary</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rate per day:</span>
                  <span className="font-medium">₹{ratePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">{formData.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Number of banners:</span>
                  <span className="font-medium">{formData.bannerCount}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-medium">Total cost:</span>
                  <span className="font-bold text-indigo-600">₹{totalCost}</span>
                </div>
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle size={20} className="text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      By creating this campaign, you agree to our terms and conditions. Banners will be displayed on vehicles only after they are claimed by drivers and verified.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Creating Campaign...
                  </>
                ) : (
                  'Create Campaign'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateCampaign;