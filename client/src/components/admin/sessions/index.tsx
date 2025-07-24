import React, { useState } from 'react';
import { 
  Calendar,
  FileText,
  Clock,
  CalendarDays,
  List
} from 'lucide-react';
import Card from '../../ui/Card';
import SessionsOverview from './SessionsOverview';
import SessionTemplates from '../session-templates';
import SchedulePeriods from '../schedule-periods';
import SessionInstances from '../session-instances';

interface SessionsManagementProps {}

const SessionsManagement: React.FC<SessionsManagementProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigationItems = [
    { 
      id: 'overview', 
      label: 'Sessions Overview', 
      icon: Calendar, 
      description: 'View and manage all sessions' 
    },
    { 
      id: 'templates', 
      label: 'Templates', 
      icon: FileText, 
      description: 'Create and manage session templates' 
    },
    { 
      id: 'periods', 
      label: 'Schedule Periods', 
      icon: Clock, 
      description: 'Define recurring schedule periods' 
    },
    { 
      id: 'instances', 
      label: 'Instances', 
      icon: CalendarDays, 
      description: 'Manage individual session instances' 
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <SessionsOverview />;
      case 'templates':
        return <SessionTemplates />;
      case 'periods':
        return <SchedulePeriods />;
      case 'instances':
        return <SessionInstances />;
      default:
        return <SessionsOverview />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Session Management</h2>
          <p className="text-sm md:text-base text-gray-600">Comprehensive session administration and scheduling</p>
        </div>
        <Card className="px-3 md:px-4 py-2">
          <div className="flex items-center space-x-2">
            <List className="h-4 w-4 text-blue-600" />
            <span className="text-xs md:text-sm font-medium text-gray-900">
              {activeTab === 'overview' ? 'All Sessions' : navigationItems.find(item => item.id === activeTab)?.label}
            </span>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === item.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Content Area */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default SessionsManagement;