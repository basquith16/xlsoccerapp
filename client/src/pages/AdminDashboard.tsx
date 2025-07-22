import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  BarChart3, 
  Home,
  Menu,
  X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Error from '../components/ui/Error';
import SessionsManagement from '../components/admin/SessionsManagement';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

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
    { id: 'users', label: 'Users', icon: Users, description: 'Manage user accounts' },
    { id: 'players', label: 'Players', icon: Users, description: 'Manage player profiles' },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar, description: 'Session scheduling' },
    { id: 'financials', label: 'Financials', icon: DollarSign, description: 'Financial records & taxes' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Reports & insights' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'System configuration' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'sessions':
        return <SessionsManagement />;
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add User
              </button>
            </div>
            <Card>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">User management interface coming soon...</p>
              </div>
            </Card>
          </div>
        );
      case 'players':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Player Management</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Add Player
              </button>
            </div>
            <Card>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Player management interface coming soon...</p>
              </div>
            </Card>
          </div>
        );
      case 'scheduling':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Session Scheduling</h2>
            <Card>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Scheduling interface coming soon...</p>
              </div>
            </Card>
          </div>
        );
      case 'financials':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Financial Records</h2>
            <Card>
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Financial interface coming soon...</p>
              </div>
            </Card>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
            <Card>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Analytics interface coming soon...</p>
              </div>
            </Card>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            <Card>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Settings interface coming soon...</p>
              </div>
            </Card>
          </div>
        );
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content area */}
      <div className="flex flex-1 h-[calc(100vh-110px)]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed top-[110px] left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:top-0 lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`} style={{ height: 'calc(100vh - 110px)' }}>
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
            <div className="flex items-center justify-between h-16 px-4">
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
      <Footer />
    </div>
  );
};

export default AdminDashboard; 