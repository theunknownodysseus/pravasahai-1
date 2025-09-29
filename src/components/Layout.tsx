import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Map, 
  Users, 
  AlertTriangle, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['government_official', 'doctor'] },
    { name: 'Health Map', href: '/map', icon: Map, roles: ['government_official', 'doctor'] },
    { name: 'Patients', href: '/patients', icon: Users, roles: ['doctor'] },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle, roles: ['government_official', 'doctor'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['government_official', 'doctor', 'migrant'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(profile?.role || '')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">KH</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">പ്രവാസാശൈ</h1>
                  <p className="text-xs text-gray-600">Kerala Migrant Health</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === item.href
                      ? 'text-blue-900 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-600 capitalize">{profile?.role?.replace('_', ' ')}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
              <div className="px-3 py-2 border-b border-gray-200 mb-2">
                <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-600 capitalize">{profile?.role?.replace('_', ' ')}</p>
              </div>
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
                    location.pathname === item.href
                      ? 'text-blue-900 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-900 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <p className="text-sm text-gray-600">
                © 2025 Government of Kerala - Health Department
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-900">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-900">Terms of Service</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-900">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;