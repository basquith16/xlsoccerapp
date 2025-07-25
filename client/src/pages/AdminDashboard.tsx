import React, { useState, lazy, Suspense } from 'react';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Layout,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Error from '../components/ui/Error';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import SessionsManagement from '../components/admin/sessions';
import UserManagement from '../components/admin/users';
import PlayerManagement from '../components/admin/players';
import BillingManagement from '../components/admin/billing';
import PageBuilder from '../components/admin/pages';

// Lazy load heavy components with D3 dependencies
const Analytics = lazy(() => import('../components/admin/analytics'));

interface AdminDashboardProps {}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { user } = useAuth();
  const { activeSection, setActiveSection, editPageId } = useAdminNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    { id: 'sessions', label: 'Sessions', icon: Calendar, description: 'Manage sessions, templates, and schedules' },
    { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Financial operations and analytics' },
    { id: 'users', label: 'Users', icon: Users, description: 'Manage user accounts' },
    { id: 'players', label: 'Players', icon: Users, description: 'Manage player profiles' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'View performance metrics' },
    { id: 'pages', label: 'Page Builder', icon: Layout, description: 'Create and manage website pages' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Configure system settings' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'sessions':
        return <SessionsManagement />;
      case 'billing':
        return <BillingManagement />;
      case 'users':
        return <UserManagement />;
      case 'players':
        return <PlayerManagement />;
      case 'analytics':
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }>
            <Analytics />
          </Suspense>
        );
      case 'pages':
        return <PageBuilder initialEditPageId={editPageId} />;
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
        <div className={`fixed top-[80px] left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:top-0 lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'w-16' : 'w-64'}`} style={{ height: 'calc(100vh - 80px)' }}>
          <div className="flex flex-col h-full pt-4">
            {/* Sidebar header */}
            <div className="flex items-center justify-between h-12 px-3 border-b border-gray-200">
              {!sidebarCollapsed && <h1 className="text-sm font-bold text-gray-900">Admin Dashboard</h1>}
              <div className="flex items-center space-x-1">
                {/* Desktop collapse toggle */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
                  title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </button>
                {/* Mobile close button */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto">
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
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative group ${
                        activeSection === item.id
                          ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      
                      {/* Tooltip for collapsed state */}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
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