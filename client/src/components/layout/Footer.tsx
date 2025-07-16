const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-4">XL Soccer World Nona</h3>
            <div className="space-y-2">
              <p>12314 Suttner Ave</p>
              <p>Orlando, FL 32827</p>
              <p>Phone: (407) 863-3101</p>
              <p>Email: nona@xlsportsworld.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-gray-300 transition-colors">Home</a></li>
              <li><a href="/sessions" className="hover:text-gray-300 transition-colors">Training Sessions</a></li>
              <li><a href="/register" className="hover:text-gray-300 transition-colors">Register</a></li>
              <li><a href="/login" className="hover:text-gray-300 transition-colors">Login</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li>Youth Leagues</li>
              <li>Adult Leagues</li>
              <li>Soccer Camps</li>
              <li>Field Rentals</li>
              <li>Birthday Parties</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>&copy; 2024 XL Soccer World. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 