import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Card from '../../ui/Card';

interface TemplateTableProps {
  templates: any[];
  onViewTemplate: (template: any) => void;
  onEditTemplate: (template: any) => void;
  onDeleteTemplate: (template: any) => void;
}

const TemplateTable: React.FC<TemplateTableProps> = ({
  templates,
  onViewTemplate,
  onEditTemplate,
  onDeleteTemplate
}) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sport
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Periods
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template: any) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 truncate">{template.name}</div>
                    <div className="text-sm text-gray-500 truncate">{template.description}</div>
                    {template.staffOnly && (
                      <div className="text-xs text-orange-600 font-medium">Staff Only</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {template.sport} - {template.demo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${template.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {template.rosterLimit} players
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {template.activePeriodsCount || 0} active
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    template.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewTemplate(template)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Template"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEditTemplate(template)}
                      className="text-green-600 hover:text-green-900"
                      title="Edit Template"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTemplate(template)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {templates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No templates found</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TemplateTable; 