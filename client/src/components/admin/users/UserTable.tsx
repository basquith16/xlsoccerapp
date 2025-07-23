import React from 'react';
import { Eye, Edit, Trash2, Mail, Calendar, Shield } from 'lucide-react';
import Card from '../../ui/Card';

interface UserTableProps {
  users: any[];
  onViewUser: (user: any) => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (user: any) => void;
}

const UserTable: React.FC<UserTableProps> = React.memo(({
  users,
  onViewUser,
  onEditUser,
  onDeleteUser
}: UserTableProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { text: 'Admin', class: 'bg-red-100 text-red-800' },
      coach: { text: 'Coach', class: 'bg-blue-100 text-blue-800' },
      user: { text: 'User', class: 'bg-green-100 text-green-800' }
    };
    return roleConfig[role as keyof typeof roleConfig] || { text: role, class: 'bg-gray-100 text-gray-800' };
  };

  const getStatusBadge = (active: boolean) => {
    return active 
      ? { text: 'Active', class: 'bg-green-100 text-green-800' }
      : { text: 'Inactive', class: 'bg-red-100 text-red-800' };
  };

  const getUserPhotoUrl = (userPhoto?: string) => {
    if (!userPhoto) {
      return '/img/users/default.jpg';
    }
    
    if (userPhoto.startsWith('http')) {
      return userPhoto;
    }
    
    if (userPhoto.startsWith('/img/')) {
      return userPhoto;
    }
    
    return `/img/users/${userPhoto}`;
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
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
            {users.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              const statusBadge = getStatusBadge(user.active);
              const isSystemUser = user.email === 'tbd@system.local';
              
              return (
                <tr key={user.id} className={`hover:bg-gray-50 ${isSystemUser ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={getUserPhotoUrl(user.photo)}
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {user.name}
                          {isSystemUser && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              System
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${roleBadge.class}`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {roleBadge.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(user.joinedDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      user.waiverSigned 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.waiverSigned ? 'Signed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View User"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditUser(user)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.email === 'tbd@system.local' ? (
                        <button
                          disabled
                          className="text-gray-400 cursor-not-allowed"
                          title="Cannot delete TBD coach - system default"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
});

UserTable.displayName = 'UserTable';

export default UserTable; 