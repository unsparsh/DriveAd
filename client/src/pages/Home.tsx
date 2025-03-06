import { Link } from 'react-router-dom';
import { Car, TrendingUp, Shield, Users } from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Transform Vehicles Into Moving Billboards
              </h1>
              <p className="text-lg md:text-xl mb-8">
                Place your ads on autos and cabs for maximum visibility. Reach your target audience on the go with DriveAds.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register?role=advertiser"
                  className="btn-primary text-center"
                >
                  Advertise Your Brand
                </Link>
                <Link
                  to="/register?role=driver"
                  className="btn-secondary text-center"
                >
                  Join as a Driver
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Auto with advertisement"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How DriveAds Works</h2>
            <p className="mt-4 text-xl text-gray-600">
              A simple process to get your ads on the road
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Campaign</h3>
              <p className="text-gray-600">
                Choose your vehicle type, campaign duration, and upload your banner design.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Drivers Claim Banners</h3>
              <p className="text-gray-600">
                Verified drivers select your campaign and place banners on their vehicles.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Visibility</h3>
              <p className="text-gray-600">
                Drivers verify banner placement with photos, ensuring your ad gets the visibility you paid for.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose DriveAds?</h2>
            <p className="mt-4 text-xl text-gray-600">
              Benefits for both advertisers and drivers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-indigo-600 mb-4">For Advertisers</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <TrendingUp className="text-indigo-500 mt-1 mr-3" size={20} />
                  <span>High visibility in busy urban areas</span>
                </li>
                <li className="flex items-start">
                  <Shield className="text-indigo-500 mt-1 mr-3" size={20} />
                  <span>Verified ad placement with photo proof</span>
                </li>
                <li className="flex items-start">
                  <Users className="text-indigo-500 mt-1 mr-3" size={20} />
                  <span>Reach diverse audiences across the city</span>
                </li>
                <li className="flex items-start">
                  <Car className="text-indigo-500 mt-1 mr-3" size={20} />
                  <span>Choose between autos (₹70/day) and cabs (₹100/day)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-amber-500 mb-4">For Drivers</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <TrendingUp className="text-amber-500 mt-1 mr-3" size={20} />
                  <span>Earn additional income with minimal effort</span>
                </li>
                <li className="flex items-start">
                  <Shield className="text-amber-500 mt-1 mr-3" size={20} />
                  <span>Simple verification process using your smartphone</span>
                </li>
                <li className="flex items-start">
                  <Users className="text-amber-500 mt-1 mr-3" size={20} />
                  <span>Choose campaigns that fit your schedule</span>
                </li>
                <li className="flex items-start">
                  <Car className="text-amber-500 mt-1 mr-3" size={20} />
                  <span>No interference with your regular business</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join DriveAds today and transform how you advertise or earn extra income as a driver.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register?role=advertiser"
              className="bg-white text-indigo-700 hover:bg-gray-100 font-medium py-3 px-6 rounded-md transition duration-200"
            >
              Register as Advertiser
            </Link>
            <Link
              to="/register?role=driver"
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-md transition duration-200"
            >
              Register as Driver
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;