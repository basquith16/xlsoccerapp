import React, { useState } from 'react';
import { Calendar, MapPin, Users, ChevronDown, ChevronUp, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMyBookings, useFamilyMembers } from '../services/graphqlService';
import { Session, Player } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Error from '../components/ui/Error';
import FamilySection from '../components/FamilySection';
import EditProfileModal from '../components/EditProfileModal';
import BillingPanel from '../components/BillingPanel';

const AccountPage = () => {
  const { user, logout } = useAuth();
  const { data: bookingsData, loading, error, refetch } = useMyBookings();
  const { data: familyData, refetch: refetchFamilyMembers } = useFamilyMembers();
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [activePlayerTab, setActivePlayerTab] = useState<string>('all');
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Helper function to get user photo URL
  const getUserPhotoUrl = (userPhoto?: string) => {
    if (!userPhoto) {
      return '/img/users/default.jpg';
    }
    
    // If it's already a full URL (Cloudinary), return as is
    if (userPhoto.startsWith('http')) {
      return userPhoto;
    }
    
    // If it's a local file path, return the full path
    if (userPhoto.startsWith('/img/')) {
      return userPhoto;
    }
    
    // Default to users directory
    return `/img/users/${userPhoto}`;
  };

  // Refetch family members when user changes
  React.useEffect(() => {
    if (user && refetchFamilyMembers) {
      refetchFamilyMembers();
    }
  }, [user, refetchFamilyMembers]);

  // Extract bookings and family members from GraphQL response
  const myBookings = bookingsData?.bookings || [];
  const familyMembers = familyData?.familyMembers || [];

  // Group bookings by player
  const bookingsByPlayer = myBookings.reduce((acc: any, booking: any) => {
    const playerId = booking.player?.id || 'unknown';
    if (!acc[playerId]) {
      acc[playerId] = [];
    }
    acc[playerId].push(booking);
    return acc;
  }, {});

  // Get current player's bookings
  const currentPlayerBookings = activePlayerTab === 'all' 
    ? myBookings 
    : bookingsByPlayer[activePlayerTab] || [];

  const handleLogout = async () => {
    await logout();
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
  };

  const handleProfileUpdateSuccess = () => {
    // Refresh the page to get updated user data
    window.location.reload();
  };

  const toggleBookingExpansion = (bookingId: string) => {
    setExpandedBookings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
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
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="mt-1 text-gray-600">Welcome back, {user.name}!</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <div className="lg:col-span-1">
            <Card>
              <div className="text-center mb-6">
                {user.photo ? (
                  <img
                    src={getUserPhotoUrl(user.photo)}
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
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Family and Sessions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Family Section */}
            <FamilySection />

            {/* Billing Panel */}
            <BillingPanel />

            {/* My Sessions */}
            <Card>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Booked Sessions</h3>

              {loading ? (
                <Loading text="Loading your sessions..." />
              ) : error ? (
                <div className="text-center py-8">
                  <Error message="An error occurred while loading your sessions" />
                  <div className="mt-4">
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                  </div>
                </div>
              ) : myBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You haven't booked any sessions yet.</p>
                  <Button onClick={() => window.location.href = '/sessions'}>
                    Browse Sessions
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Player Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActivePlayerTab('all')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activePlayerTab === 'all'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        All Family
                      </button>
                      {familyMembers.map((player: Player) => (
                        <button
                          key={player.id}
                          onClick={() => setActivePlayerTab(player.id)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activePlayerTab === player.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {player.name}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm text-gray-600">
                      {currentPlayerBookings.length} session{currentPlayerBookings.length !== 1 ? 's' : ''} booked
                      {activePlayerTab !== 'all' && ` for ${familyMembers.find((p: Player) => p.id === activePlayerTab)?.name}`}
                    </span>
                  </div>

                  {currentPlayerBookings.map((booking: any) => {
                    if (!booking) return null;
                    const isExpanded = expandedBookings.has(booking.id);
                    
                    return (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {booking.session.sport}
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {booking.session.demo}
                              </span>
                              {booking.player && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {booking.player.name}
                                </span>
                              )}
                            </div>
                          
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {booking.session.name}
                            </h4>

                            <div className="flex items-center text-sm text-gray-600">
                              <span>${booking.session.price}</span>
                              <span className="mx-2">•</span>
                              <span>Player: {booking.player?.name || 'Unknown'}</span>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>Coach: {booking.session.trainer && booking.session.trainer.trim() !== '' ? booking.session.trainer : 'TBD'}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-2" />
                                    <span>Player: {booking.player?.name || 'Unknown'}</span>
                                  </div>
                                  {booking.session.startDates && booking.session.startDates.length > 0 && (
                                    <div className="flex items-start">
                                      <Calendar className="h-4 w-4 mr-2 mt-0.5" />
                                      <div>
                                        <span className="font-medium">Start Dates:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {booking.session.startDates.map((date: string, index: number) => (
                                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                              {new Date(date).toLocaleDateString()}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => toggleBookingExpansion(booking.id)}
                              className="flex items-center space-x-1"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  <span>Hide Details</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  <span>View Details</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && user && (
        <EditProfileModal
          user={user}
          onClose={handleCloseEditProfile}
          onSuccess={handleProfileUpdateSuccess}
        />
      )}
    </div>
  );
};

export default AccountPage; 