import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionService } from '../services/sessionService';
import { Session } from '../types';

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await sessionService.getAllSessions();
      console.log('Sessions response:', response);
      
      if (
        response.status === 'success' &&
        response.data &&
        Array.isArray((response.data as any).sessions)
      ) {
        setSessions((response.data as any).sessions);
      } else if (response.status === 'success' && Array.isArray(response.data)) {
        setSessions(response.data);
      } else {
        console.error('Invalid sessions response:', response);
        setError('Failed to load sessions - invalid data format');
        setSessions([]);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('An error occurred while loading sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#6B1B1C]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Sessions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchSessions}
            className="bg-[#6B1B1C] text-white px-6 py-2 rounded-full hover:bg-[#5a1516] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-[#f7f7f7] min-h-screen">
      <h1 className="page-title">Available Training, Leagues, and Camps</h1>
      
      <div className="card-container">
        {sessions.map((session) => (
          <Link key={session._id} to={`/session/${session.slug}`} className="card">
            <div className="card__header">
              <div className="card__picture">
                <div className="card__picture-overlay"></div>
                {session.image && session.image[0] ? (
                  <img
                    className="card__picture-img"
                    src={session.image[0].startsWith('/img/') ? session.image[0] : `/img/sessions/${session.image[0]}`}
                    alt={session.name}
                  />
                ) : (
                  <img
                    className="card__picture-img"
                    src="/img/soccer-ball.png"
                    alt="No image available"
                  />
                )}
              </div>
              <h3 className="heading-tertirary">
                <span>{session.name}</span>
              </h3>
            </div>
            
            <div className="card__details">
              <h4 className="card__sub-heading">Training for</h4>
              <p className="card__text">{session.description}</p>
              
              <div className="card__data">
                <svg className="card__icon">
                  <use href="/img/icons.svg#icon-map-pin"></use>
                </svg>
                <span>Lake Nona</span>
              </div>
              
              <div className="card__data">
                <svg className="card__icon">
                  <use href="/img/icons.svg#icon-calendar"></use>
                </svg>
                <span>
                  {session.startDates && session.startDates[0] 
                    ? new Date(session.startDates[0]).toLocaleDateString('en-US')
                    : 'TBD'
                  }
                </span>
              </div>
              
              {session.trainers && session.trainers.map((trainer, index) => (
                <div key={index} className="card__data">
                  <svg className="card__icon">
                    <use href="/img/icons.svg#icon-clipboard"></use>
                  </svg>
                  <span>{trainer.name}</span>
                </div>
              ))}
              
              <div className="card__data">
                <svg className="card__icon">
                  <use href="/img/icons.svg#icon-user"></use>
                </svg>
                <span>{session.rosterLimit} spots left</span>
              </div>
            </div>
            
            <div className="card__footer">
              <div className="price-info">
                <span className="card__footer-value">${session.price}</span>
                {' for '}
                <span className="card__footer-value">{session.duration}</span>
              </div>
              <span className="btn btn--red btn--smallDetails">
                Register
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default SessionsPage; 