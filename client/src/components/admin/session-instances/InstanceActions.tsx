import React from 'react';
import { Plus, Zap } from 'lucide-react';
import Button from '../../ui/Button';

interface InstanceActionsProps {
  onCreateInstance: () => void;
  onGenerateInstances: () => void;
}

const InstanceActions: React.FC<InstanceActionsProps> = ({
  onCreateInstance,
  onGenerateInstances
}) => {
  return (
    <div className="flex space-x-3">
      <Button 
        onClick={onGenerateInstances}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Zap className="h-4 w-4 mr-2" />
        Generate Instances
      </Button>
      <Button 
        onClick={onCreateInstance}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Instance
      </Button>
    </div>
  );
};

export default InstanceActions; 