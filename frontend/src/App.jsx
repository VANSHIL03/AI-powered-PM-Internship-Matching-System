import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfilePage from './pages/StudentProfilePage';
import CompanyDashboard from './pages/CompanyDashboard';
import InternshipsListingPage from './pages/InternshipsListingPage';
import AIMatchingPage from './pages/AIMatchingPage';
import AllocationManagementPage from './pages/AllocationManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { user, isAuthenticated } = useAuth();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <LandingPage setActiveTab={setActiveTab} />;
      case 'auth':
        return <AuthPage setActiveTab={setActiveTab} />;
      case 'student-portal':
        return <StudentDashboard setActiveTab={setActiveTab} />;
      case 'student-profile':
        return <StudentProfilePage setActiveTab={setActiveTab} />;
      case 'company-portal':
        return <CompanyDashboard setActiveTab={setActiveTab} />;
      case 'internships':
        return <InternshipsListingPage setActiveTab={setActiveTab} />;
      case 'ai-matching':
        return <AIMatchingPage setActiveTab={setActiveTab} />;
      case 'admin-optimization':
        return <AllocationManagementPage setActiveTab={setActiveTab} />;
      case 'analytics':
        return <AnalyticsPage setActiveTab={setActiveTab} />;
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1">
        {renderActiveView()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
