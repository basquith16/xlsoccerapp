import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../../ui/Button';

interface TemplateActionsProps {
  onCreateTemplate: () => void;
}

const TemplateActions: React.FC<TemplateActionsProps> = ({
  onCreateTemplate
}) => {
  return (
    <Button 
      onClick={onCreateTemplate}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Template
    </Button>
  );
};

export default TemplateActions; 