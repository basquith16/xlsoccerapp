import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, Users, DollarSign, Clock, User } from 'lucide-react';
import { useSessions } from '../services/graphqlService';
import { Session } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Error from '../components/ui/Error';

const SessionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedDemo, setSelectedDemo] = useState<string>('all');
  const [displayLimit, setDisplayLimit] = useState(12); // Show 12 sessions initially

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(12);
  }, [searchTerm, selectedSport, selectedDemo]);

  // Use GraphQL hook to fetch sessions with a high limit to get all sessions
  const { data: sessionsData, loading, error, refetch } = useSessions(100);

  // Extract sessions from the connection type
  const sessions = sessionsData?.sessions?.nodes || [];

  const filteredSessions = Array.isArray(sessions) ? sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'all' || session.sport === selectedSport;
    const matchesDemo = selectedDemo === 'all' || session.demo === selectedDemo;
    
    return matchesSearch && matchesSport && matchesDemo;
  }) : [];

  // Get sessions to display (limited by displayLimit)
  const displayedSessions = filteredSessions.slice(0, displayLimit);
  const hasMoreSessions = displayedSessions.length < filteredSessions.length;

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 12);
  };

  const sports = ['soccer', 'basketball', 'volleyball', 'camp', 'futsal', 'football'];
  const demos = ['boys', 'girls', 'coed'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Loading Sessions</h2>
          <p className="text-slate-700 mb-4">{String(error) || 'An error occurred while loading sessions'}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Available Sessions</h1>
          <p className="mt-2 text-slate-600">Find the perfect session for your child</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sport Filter */}
          <div>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sports</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Demo Filter */}
          <div>
            <select
              value={selectedDemo}
              onChange={(e) => setSelectedDemo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Demographics</option>
              {demos.map(demo => (
                <option key={demo} value={demo}>
                  {demo.charAt(0).toUpperCase() + demo.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-end text-sm text-slate-600">
            Showing {displayedSessions.length} of {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Sessions Grid */}
      {loading ? (
        <Loading size="lg" text="Loading sessions..." />
      ) : error ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Error Loading Sessions</h2>
          <Error message={String(error) || 'An error occurred while loading sessions'} />
          <div className="mt-4">
            <Button onClick={refetch}>
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSessions.map((session) => (
            <Card key={session.id} padding="none" hover className="overflow-hidden">
              <div className="relative">
                {session.images && session.images[0] ? (
                  <img
                    src={session.images[0].startsWith('/img/') ? session.images[0] : `/img/sessions/${session.images[0]}`}
                    alt={session.name}
                    className="w-full h-48 object-cover"
                  />
                ) : session.coverImage ? (
                  <img
                    src={session.coverImage.startsWith('/img/') ? session.coverImage : `/img/sessions/${session.coverImage}`}
                    alt={session.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <img
                    src="/img/soccer-ball.png"
                    alt="No image available"
                    className="w-full h-48 object-cover opacity-40"
                  />
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {session.sport}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{session.name}</h3>
                <p className="text-slate-600 mb-4 line-clamp-2">{session.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {session.startDates && session.startDates.length > 0 
                        ? session.startDates.map((date: string, index: number) => (
                            <span key={index}>
                              {new Date(date).toLocaleDateString()}
                              {index < session.startDates.length - 1 ? ', ' : ''}
                            </span>
                          ))
                        : 'TBD'
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{session.timeStart} - {session.timeEnd}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{session.demo}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>${session.price}</span>
                  </div>
                </div>
                
                <Link to={`/session/${session.slug}`}>
                  <Button className="w-full">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMoreSessions && (
        <div className="text-center mt-8">
          <Button onClick={handleLoadMore} variant="outline">
            Load More Sessions
          </Button>
        </div>
      )}

      {/* No More Sessions Message */}
      {!hasMoreSessions && filteredSessions.length > 0 && (
        <div className="text-center mt-8 py-4">
          <p className="text-slate-600">You've seen all available sessions!</p>
        </div>
      )}
    </div>
  );
};

export default SessionsPage; 