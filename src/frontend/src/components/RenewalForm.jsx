import React, { useState, useEffect } from 'react';

function RenewalForm({ handle, sparkRegistry, onRenewSuccess }) {
  const [isRenewing, setIsRenewing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registrationFee, setRegistrationFee] = useState(0);

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

  const handleRenew = async () => {
    if (!handle) return;
    
    setIsRenewing(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Extract handle name without @ prefix
      const handleName = handle.startsWith('@') ? handle.substring(1) : handle;
      
      const result = await sparkRegistry.renewHandle(handleName);
      
      if ('success' in result) {
        setSuccessMessage(`Successfully renewed ${handle}`);
        if (onRenewSuccess) {
          onRenewSuccess();
        }
      } else if ('error' in result) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error renewing handle:', err);
      setError('Failed to renew handle. Please try again.');
    } finally {
      setIsRenewing(false);
    }
  };

  return (
    <div className="border-t mt-4 pt-4">
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
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700">
            Renewal Fee: <span className="font-bold">${registrationFee.toFixed(2)}</span>
          </p>
          <p className="text-gray-600 text-sm">
            Extends registration by 1 year
          </p>
        </div>
        
        <button
          onClick={handleRenew}
          disabled={isRenewing}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isRenewing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isRenewing ? 'Renewing...' : 'Renew Handle'}
        </button>
      </div>
    </div>
  );
}

export default RenewalForm;
