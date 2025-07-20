import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Trophy, Calendar } from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src="/bg-vid.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800"></div>
        </video>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to SOFIVE Soccer Center
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Premier youth soccer training, leagues, and camps in Lake Nona. 
            Develop skills, build character, and have fun!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sessions">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                View Sessions
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose SOFIVE Soccer Center?
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              We provide the best youth soccer experience with professional coaching, 
              state-of-the-art facilities, and a focus on player development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Expert Coaching
              </h3>
              <p className="text-slate-700">
                Professional coaches with years of experience in youth development 
                and competitive soccer.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Quality Programs
              </h3>
              <p className="text-slate-700">
                Comprehensive training programs designed for all skill levels, 
                from beginners to advanced players.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Flexible Scheduling
              </h3>
              <p className="text-slate-700">
                Multiple session times and programs to fit your family's schedule 
                and your child's development needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Our Programs
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              From recreational training to competitive leagues, we have programs 
              for every young soccer player.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Soccer Tots</h3>
              <p className="text-slate-700 text-sm mb-4">
                Introduction to soccer for ages 3-5
              </p>
              <Link to="/sessions">
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-700 hover:bg-slate-600 hover:text-white">
                  Learn More
                </Button>
              </Link>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Training</h3>
              <p className="text-slate-700 text-sm mb-4">
                Skill development for all ages
              </p>
              <Link to="/sessions">
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-700 hover:bg-slate-600 hover:text-white">
                  Learn More
                </Button>
              </Link>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Leagues</h3>
              <p className="text-slate-700 text-sm mb-4">
                Competitive and recreational leagues
              </p>
              <Link to="/sessions">
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-700 hover:bg-slate-600 hover:text-white">
                  Learn More
                </Button>
              </Link>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Camps</h3>
              <p className="text-slate-700 text-sm mb-4">
                Seasonal and holiday camps
              </p>
              <Link to="/sessions">
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-700 hover:bg-slate-600 hover:text-white">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of families who trust SOFIVE Soccer Center for their child's 
            soccer development and fun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                Register Now
              </Button>
            </Link>
            <Link to="/sessions">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900">
                Browse Sessions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 