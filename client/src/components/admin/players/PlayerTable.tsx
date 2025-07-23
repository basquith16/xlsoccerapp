import React from 'react';
import { Eye, Edit, Trash2, User, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../ui/Card';
import { Player } from '../../../types';

interface PlayerTableProps {
  players: Player[];
  onViewPlayer: (player: Player) => void;
  onEditPlayer: (player: Player) => void;
  onDeletePlayer: (player: Player) => void;
}

const PlayerTable: React.FC<PlayerTableProps> = React.memo(({
  players,
  onViewPlayer,
  onEditPlayer,
  onDeletePlayer
}: PlayerTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getPlayerPhotoUrl = (profImg?: string) => {
    if (!profImg || profImg === 'default.jpg') {
      return '/img/players/default.jpg';
    }
    
    if (profImg.startsWith('http')) {
      return profImg;
    }
    
    if (profImg.startsWith('/img/')) {
      return profImg;
    }
    
    return `/img/players/${profImg}`;
  };

  const getSexBadge = (sex: string) => {
    const config = {
      male: { text: 'Male', class: 'bg-blue-100 text-blue-800' },
      female: { text: 'Female', class: 'bg-pink-100 text-pink-800' },
      other: { text: 'Other', class: 'bg-gray-100 text-gray-800' }
    };
    return config[sex as keyof typeof config] || { text: sex, class: 'bg-gray-100 text-gray-800' };
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Player
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age/Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sex
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waiver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player: Player) => {
              const sexBadge = getSexBadge(player.sex);
              const age = calculateAge(player.birthDate);
              
              return (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={getPlayerPhotoUrl(player.profImg)}
                          alt={player.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <User className="h-3 w-3 mr-1 text-gray-400" />
                          {player.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(player.birthDate)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{age} years old</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        player.isMinor 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {player.isMinor ? 'Minor' : 'Adult'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${sexBadge.class}`}>
                      {sexBadge.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium flex items-center">
                        <Shield className="h-3 w-3 mr-1 text-gray-400" />
                        {player.parent?.name || 'No parent assigned'}
                      </div>
                      {player.parent?.email && (
                        <div className="text-xs text-gray-500">
                          {player.parent.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      player.waiverSigned 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {player.waiverSigned ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Signed
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewPlayer(player)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Player"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditPlayer(player)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit Player"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeletePlayer(player)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Player"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {players.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No players found</p>
          </div>
        )}
      </div>
    </Card>
  );
});

PlayerTable.displayName = 'PlayerTable';

export default PlayerTable;