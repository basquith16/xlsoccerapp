import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Error from '../components/ui/Error';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SessionsManagement from '../components/admin/SessionsManagement';
import SessionTemplateManagement from '../components/admin/SessionTemplateManagement';
import SchedulePeriodManagement from '../components/admin/SchedulePeriodManagement';
import SessionInstanceManagement from '../components/admin/SessionInstanceManagement';
import UserManagement from '../components/admin/users';
import PlayerManagement from '../components/admin/players';
import BillingManagement from '../components/admin/billing';

interface AdminDashboardProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('sessions');

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center">
            <Error message="Access Denied - Admin privileges required" />
          </div>
        </Card>
      </div>
    );
  }

  const navigationItems = [
    { id: 'sessions', label: 'Sessions', icon: Calendar, description: 'Manage soccer sessions' },
    { id: 'templates', label: 'Templates', icon: Calendar, description: 'Manage session templates' },
    { id: 'periods', label: 'Periods', icon: Calendar, description: 'Manage schedule periods' },
    { id: 'instances', label: 'Instances', icon: Calendar, description: 'Manage session instances' },
    { id: 'users', label: 'Users', icon: Users, description: 'Manage user accounts' },
    { id: 'players', label: 'Players', icon: Users, description: 'Manage player profiles' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'View financial records' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'View performance metrics' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Configure system settings' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'sessions':
        return <SessionsManagement />;
      case 'templates':
        return <SessionTemplateManagement />;
      case 'periods':
        return <SchedulePeriodManagement />;
      case 'instances':
        return <SessionInstanceManagement />;
      case 'users':
        return <UserManagement />;
      case 'players':
        return <PlayerManagement />;
      case 'billing':
        return <BillingManagement />;
      case 'analytics':
        return (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">System settings coming soon...</p>
          </div>
        );
      default:
        return <SessionsManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content area */}
      <div className="flex flex-1 h-[calc(100vh-80px-32px)]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed top-[80px] left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:top-0 lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`} style={{ height: 'calc(100vh - 80px)' }}>
          <div className="flex flex-col h-full pt-4">
            {/* Sidebar header */}
            <div className="flex items-center justify-between h-12 px-6 border-b border-gray-200">
              <h1 className="text-sm font-bold text-gray-900">Admin Dashboard</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeSection === item.id
                          ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-20 px-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-medium text-gray-900">Admin Dashboard</h1>
              <div className="w-6" /> {/* Spacer for centering */}
            </div>
          </div>

          {/* Page content */}
          <main className="px-12 py-8 overflow-x-auto">
            <div className="max-w-full">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <Footer compact />
    </div>
  );
};

export default AdminDashboard; 