import { Link } from 'react-router-dom';
import { ArrowRight, Users, Trophy, Calendar, MapPin } from 'lucide-react';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage: 'url(/img/xl-main-img.jpg)' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Welcome to XL Lake Nona</h1>
            <p className="text-xl mb-8">Never Stop Playing</p>
            <Link 
              to="/sessions" 
              className="bg-xl-green text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center space-x-2"
            >
              <span>View Sessions</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose XL Soccer World?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-xl-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Coaching</h3>
              <p className="text-gray-600">Professional coaches dedicated to developing well-rounded soccer players.</p>
            </div>
            <div className="text-center">
              <div className="bg-xl-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Proven Results</h3>
              <p className="text-gray-600">Our program focuses on skills, teamwork, and game understanding.</p>
            </div>
            <div className="text-center">
              <div className="bg-xl-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Multiple sessions available to fit your busy schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-xl-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join our community and take your soccer skills to the next level.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-xl-red px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Register Now
            </Link>
            <Link 
              to="/sessions" 
              className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-xl-red transition-colors"
            >
              View Sessions
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Visit Our Facility</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="text-xl-red" size={24} />
                  <div>
                    <p className="font-semibold">XL Soccer World Nona</p>
                    <p>12314 Suttner Ave, Orlando, FL 32827</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  Located in the heart of Lake Nona, our state-of-the-art facility offers 
                  the perfect environment for soccer training and development.
                </p>
              </div>
            </div>
            <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map placeholder</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 