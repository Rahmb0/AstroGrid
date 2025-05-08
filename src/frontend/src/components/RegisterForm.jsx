import React, { useState, useEffect } from 'react';

function RegisterForm({ sparkRegistry, onRegisterSuccess }) {
  const [handle, setHandle] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Regular expression to validate handle (lowercase letters, numbers, and hyphens only)
  const handlePattern = /^[a-z0-9-]+$/;

  useEffect(() => {
    // Fetch registration fee when component mounts
    const getRegistrationFee = async () => {
      if (sparkRegistry) {
        try {
          const fee = await sparkRegistry.getRegistrationFee();
          setRegistrationFee(Number(fee) / 100); // Convert cents to dollars
        } catch (err) {
          console.error('Error fetching registration fee:', err);
        }
      }
    };

    getRegistrationFee();
  }, [sparkRegistry]);

  // Function to check handle availability
  const checkAvailability = async () => {
    if (!handle) return;
    
    // Validate handle format
    if (!handlePattern.test(handle)) {
      setError('Handle can only contain lowercase letters, numbers, and hyphens');
      setIsAvailable(false);
      return;
    }
    
    if (handle.length > 20) {
      setError('Handle must be 20 characters or less');
      setIsAvailable(false);
      return;
    }
    
    setIsChecking(true);
    setError('');
    
    try {
      const available = await sparkRegistry.isHandleAvailable(handle);
      setIsAvailable(available);
      
      if (!available) {
        setError('This handle is already taken');
      }
    } catch (err) {
      console.error('Error checking handle availability:', err);
      setError('Failed to check availability. Please try again.');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setHandle(value);
    setIsAvailable(null);
    setError('');
    setSuccessMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!handle) {
      setError('Please enter a handle');
      return;
    }
    
    if (!handlePattern.test(handle)) {
      setError('Handle can only contain lowercase letters, numbers, and hyphens');
      return;
    }
    
    if (handle.length > 20) {
      setError('Handle must be 20 characters or less');
      return;
    }
    
    // If availability hasn't been checked yet, check it now
    if (isAvailable === null) {
      await checkAvailability();
      // If checkAvailability sets isAvailable to false, the next condition will prevent registration
    }
    
    if (isAvailable === false) {
      return; // Don't proceed if handle is not available
    }
    
    setIsRegistering(true);
    setError('');
    
    try {
      const result = await sparkRegistry.registerHandle(handle);
      
      if ('success' in result) {
        setSuccessMessage(`Successfully registered @${handle}`);
        setHandle('');
        setIsAvailable(null);
        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      } else if ('error' in result) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error registering handle:', err);
      setError('Failed to register handle. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">Register a Handle</h2>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="handle" className="block text-gray-700 font-medium mb-2">
            Handle
          </label>
          <div className="flex">
            <span className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l-md border border-gray-300 flex items-center">
              @
            </span>
            <input
              type="text"
              id="handle"
              value={handle}
              onChange={handleInputChange}
              className="flex-grow border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="agent007"
              maxLength={20}
            />
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Only lowercase letters, numbers, and hyphens. Max 20 characters.
          </p>
          
          {handle && (
            <button
              type="button"
              onClick={checkAvailability}
              disabled={isChecking}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {isChecking ? 'Checking...' : 'Check availability'}
            </button>
          )}
          
          {isAvailable === true && (
            <p className="text-green-600 text-sm mt-1">
              <span className="inline-block mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </span>
              Available!
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700">
            Registration Fee: <span className="font-bold">${registrationFee.toFixed(2)}</span> per year
          </p>
          <p className="text-gray-600 text-sm">
            Paid in Internet Computer tokens (ICP)
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isRegistering || (isAvailable === false)}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isRegistering || (isAvailable === false)
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRegistering ? 'Registering...' : 'Register Handle'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;
