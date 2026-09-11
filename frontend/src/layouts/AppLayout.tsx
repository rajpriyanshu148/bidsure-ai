import React from 'react';
import { Outlet } from 'react-router-dom';
import { ConsoleHeader } from '../components/layout/ConsoleHeader';
import { ConsoleSidebar } from '../components/layout/ConsoleSidebar';
import { GovernmentDisclaimerBanner } from '../components/GovernmentDisclaimerBanner';
import { AmbientBackground } from '../components/layout/AmbientBackground';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bidsure-bg flex flex-col font-sans relative">
      {/* Ambient background light */}
      <AmbientBackground intensity="subtle" />

      {/* Top Header */}
      <ConsoleHeader />

      {/* Official Government Disclaimer Banner */}
      <GovernmentDisclaimerBanner />

      {/* Body with Sidebar & Content */}
      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <ConsoleSidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
