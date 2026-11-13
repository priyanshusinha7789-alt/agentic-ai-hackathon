import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { AttackLabPage } from './pages/AttackLabPage';
import { GatewayPage } from './pages/GatewayPage';
import { PolicyCentrePage } from './pages/PolicyCentrePage';
import { ThreatExplorerPage } from './pages/ThreatExplorerPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { TeamPage } from './pages/TeamPage';
import { AssistantPage } from './pages/AssistantPage';
import { JudgeDemoPage } from './pages/JudgeDemoPage';

export function App() {
  const [activePage, setActivePage] = useState<string>('landing');
  const [protectedMode, setProtectedMode] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleToggleProtectedMode = () => {
    setProtectedMode((prev) => !prev);
  };

  const isLanding = activePage === 'landing';

  // Synchronize document body background with active view
  React.useEffect(() => {
    if (isLanding) {
      document.body.style.backgroundColor = '#343B2B';
    } else {
      document.body.style.backgroundColor = '#F7F5EF';
    }
  }, [isLanding]);

  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return (
          <LandingPage
            onNavigate={setActivePage}
            protectedMode={protectedMode}
            onToggleProtectedMode={handleToggleProtectedMode}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={setActivePage}
            protectedMode={protectedMode}
          />
        );
      case 'playground':
        return (
          <PlaygroundPage
            protectedMode={protectedMode}
            onToggleProtectedMode={handleToggleProtectedMode}
            onNavigate={setActivePage}
          />
        );
      case 'attack-lab':
        return (
          <AttackLabPage
            protectedMode={protectedMode}
            onToggleProtectedMode={handleToggleProtectedMode}
            onNavigate={setActivePage}
          />
        );
      case 'gateway':
        return (
          <GatewayPage
            protectedMode={protectedMode}
            onNavigate={setActivePage}
          />
        );
      case 'policies':
        return <PolicyCentrePage onNavigate={setActivePage} />;
      case 'threats':
        return <ThreatExplorerPage onNavigate={setActivePage} />;
      case 'audit':
        return <AuditLogsPage onNavigate={setActivePage} />;
      case 'benchmark':
        return <BenchmarkPage onNavigate={setActivePage} />;
      case 'assistant':
        return <AssistantPage onNavigate={setActivePage} protectedMode={protectedMode} />;
      case 'judge-demo':
        return <JudgeDemoPage onNavigate={setActivePage} protectedMode={protectedMode} />;
      case 'team':
        return <TeamPage onNavigate={setActivePage} />;
      default:
        return (
          <LandingPage
            onNavigate={setActivePage}
            protectedMode={protectedMode}
            onToggleProtectedMode={handleToggleProtectedMode}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased ${isLanding ? 'bg-olive-deep text-white' : 'bg-ivory text-charcoal'}`}>
      {/* Top Header */}
      <Navbar
        protectedMode={protectedMode}
        onToggleProtectedMode={handleToggleProtectedMode}
        activePage={activePage}
        onNavigate={setActivePage}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* Main Container */}
      {isLanding ? (
        // Full-screen, spacious Landing Page view with dark canvas and crisp white cards
        <main className="w-full flex-1 bg-olive-deep">
          {renderActivePage()}
        </main>
      ) : (
        // Dedicated Enterprise SaaS Console view with Deep Olive Sidebar & Ivory Content
        <div className="flex flex-1 w-full bg-[#F7F5EF] min-h-[calc(100vh-4.5rem)]">
          <Sidebar
            activePage={activePage}
            onNavigate={setActivePage}
            protectedMode={protectedMode}
            mobileMenuOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4.5rem)] bg-[#F7F5EF] text-charcoal w-full">
            {renderActivePage()}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
