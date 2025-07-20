import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FAMILY_MEMBERS } from '../graphql/queries';
import { ADD_FAMILY_MEMBER, REMOVE_FAMILY_MEMBER } from '../graphql/mutations';
import { GET_ME } from '../graphql/queries';
import AddFamilyMemberModal from './AddFamilyMemberModal';

interface FamilyMember {
  id: string;
  name: string;
  type: 'User' | 'Player';
  isMinor: boolean;
  email?: string;
  photo?: string;
  birthDate?: string;
}

const FamilySection: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: userData } = useQuery(GET_ME);
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            <div key={member.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{member.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.type === 'User' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {member.type}
                      </span>
                      {member.isMinor && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Minor
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {userData?.me?.familyId && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove family member"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                {member.email && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{member.email}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Birthday: {formatDate(member.birthDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Age: {getAge(member.birthDate)}</span>
                </div>
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