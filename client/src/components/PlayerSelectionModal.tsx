import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertCircle } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_FAMILY_MEMBERS } from '../graphql/queries';
import { Session, Player } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
import Error from './ui/Error';
import { useAuth } from '../hooks/useAuth';

interface PlayerSelectionModalProps {
  session: Session;
  onPlayerSelect: (player: Player) => void;
  onCancel: () => void;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({
  session,
  onPlayerSelect,
  onCancel
}) => {
  const { user } = useAuth();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { data: familyData, loading, error: queryError } = useQuery(GET_FAMILY_MEMBERS);

  const familyMembers = familyData?.familyMembers || [];

  // Helper function to check if player age matches the age range
  const isPlayerEligibleForAgeRange = (playerAge: number, ageRange: { minAge: number; maxAge: number } | undefined): boolean => {
    // If no age range is set, allow all players
    if (!ageRange) {
      return true;
    }
    
    // Check if player's age falls within the min and max age range
    return playerAge >= ageRange.minAge && playerAge <= ageRange.maxAge;
  };

  // Filter eligible players based on session requirements
  const eligiblePlayers = familyMembers.filter((member: any) => {
    
    // Calculate player's current age from birth date
    const today = new Date();
    const birthDate = new Date(member.birthDate);
    let playerAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      playerAge--;
    }
    
    // Check if player's age falls within the session's age range
    const ageMatch = isPlayerEligibleForAgeRange(playerAge, session.ageRange);
    
    // Check gender match for gender-specific sessions
    let genderMatch = true;
    if (session.demo !== 'coed') {
      const playerGender = member.sex === 'male' ? 'boys' : 'girls';
      genderMatch = playerGender === session.demo;
    }
    
    console.log('Player validation:', {
      playerName: member.name,
      playerAge,
      sessionAgeRange: session.ageRange,
      ageMatch,
      playerGender: member.sex,
      sessionDemo: session.demo,
      genderMatch,
      eligible: ageMatch && genderMatch
    });
    
    return ageMatch && genderMatch;
  });

  const handlePlayerSelect = () => {
    if (!selectedPlayerId) {
      setError('Please select a player');
      return;
    }

    const selectedPlayer = eligiblePlayers.find((player: any) => player.id === selectedPlayerId);
    if (selectedPlayer) {
      onPlayerSelect(selectedPlayer);
    }
  };

  const getAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading family members...</p>
          </div>
        </div>
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading family members</p>
            <Button onClick={onCancel} className="mt-4">Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Select Player"
      size="md"
    >
      <div className="text-center mb-6">
        <p className="text-sm text-gray-600">{session.name}</p>
        <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Age Range: {session.ageRange ? `${session.ageRange.minAge}-${session.ageRange.maxAge}` : 'All ages'}</span>
          <span className="mx-2">•</span>
          <Users className="h-4 w-4 mr-1" />
          <span>{session.demo}</span>
        </div>
      </div>

      {/* Eligible Players */}
      {eligiblePlayers.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Eligible Players</h4>
          <p className="text-sm text-gray-600 mb-4">
            None of your family members meet the requirements for this session.
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Age Range: {session.ageRange ? `${session.ageRange.minAge}-${session.ageRange.maxAge}` : 'All ages'}</p>
            <p>• Gender: {session.demo}</p>
          </div>
          <Button onClick={onCancel} className="mt-4">Close</Button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {eligiblePlayers.map((player: any) => (
              <div
                key={player.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPlayerId === player.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlayerId(player.id)}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {player.sex === 'male' ? (
                        <img 
                          src="https://thumbs.dreamstime.com/b/vector-illustration-soccer-player-action-isolated-gray-background-vector-clip-art-illustration-built-layers-115992617.jpg?w=768"
                          alt="Male Soccer Player"
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <img 
                          src="https://media.istockphoto.com/id/2077956375/vector/female-football-player-running-with-ball-soccer-low-poly-isolated-vector-illustration.jpg?s=612x612&w=0&k=20&c=dBZSZWRSev3OwCsudf1qE-DWXb0MgIN7i7k_zDyRamo="
                          alt="Female Soccer Player"
                          className="w-10 h-10 object-contain"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{player.name}</h4>
                    <p className="text-sm text-gray-600">
                      Age {getAge(player.birthDate)} • {player.sex === 'male' ? 'Male' : 'Female'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedPlayerId === player.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPlayerId === player.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <Error message={error} className="mb-4" />
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlayerSelect}
              disabled={!selectedPlayerId}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default PlayerSelectionModal; 