import React from 'react';

function Header({ isAuthenticated, onLogin, onLogout, principal }) {
  // Format principal for display (show only first 5 and last 5 characters)
  const formatPrincipal = (principal) => {
    if (!principal) return '';
    const principalText = principal.toString();
    if (principalText.length <= 10) return principalText;
    
    return `${principalText.slice(0, 5)}...${principalText.slice(-5)}`;
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="text-blue-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-zap">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">SPARK</h1>
          </div>
          
          <div>
            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="text-sm text-gray-600 mr-4">
                  <span className="font-medium">Principal: </span>
                  <span className="font-mono">{formatPrincipal(principal)}</span>
                </div>
                
                <button 
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
