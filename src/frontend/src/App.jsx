import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';

import Header from './components/Header';
import RegisterForm from './components/RegisterForm';
import HandleStatus from './components/HandleStatus';
import CredentialManager from './components/CredentialManager';
import RenewalForm from './components/RenewalForm';

// Import mock services instead of actual canister actors
import { mockSparkRegistry, mockCredentialManager, mockAuth } from './utils/mockService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [agent, setAgent] = useState(null);
  const [sparkRegistry, setSparkRegistry] = useState(null);
  const [credentialManager, setCredentialManager] = useState(null);
  const [registeredHandles, setRegisteredHandles] = useState([]);
  const [activeTab, setActiveTab] = useState('register');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with mock auth for demo
  useEffect(() => {
    const initMockAuth = async () => {
      try {
        // Simulate authentication check
        const { isAuthenticated, principal: userPrincipal } = await mockAuth.checkAuth();
        
        setIsAuthenticated(isAuthenticated);
        setPrincipal(userPrincipal);
        
        // Set mock services
        setSparkRegistry(mockSparkRegistry);
        setCredentialManager(mockCredentialManager);
        
        if (isAuthenticated && userPrincipal) {
          // Load user's registered handles
          const handles = await mockSparkRegistry.getHandlesByOwner(userPrincipal);
          setRegisteredHandles(handles);
        }
      } catch (error) {
        console.error('Error initializing mock authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initMockAuth();
  }, []);

  const handleLogin = async () => {
    // Use mock authentication
    const { authClient, principal: userPrincipal } = await mockAuth.login();
    
    if (userPrincipal) {
      setIsAuthenticated(true);
      setPrincipal(userPrincipal);
      setSparkRegistry(mockSparkRegistry);
      setCredentialManager(mockCredentialManager);
      
      // Load user's registered handles
      const handles = await mockSparkRegistry.getHandlesByOwner(userPrincipal);
      setRegisteredHandles(handles);
    }
  };

  const handleLogout = async () => {
    await mockAuth.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setAgent(null);
    setSparkRegistry(null);
    setCredentialManager(null);
    setRegisteredHandles([]);
  };

  const refreshHandles = async () => {
    if (sparkRegistry && principal) {
      const handles = await sparkRegistry.getHandlesByOwner(principal);
      setRegisteredHandles(handles);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        isAuthenticated={isAuthenticated} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        principal={principal} 
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to SPARK</h2>
            <p className="text-xl text-gray-600 mb-8">Secure Protocol for Agentic Registry and Keying</p>
            <button 
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-200"
            >
              Login with Internet Identity
            </button>
            <div className="mt-12 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">About SPARK</h3>
              <p className="text-gray-700 mb-4">
                SPARK is a decentralized application running on the Internet Computer blockchain that enables:
              </p>
              <ul className="text-gray-700 list-disc pl-6 space-y-2 text-left">
                <li>Registration of unique agent names/handles</li>
                <li>Temporary credential issuance for agent interactions</li>
                <li>Decentralized identity management for autonomous agents</li>
              </ul>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8 flex border-b">
              <button 
                className={`py-3 px-6 ${activeTab === 'register' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('register')}
              >
                Register Handle
              </button>
              <button 
                className={`py-3 px-6 ${activeTab === 'handles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('handles')}
              >
                My Handles
              </button>
              <button 
                className={`py-3 px-6 ${activeTab === 'credentials' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('credentials')}
              >
                Credentials
              </button>
            </div>
            
            {activeTab === 'register' && (
              <RegisterForm 
                sparkRegistry={sparkRegistry} 
                onRegisterSuccess={refreshHandles} 
              />
            )}
            
            {activeTab === 'handles' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Registered Handles</h2>
                {registeredHandles.length === 0 ? (
                  <p className="text-gray-600">You don't have any registered handles yet.</p>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {registeredHandles.map((handle, index) => (
                      <div key={index}>
                        <HandleStatus 
                          handle={handle} 
                        />
                        <RenewalForm 
                          handle={handle.handle} 
                          sparkRegistry={sparkRegistry}
                          onRenewSuccess={refreshHandles}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'credentials' && (
              <CredentialManager 
                credentialManager={credentialManager}
                sparkRegistry={sparkRegistry} 
                registeredHandles={registeredHandles}
                principal={principal}
              />
            )}
          </div>
        )}
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">SPARK</h3>
              <p className="text-gray-400">Secure Protocol for Agentic Registry and Keying</p>
            </div>
            <div>
              <p className="text-gray-400">Built on the Internet Computer</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
