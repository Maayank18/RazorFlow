import React, { useState, useEffect } from 'react';
import { auth, db, doc, setDoc, onAuthStateChanged, onSnapshot, signOut } from '../../../src/lib/firebase';
import { INITIAL_STATE } from '../../../src/types';

// Import RazorFlow Views
import { OverviewView } from './views/OverviewView';
import { PlaygroundView } from './views/PlaygroundView';
import { InvestigationsView } from './views/InvestigationsView';
import { AgentRunsView } from './views/AgentRunsView';
import { ApprovalsView } from './views/ApprovalsView';
import { ActionLedgerView } from './views/ActionLedgerView';
import { ContextEngineView } from './views/ContextEngineView';
import { ToolRegistryView } from './views/ToolRegistryView';
import { MemoryView } from './views/MemoryView';
import { SettingsView } from './views/SettingsView';
import { AuthView } from './views/AuthView';
import { DownloadView } from './views/DownloadView';
import { ManualView } from './views/ManualView';

// Layout Components
import { MainLayout } from './components/layout/MainLayout';
import { TopBar } from './components/layout/TopBar';
import { RightPanel } from './components/layout/RightPanel';
import { Sidebar } from './components/layout/Sidebar';

// Hooks
import { usePlayground } from './hooks/usePlayground';
import { useVoiceDictation } from './hooks/useVoiceDictation';

const normalizeGlobalState = (raw) => {
  const source = raw || {};
  return {
    ...INITIAL_STATE,
    ...source,
    messages: Array.isArray(source.messages) ? source.messages : INITIAL_STATE.messages,
    playgroundMessages: Array.isArray(source.playgroundMessages) ? source.playgroundMessages : INITIAL_STATE.playgroundMessages,
    userRole: source.userRole || 'merchant',
    razorpayEnvironment: source.razorpayEnvironment || 'test',
    pendingApprovals: Array.isArray(source.pendingApprovals) ? source.pendingApprovals : [],
    actionLedger: Array.isArray(source.actionLedger) ? source.actionLedger : [],
  };
};

function App() {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [userRole, setUserRole] = useState('merchant');
  
  const DEMO_USER = {
    uid: 'razorflow-demo-merchant',
    email: 'merchant@razorpay.internal',
    displayName: 'RazorFlow Merchant',
  };

  // Auth State
  const [user, setUser] = useState(DEMO_USER);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Unified State Sync
  const [globalState, setGlobalState] = useState(INITIAL_STATE);

  // Custom Hooks
  const { inputText, setInputText, isLoading, handleRun, startNewSession } = usePlayground(globalState, setGlobalState, userRole);
  const { isRecording, toggleRecording } = useVoiceDictation(setInputText);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(DEMO_USER);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleRightPanel = (open) => {
    setIsRightPanelOpen(open);
  };

  const handleTriggerAgent = (promptText) => {
    setActiveMenu('playground');
    handleRun(promptText);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const renderMainContent = () => {
    switch (activeMenu) {
      case 'overview':
        return (
          <OverviewView 
            onTriggerAgent={handleTriggerAgent}
            globalState={globalState}
            userRole={userRole}
            setUserRole={setUserRole}
          />
        );

      case 'investigations':
        return (
          <InvestigationsView 
            onTriggerAgent={handleTriggerAgent}
            onApproveAction={() => setActiveMenu('approvals')}
          />
        );

      case 'agent_runs':
        return <AgentRunsView currentTrace={globalState?.agentRuns?.[0]} />;

      case 'approvals':
        return <ApprovalsView pendingApprovals={globalState?.pendingApprovals} onApproveAction={() => {}} />;

      case 'activity':
        return <ActionLedgerView />;

      case 'context':
        return <ContextEngineView userRole={userRole} />;

      case 'tools':
        return <ToolRegistryView />;

      case 'memory':
        return <MemoryView />;

      case 'settings':
        return <SettingsView userRole={userRole} setUserRole={setUserRole} />;

      case 'download':
        return <DownloadView />;

      case 'manual':
        return <ManualView />;

      case 'playground':
      default:
        return (
          <PlaygroundView 
            isLeftPanelOpen={isLeftPanelOpen}
            setIsLeftPanelOpen={setIsLeftPanelOpen}
            isRightPanelOpen={isRightPanelOpen}
            toggleRightPanel={toggleRightPanel}
            globalState={globalState}
            setGlobalState={setGlobalState}
            inputText={inputText}
            setInputText={setInputText}
            handleRun={handleRun}
            isLoading={isLoading}
            activeMenu={activeMenu}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            startNewSession={startNewSession}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text-primary">
      <Sidebar 
        isLeftPanelOpen={isLeftPanelOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
        onSignOut={handleSignOut}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar 
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          user={user}
          onSignOut={handleSignOut}
          userRole={userRole}
          setUserRole={setUserRole}
        />
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
