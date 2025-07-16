import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import { useAuth } from '../hooks/useAuth';
import { Session } from '../types';

const SessionDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (slug) {
      fetchSession(slug);
    }
  }, [slug]);

  const fetchSession = async (sessionSlug: string) => {
    try {
      setLoading(true);
      const response = await sessionService.getSession(sessionSlug);
      console.log('Session response:', response);
      
      if (response.status === 'success' && response.data && (response.data as any).session) {
        setSession((response.data as any).session);
      } else {
        console.error('Invalid session response:', response);
        setError('Session not found');
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('An error occurred while loading the session');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!session) return;

    setBookingLoading(true);
    setBookingError('');

    try {
      const response = await sessionService.bookSession(session._id);
      if (response.status === 'success') {
        // Redirect to payment or show success message
        window.location.href = '/account'; // For now, redirect to account
      } else {
        setBookingError(response.message || 'Booking failed');
      }
    } catch (err) {
      setBookingError('An error occurred while booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6B1B1C]"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The session you are looking for does not exist.'}</p>
          <Link to="/sessions">
            <button className="bg-[#6B1B1C] text-white px-6 py-2 rounded-full hover:bg-[#5a1516] transition-colors">
              Back to Sessions
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Section Header with Hero Image */}
      <section className="section-header">
        <div className="header__hero">
          <div className="header__hero-overlay">&nbsp;</div>
          {session.image && session.image[0] ? (
            <img
              className="header__hero-img"
              src={session.image[0].startsWith('/img/') ? session.image[0] : `/img/sessions/${session.image[0]}`}
              alt={session.name}
            />
          ) : (
            <img
              className="header__hero-img"
              src="/img/soccer-ball.png"
              alt="No image available"
            />
          )}
        </div>

        <div className="heading-box">
          <h1 className="heading-primary">
            <span>{session.name}</span>
          </h1>
          <div className="heading-box__group">
            <div className="heading-box__detail">
              <svg className="heading-box__icon">
                <use href="/img/icons.svg#icon-clock"></use>
              </svg>
              <span className="heading-box__text">{session.duration}</span>
            </div>
            <div className="heading-box__detail">
              <svg className="heading-box__icon price">
                <use href="/img/icons.svg#icon-dollar-sign"></use>
              </svg>
              <span className="heading-box__text">{session.price}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Description */}
      <section className="section-description">
        <div className="overview-box">
          <div>
            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Quick facts</h2>
              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use href="/img/icons.svg#icon-calendar"></use>
                </svg>
                <span className="overview-box__label">Next date</span>
                <span className="overview-box__text">
                  {session.startDates && session.startDates[0] 
                    ? new Date(session.startDates[0]).toLocaleDateString('en-US')
                    : 'TBD'
                  }
                </span>
              </div>
              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use href="/img/icons.svg#icon-trending-up"></use>
                </svg>
                <span className="overview-box__label">Level</span>
                <span className="overview-box__text">
                  {session.birthYear !== undefined ? session.birthYear : 'Please Check With Front Desk'}
                </span>
              </div>
              <div className="overview-box__detail">
                <svg className="overview-box__icon">
                  <use href="/img/icons.svg#icon-user"></use>
                </svg>
                <span className="overview-box__label">Spots Left</span>
                <span className="overview-box__text">{session.rosterLimit}</span>
              </div>
            </div>

            <div className="overview-box__group">
              <h2 className="heading-secondary ma-bt-lg">Your Coaches</h2>
              {session.trainers && session.trainers.map((trainer, index) => (
                <div key={index} className="overview-box__detail">
                  <img
                    className="overview-box__img"
                    src={`/img/users/${trainer.photo || 'default'}.jpg`}
                    alt="Coach"
                  />
                  <span className="overview-box__text">{trainer.name}</span>
                </div>
              ))}
              <div className="overview-box__detail">
                <button 
                  className="btn btn--red span-all-rows"
                  onClick={handleBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Processing...' : 'Register'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="description-box">
          <h2 className="heading-secondary ma-bt-lg">About this session</h2>
          <p className="description__text">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          <p className="description__text">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum!
          </p>
        </div>
      </section>

      {/* Section Pictures */}
      {session.profileImages && session.profileImages[0] && (
        <section className="section-pictures">
          {session.profileImages[0].split(',').map((img, index) => (
            <div key={index} className="picture-box">
              <img
                className={`picture-box__img picture-box__img--${index + 1}`}
                src={`/img/sessions/${img.trim()}`}
                alt=""
              />
            </div>
          ))}
        </section>
      )}
    </>
  );
};

export default SessionDetailPage; 