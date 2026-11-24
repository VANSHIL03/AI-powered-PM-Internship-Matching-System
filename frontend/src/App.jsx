import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GlobalTubesBackground from './components/GlobalTubesBackground';

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
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-[#F8FAFC] relative overflow-hidden font-sans selection:bg-[#7C3AED] selection:text-white">
      
      {/* =========================================================================
          GLOBAL 3D INTERACTIVE WEBGL NEON TUBES (Appears in all backgrounds)
          - Follows user's cursor across every single page
          - Whenever any button, link, or tab is pressed, randomizes neon colors!
          ========================================================================= */}
      <GlobalTubesBackground />

      {/* Global Ambient Mesh Gradient Orbs across all pages */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-5%] left-[10%] w-[550px] h-[550px] rounded-full bg-[#3B1E78]/20 blur-[140px] mesh-orb-indigo"></div>
        <div className="absolute top-[25%] right-[5%] w-[500px] h-[500px] rounded-full bg-[#00D4FF]/10 blur-[150px] mesh-orb-cyan"></div>
        <div className="absolute top-[50%] left-[25%] w-[600px] h-[600px] rounded-full bg-[#7C3AED]/15 blur-[160px] mesh-orb-violet"></div>
      </div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 relative z-10">
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
