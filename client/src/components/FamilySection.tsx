import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FAMILY_MEMBERS } from '../graphql/queries';
import { ADD_FAMILY_MEMBER, REMOVE_FAMILY_MEMBER } from '../graphql/mutations';
import AddFamilyMemberModal from './AddFamilyMemberModal';

interface FamilyMember {
  id: string;
  name: string;
  isMinor: boolean;
  birthDate: string;
  sex: string;
  profImg?: string;
}

const FamilySection: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: familyData, loading, refetch } = useQuery(GET_FAMILY_MEMBERS);

  const [addFamilyMember] = useMutation(ADD_FAMILY_MEMBER, {
    onCompleted: () => {
      setShowAddModal(false);
      refetch();
    },
    onError: (error) => {
      alert(`Error adding family member: ${error.message}`);
    }
  });

  const [removeFamilyMember] = useMutation(REMOVE_FAMILY_MEMBER, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      alert(`Error removing family member: ${error.message}`);
    }
  });

  const handleRemoveMember = (memberId: string) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      removeFamilyMember({ variables: { memberId } });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getAge = (birthDate?: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const familyMembers = familyData?.familyMembers || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Family</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Family Member
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : familyMembers.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">No family members yet.</p>
          <p className="text-sm text-gray-500">Add family members to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {familyMembers.map((member: FamilyMember) => (
            <div key={member.id} className="bg-white rounded-lg shadow-xl p-4 border hover:shadow-2xl transition-shadow relative flex flex-col h-64">
              {/* Age Badge - Top Right */}
              <div className="absolute top-2 right-2">
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                  {getAge(member.birthDate)}
                </span>
              </div>

              {/* Player Image - Much Bigger */}
              <div className="flex justify-center flex-1 items-center">
                <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center">
                  {member.sex === 'male' ? (
                    <img 
                      src="https://thumbs.dreamstime.com/b/vector-illustration-soccer-player-action-isolated-gray-background-vector-clip-art-illustration-built-layers-115992617.jpg?w=768"
                      alt="Male Soccer Player"
                      className="w-36 h-36 object-contain"
                    />
                  ) : (
                    <img 
                      src="https://media.istockphoto.com/id/2077956375/vector/female-football-player-running-with-ball-soccer-low-poly-isolated-vector-illustration.jpg?s=612x612&w=0&k=20&c=dBZSZWRSev3OwCsudf1qE-DWXb0MgIN7i7k_zDyRamo="
                      alt="Female Soccer Player"
                      className="w-36 h-36 object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Player Name - At the very bottom */}
              <div className="text-center mt-auto pt-2">
                <h3 className="font-medium text-gray-800 text-sm">{member.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddModal && (
        <AddFamilyMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={addFamilyMember}
        />
      )}
    </div>
  );
};

export default FamilySection; 