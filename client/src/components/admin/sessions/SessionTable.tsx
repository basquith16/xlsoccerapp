import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Card from '../../ui/Card';
import { Session } from '../../../types';

interface SessionTableProps {
  sessions: Session[];
  onViewSession: (session: Session) => void;
  onEditSession: (session: Session) => void;
  onDeleteSession: (session: Session) => void;
}

const SessionTable: React.FC<SessionTableProps> = React.memo(({
  sessions,
  onViewSession,
  onEditSession,
  onDeleteSession
}: SessionTableProps) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Session
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coach
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.map((session: Session) => (
              <tr key={session.id} className="hover:bg-gray-50">
                <td className="px-6 whitespace-nowrap" style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem' }}>
                  <div className="max-w-xs">
                    <div className="font-medium text-gray-900 truncate" style={{ fontSize: '1.2rem' }}>{session.name}</div>
                  </div>
                </td>
                <td className="px-6 whitespace-nowrap text-gray-900" style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem', fontSize: '1.2rem' }}>
                  {session.trainer || 'Not assigned'}
                </td>
                <td className="px-6 whitespace-nowrap text-gray-900" style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem', fontSize: '1.2rem' }}>
                  ${session.price}
                </td>
                <td className="px-6 whitespace-nowrap text-gray-900" style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem', fontSize: '1.2rem' }}>
                  {session.rosterLimit} players
                </td>
                <td className="px-6 whitespace-nowrap" style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem' }}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    session.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {session.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 whitespace-nowrap font-medium" style={{ paddingTop: '0.8rem', paddingBottom: '0.8rem', fontSize: '1.2rem' }}>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewSession(session)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Session"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditSession(session)}
                      className="text-green-600 hover:text-green-900"
                      title="Edit Session"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSession(session)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sessions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No sessions found</p>
          </div>
        )}
      </div>
    </Card>
  );
});

SessionTable.displayName = 'SessionTable';

export default SessionTable; 