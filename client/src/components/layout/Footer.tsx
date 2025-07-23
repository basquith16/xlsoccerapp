import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  compact?: boolean;
}

const Footer: React.FC<FooterProps> = ({ compact = false }) => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'py-4' : 'py-12'}`}>
        {compact ? (
          // Compact footer for admin
          <div className="text-center">
            <p className="text-slate-300 text-sm">
              © {new Date().getFullYear()} SOFIVE Soccer Center. All rights reserved.
            </p>
          </div>
        ) : (
          // Full footer for public pages
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <img 
                    src="/logo.png" 
                    alt="SOFIVE Lake Nona" 
                    className="h-16 w-auto"
                  />
                </div>
                <p className="text-slate-300 mb-4">
                  Premier youth soccer training, leagues, and camps in Lake Nona. 
                  We focus on developing skills, building character, and having fun!
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-slate-300">
                    <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
                    <span>Lake Nona, Orlando, FL</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                    <a href="tel:+1234567890" className="hover:text-blue-300 transition-colors">
                      (123) 456-7890
                    </a>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
                    <a href="mailto:info@xlsoccerworld.com" className="hover:text-blue-300 transition-colors">
                      info@xlsoccerworld.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/" className="text-slate-300 hover:text-blue-300 transition-colors focus:outline-none focus:text-blue-300">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/sessions" className="text-slate-300 hover:text-blue-300 transition-colors focus:outline-none focus:text-blue-300">
                      Sessions
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="text-slate-300 hover:text-blue-300 transition-colors focus:outline-none focus:text-blue-300">
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-slate-300 hover:text-blue-300 transition-colors focus:outline-none focus:text-blue-300">
                      Login
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                <div className="space-y-2">
                  <p className="text-slate-300">
                    <strong>Address:</strong><br />
                    SOFIVE Soccer Center<br />
                    Lake Nona, Orlando, FL
                  </p>
                  <p className="text-slate-300">
                    <strong>Hours:</strong><br />
                    Mon-Fri: 9:00 AM - 8:00 PM<br />
                    Sat-Sun: 8:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-700 mt-8 pt-8 text-center">
              <p className="text-slate-300">
                © {new Date().getFullYear()} SOFIVE Soccer Center. All rights reserved.
              </p>
            </div>
          </>
        )}
      </div>
    </footer>
  );
};

export default Footer; 