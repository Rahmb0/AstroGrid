import React from 'react';

function HandleStatus({ handle }) {
  // Convert nanoseconds to date string
  const formatDate = (nanoseconds) => {
    const milliseconds = Number(nanoseconds) / 1000000;
    return new Date(milliseconds).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate days remaining until expiration
  const getDaysRemaining = (expiresAt) => {
    const now = Date.now() * 1000000; // Current time in nanoseconds
    const diff = Number(expiresAt) - now;
    return Math.max(0, Math.floor(diff / (1000000 * 86400000))); // Convert to days
  };

  // Check if handle is expired
  const isExpired = () => {
    const now = Date.now() * 1000000; // Current time in nanoseconds
    return Number(handle.expiresAt) <= now;
  };

  const daysRemaining = getDaysRemaining(handle.expiresAt);
  const expired = isExpired();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{handle.handle}</h3>
          <p className="text-gray-600 mt-1">
            Registered: {formatDate(handle.registeredAt)}
          </p>
          {handle.renewed > 0 && (
            <p className="text-gray-600">
              Renewals: {handle.renewed}
            </p>
          )}
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium 
          ${expired 
            ? 'bg-red-100 text-red-800' 
            : daysRemaining <= 30 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'}`}>
          {expired 
            ? 'Expired' 
            : daysRemaining <= 30 
              ? `${daysRemaining} days left` 
              : 'Active'}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Expiration Date</h4>
        <p className={`${expired ? 'text-red-600' : 'text-gray-800'}`}>
          {formatDate(handle.expiresAt)}
        </p>
      </div>
      
      {expired && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0 text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                This handle has expired and may be registered by someone else.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!expired && daysRemaining <= 30 && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0 text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your handle is expiring soon. Please renew to maintain ownership.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HandleStatus;
