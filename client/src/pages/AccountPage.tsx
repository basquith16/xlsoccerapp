import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { sessionService } from '../services/sessionService';
import { Session } from '../types';
import Button from '../components/ui/Button';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const [mySessions, setMySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMySessions();
  }, []);

  const fetchMySessions = async () => {
    try {
      setLoading(true);
      const response = await sessionService.getMySessions();
      if (response.status === 'success' && response.data) {
        setMySessions(response.data);
      } else {
        setError('Failed to load your sessions');
      }
    } catch (err) {
      setError('An error occurred while loading your sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h2>
          <p className="text-gray-600">Please log in to view your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="mt-2 text-gray-600">Welcome back, {user.name}!</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                {user.photo ? (
                  <img
                    src={user.photo.startsWith('/img/') ? user.photo : `/img/users/${user.photo}`}
                    alt={user.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                ) : (
                  <img
                    src="/img/users/default.jpg"
                    alt="Default User"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                )}
                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Role:</span>
                  <span className="text-sm text-gray-600 capitalize">{user.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Member Since:</span>
                  <span className="text-sm text-gray-600">
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    user.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Waiver Signed:</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    user.waiverSigned 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.waiverSigned ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* My Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">My Sessions</h3>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-xl-green"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={fetchMySessions}>Try Again</Button>
                </div>
              ) : mySessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You haven't booked any sessions yet.</p>
                  <Button onClick={() => window.location.href = '/sessions'}>
                    Browse Sessions
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySessions.map((session) => (
                    <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {session.sport}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {session.demo}
                            </span>
                          </div>
                          
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">
                            {session.name}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Birth Year: {session.birthYear}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              <span>Limit: {session.rosterLimit}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>${session.price}</span>
                            </div>
                          </div>

                          {session.startDates && session.startDates.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Start Dates:</p>
                              <div className="flex flex-wrap gap-2">
                                {session.startDates.slice(0, 3).map((date, index) => (
                                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {new Date(date).toLocaleDateString()}
                                  </span>
                                ))}
                                {session.startDates.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{session.startDates.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage; 