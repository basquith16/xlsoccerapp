import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../../ui/Button';

interface PeriodActionsProps {
  onCreatePeriod: () => void;
}

const PeriodActions: React.FC<PeriodActionsProps> = ({
  onCreatePeriod
}) => {
  return (
    <Button 
      onClick={onCreatePeriod}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Period
    </Button>
  );
};

export default PeriodActions; 