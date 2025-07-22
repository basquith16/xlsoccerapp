import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../../ui/Button';

interface SessionActionsProps {
  onCreateSession: () => void;
}

const SessionActions: React.FC<SessionActionsProps> = ({
  onCreateSession
}) => {
  return (
    <Button 
      onClick={onCreateSession}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Session
    </Button>
  );
};

export default SessionActions; 