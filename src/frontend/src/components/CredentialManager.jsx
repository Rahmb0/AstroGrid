import React, { useState, useEffect } from 'react';

function CredentialManager({ credentialManager, sparkRegistry, registeredHandles, principal }) {
  const [selectedHandle, setSelectedHandle] = useState('');
  const [scope, setScope] = useState('');
  const [duration, setDuration] = useState(24); // Default 24 hours
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [issuingCredential, setIssuingCredential] = useState(false);
  const [userCredentials, setUserCredentials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCredentialId, setActiveCredentialId] = useState(null);
  const [activeCredentialDetails, setActiveCredentialDetails] = useState(null);

  useEffect(() => {
    // If there's only one handle, select it by default
    if (registeredHandles.length === 1) {
      setSelectedHandle(registeredHandles[0].handle);
    }
    
    // Load user's credentials when component mounts
    loadUserCredentials();
  }, [credentialManager, principal]);

  const loadUserCredentials = async () => {
    if (!credentialManager || !principal) return;
    
    setIsLoading(true);
    try {
      const credentials = await credentialManager.getCredentialsByOwner(principal);
      setUserCredentials(credentials);
    } catch (err) {
      console.error('Error loading credentials:', err);
      setError('Failed to load credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedHandle) {
      setError('Please select a handle');
      return;
    }
    
    if (!scope) {
      setError('Please enter a scope for the credential');
      return;
    }
    
    if (!duration || duration <= 0) {
      setError('Please enter a valid duration');
      return;
    }
    
    setIssuingCredential(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Format scopes as an array (split by commas)
      const scopeArray = scope.split(',').map(s => s.trim());
      
      // Convert duration from hours to seconds
      const durationSeconds = Math.floor(duration * 60 * 60);
      
      const request = {
        handle: selectedHandle,
        scope: scopeArray,
        duration: durationSeconds
      };
      
      const result = await credentialManager.issueCredential(request);
      
      if ('success' in result) {
        setSuccessMessage(`Successfully issued credential with ID: ${result.success.id}`);
        setScope('');
        setDuration(24);
        // Reload the user's credentials
        await loadUserCredentials();
      } else if ('error' in result) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error issuing credential:', err);
      setError('Failed to issue credential. Please try again.');
    } finally {
      setIssuingCredential(false);
    }
  };

  const handleVerifyCredential = async (credentialId) => {
    if (!credentialId) return;
    
    try {
      const result = await credentialManager.verifyCredential(credentialId);
      
      if ('valid' in result) {
        setActiveCredentialId(credentialId);
        setActiveCredentialDetails(result.valid);
        setError('');
      } else if ('invalid' in result) {
        setError(`Credential is invalid: ${result.invalid}`);
        setActiveCredentialId(null);
        setActiveCredentialDetails(null);
      }
    } catch (err) {
      console.error('Error verifying credential:', err);
      setError('Failed to verify credential. Please try again.');
    }
  };

  const handleRevokeCredential = async (credentialId) => {
    if (!credentialId) return;
    
    try {
      const result = await credentialManager.revokeCredential(credentialId);
      
      if (result) {
        setSuccessMessage('Credential successfully revoked');
        // Reload the user's credentials
        await loadUserCredentials();
        
        // Clear active credential if it was the one revoked
        if (activeCredentialId === credentialId) {
          setActiveCredentialId(null);
          setActiveCredentialDetails(null);
        }
      } else {
        setError('Failed to revoke credential');
      }
    } catch (err) {
      console.error('Error revoking credential:', err);
      setError('Failed to revoke credential. Please try again.');
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes`;
    } else if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)} hours`;
    } else {
      return `${Math.floor(seconds / 86400)} days`;
    }
  };

  // Format date
  const formatDate = (nanoseconds) => {
    const milliseconds = Number(nanoseconds) / 1000000;
    return new Date(milliseconds).toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Request Credential</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="handle" className="block text-gray-700 font-medium mb-2">
              Handle
            </label>
            {registeredHandles.length === 0 ? (
              <p className="text-yellow-600">
                You don't have any registered handles. Please register a handle first.
              </p>
            ) : (
              <select
                id="handle"
                value={selectedHandle}
                onChange={(e) => setSelectedHandle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a handle</option>
                {registeredHandles.map((handle, index) => (
                  <option key={index} value={handle.handle}>
                    {handle.handle}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="scope" className="block text-gray-700 font-medium mb-2">
              Scope (comma separated)
            </label>
            <input
              type="text"
              id="scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              placeholder="read,write,admin"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-600 text-sm mt-1">
              Define what this credential can be used for
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="duration" className="block text-gray-700 font-medium mb-2">
              Duration (hours)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10))}
              min="1"
              max="720" // Max 30 days
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-600 text-sm mt-1">
              How long this credential will be valid (1-720 hours)
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={issuingCredential || registeredHandles.length === 0}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                issuingCredential || registeredHandles.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {issuingCredential ? 'Issuing...' : 'Issue Credential'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Your Credentials</h2>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        ) : userCredentials.length === 0 ? (
          <p className="text-gray-600">You don't have any credentials yet.</p>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Credential List</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Handle
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCredentials.map((credential, index) => {
                      const isActive = credential.active;
                      const isExpired = Number(credential.expiresAt) <= (Date.now() * 1000000);
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">
                            <span className="font-mono">{credential.id}</span>
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">
                            {credential.handle}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${!isActive 
                                ? 'bg-red-100 text-red-800' 
                                : isExpired 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'}`}>
                              {!isActive 
                                ? 'Revoked' 
                                : isExpired 
                                  ? 'Expired' 
                                  : 'Active'}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b border-gray-200 text-sm">
                            <button
                              onClick={() => handleVerifyCredential(credential.id)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                            >
                              Verify
                            </button>
                            {isActive && !isExpired && (
                              <button
                                onClick={() => handleRevokeCredential(credential.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {activeCredentialId && activeCredentialDetails && (
              <div className="border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-semibold mb-2">Credential Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID:</p>
                    <p className="font-mono">{activeCredentialId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Handle:</p>
                    <p>{activeCredentialDetails.credential.handle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Scope:</p>
                    <p>{activeCredentialDetails.credential.scope.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status:</p>
                    <p className="text-green-600 font-medium">Valid</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issued:</p>
                    <p>{formatDate(activeCredentialDetails.credential.issuedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expires:</p>
                    <p>{formatDate(activeCredentialDetails.credential.expiresAt)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Time Remaining:</p>
                    <p className="text-blue-600 font-medium">
                      {formatTimeRemaining(Number(activeCredentialDetails.remainingTime))}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CredentialManager;
