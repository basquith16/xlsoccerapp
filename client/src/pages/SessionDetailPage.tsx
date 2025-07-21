import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Star, Calendar, Clock, Users, MapPin, DollarSign, User } from 'lucide-react';
import Button from '../components/ui/Button';
import PaymentForm from '../components/PaymentForm';
import PlayerSelectionModal from '../components/PlayerSelectionModal';
import { useAuth } from '../hooks/useAuth';
import { GET_SESSION_BY_SLUG } from '../graphql/queries';
import { CREATE_BOOKING } from '../graphql/mutations';
import { useMyBookings } from '../services/graphqlService';
import { Session, Player } from '../types';

const SessionDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Use GraphQL hooks
  const { data: sessionData, loading, error, refetch } = useQuery(GET_SESSION_BY_SLUG, {
    variables: { slug: slug || '' },
  });
  const [createBookingMutation] = useMutation(CREATE_BOOKING, {
    update: (cache, { data }) => {
      if (data?.createBooking) {
        // Refetch the bookings query to update the cache
        cache.evict({ fieldName: 'bookings' });
        cache.gc();
      }
    }
  });

  // Extract session from GraphQL response
  const session = sessionData?.sessionBySlug;

  const handleBooking = () => {
    if (!session) return;
    setShowPlayerSelection(true);
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setShowPlayerSelection(false);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setBookingSuccess(true);
    setShowPaymentForm(false);
    setSelectedPlayer(null);
    setTimeout(() => {
      navigate('/account');
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setBookingError(error);
    setShowPaymentForm(false);
    setSelectedPlayer(null);
  };

  const handleCancelPlayerSelection = () => {
    setShowPlayerSelection(false);
    setSelectedPlayer(null);
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setSelectedPlayer(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" role="status" aria-label="Loading session details">
          <span className="sr-only">Loading session details...</span>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Session Not Found</h2>
          <p className="text-slate-700 mb-4">{String(error) || 'The session you are looking for does not exist.'}</p>
          <Link to="/sessions">
            <Button>Back to Sessions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/sessions" className="text-slate-500 hover:text-slate-700 focus:outline-none focus:text-slate-700">
                  Sessions
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-slate-400 mx-2" aria-hidden="true">/</span>
                  <span className="text-slate-900">{session.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Session Images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {session.images && session.images[0] ? (
                <img
                  src={session.images[0].startsWith('/img/') ? session.images[0] : `/img/sessions/${session.images[0]}`}
                  alt={session.name}
                  className="w-full h-96 object-cover"
                />
              ) : session.coverImage ? (
                <img
                  src={session.coverImage.startsWith('/img/') ? session.coverImage : `/img/sessions/${session.coverImage}`}
                  alt={session.name}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <img
                  src="/img/soccer-ball.png"
                  alt="No image available"
                  className="w-full h-96 object-cover opacity-40"
                />
              )}
            </div>

            {/* Session Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {session.sport}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                    {session.demo}
                  </span>
                </div>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                  <span className="ml-1 text-sm text-slate-700">4.8 (24 reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-slate-900 mb-4">{session.name}</h1>

              {session.description && (
                <div className="prose max-w-none mb-6">
                  <p className="text-slate-600 leading-relaxed">{session.description}</p>
                </div>
              )}

              {/* Session Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-slate-400 mr-3" aria-hidden="true" />
                    <div>
                      <p className="text-detail font-semibold text-slate-900">Age Range</p>
                      <p className="text-detail text-slate-700">
                        {session.ageRange ? `${session.ageRange.minAge}-${session.ageRange.maxAge}` : 'All ages'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-slate-400 mr-3" aria-hidden="true" />
                    <div>
                      <p className="text-detail font-semibold text-slate-900">Time</p>
                      <p className="text-detail text-slate-700">
                        {session.timeStart} - {session.timeEnd}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-slate-400 mr-3" aria-hidden="true" />
                    <div>
                      <p className="text-detail font-semibold text-slate-900">Roster Limit</p>
                      <p className="text-detail text-slate-700">{session.rosterLimit} players</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-slate-400 mr-3" aria-hidden="true" />
                    <div>
                      <p className="text-detail font-semibold text-slate-900">Location</p>
                      <p className="text-detail text-slate-700">SOFIVE Soccer Center Nona</p>
                    </div>
                  </div>

                  {session.duration && (
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-slate-400 mr-3" aria-hidden="true" />
                      <div>
                        <p className="text-detail font-semibold text-slate-900">Duration</p>
                        <p className="text-detail text-slate-700">{session.duration}</p>
                      </div>
                    </div>
                  )}

                  {session.trainer && (
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-slate-400 mr-3" aria-hidden="true" />
                      <div>
                        <p className="text-detail font-semibold text-slate-900">Coach</p>
                        <p className="text-detail text-slate-700">{session.trainer}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start Dates */}
            {session.startDates && session.startDates.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Start Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {session.startDates.map((date: any, index: number) => (
                    <div key={index} className="flex items-center p-3 bg-slate-50 rounded-md">
                      <Calendar className="h-4 w-4 text-slate-400 mr-2" aria-hidden="true" />
                      <span className="text-sm text-slate-700">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-3xl font-bold text-slate-900">${session.price}</span>
                </div>
                {session.priceDiscount && (
                  <p className="text-sm text-slate-600 line-through">${session.priceDiscount}</p>
                )}
              </div>

              {bookingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md" role="alert">
                  <p className="mb-2">{bookingError}</p>
                  {bookingError.includes('already booked') && (
                    <Link to="/account">
                      <Button size="sm" className="mt-2 bg-red-600 text-white hover:bg-red-700">
                        View My Bookings
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {bookingSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md" role="alert">
                  Booking successful! You will be redirected to your account page.
                </div>
              )}

              {isAuthenticated ? (
                <Button
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  {bookingLoading ? 'Processing...' : 'Book Session'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 text-center">
                    Please log in to book this session
                  </p>
                  <Link to="/login">
                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Log In</Button>
                  </Link>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-900 mb-3">What's included:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-detail text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" aria-hidden="true"></span>
                    Professional coaching
                  </li>
                  <li className="flex items-center text-detail text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" aria-hidden="true"></span>
                    Equipment provided
                  </li>
                  <li className="flex items-center text-detail text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" aria-hidden="true"></span>
                    Progress tracking
                  </li>
                  <li className="flex items-center text-detail text-slate-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" aria-hidden="true"></span>
                    End-of-session report
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Overlay */}
      {showPaymentForm && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <PaymentForm
              sessionId={session.id}
              sessionName={session.name}
              price={session.price}
              playerId={selectedPlayer.id}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleCancelPayment}
            />
          </div>
        </div>
      )}

      {/* Player Selection Modal */}
      {showPlayerSelection && (
        <PlayerSelectionModal
          session={session}
          onPlayerSelect={handlePlayerSelect}
          onCancel={handleCancelPlayerSelection}
        />
      )}
    </div>
  );
};

export default SessionDetailPage; 