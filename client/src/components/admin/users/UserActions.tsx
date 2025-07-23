import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../../ui/Button';

interface UserActionsProps {
  onCreateUser: () => void;
}

const UserActions: React.FC<UserActionsProps> = ({ onCreateUser }) => {
  return (
    <Button
      onClick={onCreateUser}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create User
    </Button>
  );
};

export default UserActions; 