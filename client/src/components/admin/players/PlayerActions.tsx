import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../../ui/Button';

interface PlayerActionsProps {
  onCreatePlayer: () => void;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({ onCreatePlayer }) => {
  return (
    <Button
      onClick={onCreatePlayer}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Player
    </Button>
  );
};

export default PlayerActions;